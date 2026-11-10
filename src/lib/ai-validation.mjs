export const allowedModels = ['gpt-6-luna', 'gpt-6.1-terra', 'gpt-6.1-sol', 'gpt-6-astra'];

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const integer = (value, min, max) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
};

export function validateAssistantConfig(raw) {
  const assistantId = clean(raw.assistant_id, 36);
  const systemPrompt = clean(raw.system_prompt, 8000);
  const greeting = clean(raw.greeting, 600);
  const teachingGuidance = clean(raw.teaching_guidance, 3000);
  const forbiddenContent = clean(raw.forbidden_content, 3000);
  const model = clean(raw.model, 80);
  const reasoningEffort = clean(raw.reasoning_effort, 10);
  const maxOutputTokens = integer(raw.max_output_tokens, 100, 1200);
  const dailyRequestLimit = integer(raw.daily_request_limit, 1, 200);
  const inputCost = integer(raw.input_cost_microusd_per_million, 0, 1000000000);
  const outputCost = integer(raw.output_cost_microusd_per_million, 0, 1000000000);
  if (!/^[0-9a-f-]{36}$/i.test(assistantId) || !systemPrompt || !greeting ||
      !teachingGuidance || !forbiddenContent || !allowedModels.includes(model) ||
      !['none','low','medium'].includes(reasoningEffort) || maxOutputTokens === null ||
      dailyRequestLimit === null || inputCost === null || outputCost === null) return null;
  return {
    assistant_id: assistantId, system_prompt: systemPrompt, greeting,
    teaching_guidance: teachingGuidance, forbidden_content: forbiddenContent,
    provider: 'openai', model, reasoning_effort: reasoningEffort,
    max_output_tokens: maxOutputTokens, daily_request_limit: dailyRequestLimit,
    input_cost_microusd_per_million: inputCost,
    output_cost_microusd_per_million: outputCost,
  };
}

export function validateChatInput(raw) {
  const slug = clean(raw?.slug, 100);
  const message = clean(raw?.message, 2000);
  const imageDataUrl = validateImageDataUrl(raw?.imageDataUrl);
  const conversationId = clean(raw?.conversationId, 36);
  const grade = integer(raw?.grade, 1, 5);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || (!message && !imageDataUrl) || grade === null) return null;
  if (raw?.imageDataUrl && !imageDataUrl) return null;
  if (conversationId && !/^[0-9a-f-]{36}$/i.test(conversationId)) return null;
  return imageDataUrl
    ? { slug, message, imageDataUrl, grade, conversationId: conversationId || null }
    : { slug, message, grade, conversationId: conversationId || null };
}

export function validateImageDataUrl(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const match = value.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return null;
  const base64 = match[2];
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const decodedBytes = Math.floor(base64.length * 3 / 4) - padding;
  if (decodedBytes < 1 || decodedBytes > 3 * 1024 * 1024) return null;
  const bytes = Buffer.from(base64, 'base64');
  const isPng = match[1] === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isJpeg = match[1] === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = match[1] === 'image/webp' && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (!isPng && !isJpeg && !isWebp) return null;
  return value;
}

export function containsSensitivePersonalData(text) {
  const normalized = String(text || '').toLowerCase();
  return /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(normalized) ||
    /(?:^|\D)0\d{9}(?:\D|$)/.test(normalized) ||
    /\b(mật khẩu|password|địa chỉ nhà|số điện thoại|căn cước|cccd|tài khoản ngân hàng)\b/i.test(normalized);
}

export function estimateMicroUsd(inputTokens, outputTokens, inputRate, outputRate) {
  return Math.ceil((inputTokens * inputRate + outputTokens * outputRate) / 1_000_000);
}

