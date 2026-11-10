import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createTutorResponse, getAssistantAIConfig, moderateInput, moderateText } from '@/lib/ai';
import { containsSensitivePersonalData, estimateMicroUsd, validateChatInput } from '@/lib/ai-validation.mjs';

export const runtime = 'nodejs';

const json = (body: object, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export async function POST(request: Request) {
  const session = await createClient();
  if (!session) return json({ error: 'Hệ thống đăng nhập chưa được cấu hình.' }, 503);
  const { data: { user }, error: authError } = await session.auth.getUser();
  if (authError || !user) return json({ error: 'Con cần đăng nhập trước khi vào lớp học.' }, 401);

  // OpenAI requires additional safeguards for services used by minors. During
  // the guarded beta, admins can test and students need an explicit server-side flag.
  const role = user.app_metadata?.school_role;
  if (role !== 'admin' && user.app_metadata?.ai_access !== true) {
    return json({ error: 'Phụ huynh cần bật quyền học cùng AI cho tài khoản này.' }, 403);
  }

  let raw: unknown;
  try { raw = await request.json(); } catch { return json({ error: 'Dữ liệu gửi lên chưa hợp lệ.' }, 400); }
  const input = validateChatInput(raw);
  if (!input) return json({ error: 'Câu hỏi hoặc ảnh chưa hợp lệ. Ảnh phải là PNG, JPG hoặc WEBP và không quá 3 MB.' }, 400);
  if (containsSensitivePersonalData(input.message)) {
    return json({ error: 'Con đừng gửi mật khẩu, email, số điện thoại hoặc địa chỉ nhé. Hãy xóa thông tin riêng tư rồi hỏi lại.' }, 400);
  }

  const admin = createAdminClient();
  if (!admin || !process.env.OPENAI_API_KEY) {
    return json({ error: 'Phòng học AI chưa được quản trị viên kích hoạt.' }, 503);
  }
  const { data: assistant, error: assistantError } = await admin.from('assistants')
    .select('id,name,status').eq('slug', input.slug).eq('status', 'published').single();
  if (assistantError || !assistant) return json({ error: 'Không tìm thấy trợ lý này.' }, 404);
  const config = await getAssistantAIConfig(assistant.id);
  if (!config || config.provider !== 'openai') return json({ error: 'Trợ lý này chưa có cấu hình AI hoạt động.' }, 503);

  const { data: usageId, error: reserveError } = await admin.rpc('reserve_ai_turn', {
    p_user_id: user.id, p_assistant_id: assistant.id,
    p_model: config.model, p_daily_limit: config.daily_request_limit,
  });
  if (reserveError) {
    const limited = reserveError.message?.includes('daily_limit_reached');
    return json({ error: limited ? 'Hôm nay con đã dùng hết lượt học AI. Mình nghỉ một chút và quay lại ngày mai nhé.' : 'Chưa thể bắt đầu lượt học này.' }, limited ? 429 : 503);
  }

  const finishUsage = async (values: Record<string, unknown>) => {
    await admin.from('ai_usage').update({ ...values, completed_at: new Date().toISOString() }).eq('id', usageId);
  };

  try {
    const prompt = input.message || 'Hãy xem bài tập trong ảnh, nói con cần làm gì và gợi mở bước đầu tiên. Không cho đáp án ngay.';
    if (await moderateInput(prompt, input.imageDataUrl ?? null)) {
      await finishUsage({ status: 'blocked', error_code: 'input_moderation' });
      return json({ error: 'Câu hỏi này chưa phù hợp với lớp học. Con hãy đổi sang một câu hỏi học tập an toàn nhé.' }, 400);
    }

    let conversationId = input.conversationId;
    let history: Array<{ role: 'user'|'assistant'; content: string }> = [];
    if (conversationId) {
      const { data: conversation } = await admin.from('conversations').select('id,grade')
        .eq('id', conversationId).eq('user_id', user.id).eq('assistant_id', assistant.id).single();
      if (!conversation) {
        await finishUsage({ status: 'failed', error_code: 'conversation_not_found' });
        return json({ error: 'Cuộc học này không còn tồn tại. Con hãy bắt đầu cuộc học mới.' }, 404);
      }
      const { data: rows } = await admin.from('conversation_messages').select('role,content,created_at')
        .eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(8);
      history = (rows || []).reverse().map(row => ({ role: row.role as 'user'|'assistant', content: row.content }));
    } else {
      const { data: conversation, error } = await admin.from('conversations').insert({
        user_id: user.id, assistant_id: assistant.id, grade: input.grade,
        title: (input.message || 'Bài tập bằng hình ảnh').slice(0, 100),
      }).select('id').single();
      if (error || !conversation) throw new Error('conversation_create_failed');
      conversationId = conversation.id;
    }

    await admin.from('conversation_messages').insert({
      conversation_id: conversationId, role: 'user',
      content: input.imageDataUrl ? `[Đính kèm ảnh bài tập]\n${prompt}` : prompt,
      moderation_status: 'passed',
    });
    const result = await createTutorResponse({
      config, grade: input.grade, userId: user.id, history, message: prompt,
      imageDataUrl: input.imageDataUrl,
    });
    if (await moderateText(result.text)) {
      const safeReply = 'Câu trả lời vừa rồi chưa phù hợp để hiển thị. Con hãy hỏi lại theo một cách khác hoặc nhờ người lớn hỗ trợ nhé.';
      await admin.from('conversation_messages').insert({ conversation_id: conversationId, role: 'assistant', content: safeReply, moderation_status: 'blocked' });
      await finishUsage({ status: 'blocked', input_tokens: result.inputTokens, output_tokens: result.outputTokens, provider_request_id: result.id, error_code: 'output_moderation', conversation_id: conversationId });
      return json({ reply: safeReply, conversationId });
    }

    await admin.from('conversation_messages').insert({
      conversation_id: conversationId, role: 'assistant', content: result.text, moderation_status: 'passed',
    });
    const estimated = estimateMicroUsd(result.inputTokens, result.outputTokens,
      config.input_cost_microusd_per_million, config.output_cost_microusd_per_million);
    await finishUsage({
      status: 'completed', input_tokens: result.inputTokens, output_tokens: result.outputTokens,
      estimated_cost_microusd: estimated, provider_request_id: result.id, conversation_id: conversationId,
    });
    return json({ reply: result.text, conversationId });
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 100) : 'unknown_error';
    await finishUsage({ status: 'failed', error_code: code });
    return json({ error: 'Cô/thầy AI đang bận một chút. Con hãy thử lại sau nhé.' }, 502);
  }
}

