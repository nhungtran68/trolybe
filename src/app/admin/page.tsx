import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { duplicateAssistant, saveAssistant, saveAssistantConfig } from './actions';

export const dynamic = 'force-dynamic';
type Row = { id:string; name:string; slug:string; description:string; category:string; image_url:string; sort_order:number; status:string; tool_type:string|null };
type Config = { assistant_id:string; version:number; system_prompt:string; greeting:string; teaching_guidance:string; forbidden_content:string; provider:string; model:string; reasoning_effort:string; max_output_tokens:number; daily_request_limit:number; input_cost_microusd_per_million:number; output_cost_microusd_per_million:number };
const labels: Record<string,string> = {draft:'Bản nháp',published:'Đang hiển thị',archived:'Đã lưu trữ'};

function Form({item}:{item?:Row}) {
 return <form action={saveAssistant} className="admin-form">
  {item && <input type="hidden" name="id" value={item.id}/>}
  <label>Tên trợ lý<input required name="name" maxLength={100} defaultValue={item?.name}/></label>
  <label>Đường dẫn <small>Chữ thường không dấu, dùng dấu gạch nối</small><input required name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} defaultValue={item?.slug}/></label>
  <label>Mô tả<textarea required name="description" maxLength={300} rows={2} defaultValue={item?.description}/></label>
  <label>Danh mục<input required name="category" maxLength={80} defaultValue={item?.category}/></label>
  <label>Đường dẫn ảnh <small>Ảnh trên website hoặc đường dẫn HTTPS</small><input required name="image_url" maxLength={1000} defaultValue={item?.image_url ?? ''}/></label>
  <label>Thứ tự<input required name="sort_order" type="number" min={0} max={9999} defaultValue={item?.sort_order ?? 100}/></label>
  <label>Trạng thái<select name="status" defaultValue={item?.status ?? 'draft'}><option value="draft">Bản nháp</option><option value="published">Xuất bản</option><option value="archived">Lưu trữ</option></select></label>
  <label>Công cụ có sẵn<select name="tool_type" defaultValue={item?.tool_type ?? ''}><option value="">Không có</option><option value="rubik">Rubik 3×3</option><option value="logic">Lập trình đường đi</option></select></label>
  <button type="submit">{item ? 'Lưu thay đổi' : 'Tạo trợ lý'}</button>
 </form>;
}
function ConfigForm({item,config}:{item:Row;config?:Config}) {
 return <form action={saveAssistantConfig} className="admin-form ai-config-form">
  <input type="hidden" name="assistant_id" value={item.id}/><input type="hidden" name="slug" value={item.slug}/>
  <h3>Cấu hình AI {config ? `· phiên bản ${config.version}` : '· chưa thiết lập'}</h3>
  <label className="admin-wide">System Prompt<textarea required name="system_prompt" maxLength={8000} rows={8} defaultValue={config?.system_prompt}/></label>
  <label className="admin-wide">Lời chào mặc định<textarea required name="greeting" maxLength={600} rows={2} defaultValue={config?.greeting}/></label>
  <label className="admin-wide">Phương pháp giảng dạy<textarea required name="teaching_guidance" maxLength={3000} rows={4} defaultValue={config?.teaching_guidance}/></label>
  <label className="admin-wide">Những điều AI không được làm<textarea required name="forbidden_content" maxLength={3000} rows={4} defaultValue={config?.forbidden_content}/></label>
  <label>Nhà cung cấp<input readOnly name="provider" value="OpenAI"/></label>
  <label>Model<select name="model" defaultValue={config?.model ?? 'gpt-6-luna'}><option value="gpt-6-luna">GPT-6 Luna · tiết kiệm</option><option value="gpt-6.1-terra">GPT-6.1 Terra · cân bằng</option><option value="gpt-6.1-sol">GPT-6.1 Sol · nâng cao</option><option value="gpt-6-astra">GPT-6 Astra · cao nhất</option></select></label>
  <label>Mức suy luận<select name="reasoning_effort" defaultValue={config?.reasoning_effort ?? 'none'}><option value="none">Không suy luận dài</option><option value="low">Thấp</option><option value="medium">Trung bình</option></select></label>
  <label>Giới hạn đầu ra (token)<input required type="number" name="max_output_tokens" min={100} max={1200} defaultValue={config?.max_output_tokens ?? 500}/></label>
  <label>Lượt tối đa/ngày<input required type="number" name="daily_request_limit" min={1} max={200} defaultValue={config?.daily_request_limit ?? 20}/></label>
  <label>Giá vào (micro-USD/1M token)<input required type="number" name="input_cost_microusd_per_million" min={0} defaultValue={config?.input_cost_microusd_per_million ?? 50000}/></label>
  <label>Giá ra (micro-USD/1M token)<input required type="number" name="output_cost_microusd_per_million" min={0} defaultValue={config?.output_cost_microusd_per_million ?? 250000}/></label>
  <button type="submit">Lưu phiên bản AI mới</button>
 </form>;
}
export default async function Admin({searchParams}:{searchParams:Promise<{result?:string}>}) {
 const db=await createClient(); if(!db) redirect('/dang-nhap?status=config');
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError || !user) redirect('/dang-nhap');
 if(user.app_metadata?.school_role !== 'admin') return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Không có quyền truy cập</h1><p>Trang này dành riêng cho quản trị viên.</p></main>;
 const {data,error}=await db.from('assistants').select('id,name,slug,description,category,image_url,sort_order,status,tool_type').order('sort_order');
 const {data:configs}=await db.from('assistant_configs').select('assistant_id,version,system_prompt,greeting,teaching_guidance,forbidden_content,provider,model,reasoning_effort,max_output_tokens,daily_request_limit,input_cost_microusd_per_million,output_cost_microusd_per_million').eq('active',true);
 const configByAssistant=new Map((configs as Config[]|null)?.map(config=>[config.assistant_id,config]) ?? []);
 const {result}=await searchParams;
 const providerReady=Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
 return <main className="classroom admin-page"><Link href="/">← Trang chủ</Link><h1>Quản lý trợ lý</h1><p>Thêm, sửa, xuất bản và cấu hình bộ não riêng cho từng trợ lý. Mỗi lần lưu AI sẽ tạo một phiên bản mới.</p>
 <p className={providerReady ? 'provider-ready' : 'provider-missing'}>{providerReady ? 'OpenAI đã được kết nối ở phía máy chủ.' : 'OpenAI chưa được kích hoạt: còn thiếu khóa máy chủ trong môi trường triển khai.'}</p>
 {result && <p role="status" className="auth-message">{result === 'saved' ? 'Đã lưu trợ lý.' : result === 'config-saved' ? 'Đã lưu và kích hoạt phiên bản AI mới.' : result === 'duplicated' ? 'Đã tạo bản nháp và sao chép cấu hình AI.' : result === 'partial' ? 'Đã nhân bản trợ lý nhưng chưa sao chép được cấu hình AI.' : result === 'invalid' || result === 'config-invalid' ? 'Thông tin chưa hợp lệ. Hãy kiểm tra lại.' : 'Không thể lưu. Kiểm tra đường dẫn trùng và quyền truy cập.'}</p>}
 <details className="admin-item"><summary>＋ Thêm trợ lý</summary><Form/></details>
 {error ? <p>Không thể tải danh sách quản trị. Kiểm tra cấu hình phân quyền.</p> : (data as Row[]).map(item=><details className="admin-item" key={item.id}><summary>{item.name} <span>{labels[item.status] ?? item.status} · Thứ tự {item.sort_order}</span></summary><Form item={item}/><ConfigForm item={item} config={configByAssistant.get(item.id)}/><form action={duplicateAssistant} className="admin-duplicate"><input type="hidden" name="id" value={item.id}/><button>Nhân bản thành bản nháp</button></form></details>)}
 </main>;
}
