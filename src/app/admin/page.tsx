import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { duplicateAssistant, saveAssistant } from './actions';

export const dynamic = 'force-dynamic';
type Row = { id:string; name:string; slug:string; description:string; category:string; image_url:string; sort_order:number; status:string; tool_type:string|null };
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
export default async function Admin({searchParams}:{searchParams:Promise<{result?:string}>}) {
 const db=await createClient(); if(!db) redirect('/dang-nhap?status=config');
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError || !user) redirect('/dang-nhap');
 if(user.app_metadata?.school_role !== 'admin') return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Không có quyền truy cập</h1><p>Trang này dành riêng cho quản trị viên.</p></main>;
 const {data,error}=await db.from('assistants').select('id,name,slug,description,category,image_url,sort_order,status,tool_type').order('sort_order');
 const {result}=await searchParams;
 return <main className="classroom admin-page"><Link href="/">← Trang chủ</Link><h1>Quản lý trợ lý</h1><p>Thêm, sửa, xuất bản hoặc lưu trữ trợ lý. Cấu hình AI đang được phát triển.</p>
 {result && <p role="status" className="auth-message">{result === 'saved' ? 'Đã lưu trợ lý.' : result === 'duplicated' ? 'Đã tạo bản nháp sao chép thông tin cơ bản.' : result === 'invalid' ? 'Thông tin chưa hợp lệ. Hãy kiểm tra lại.' : 'Không thể lưu. Kiểm tra đường dẫn trùng và quyền truy cập.'}</p>}
 <details className="admin-item"><summary>＋ Thêm trợ lý</summary><Form/></details>
 {error ? <p>Không thể tải danh sách quản trị. Kiểm tra cấu hình phân quyền.</p> : (data as Row[]).map(item=><details className="admin-item" key={item.id}><summary>{item.name} <span>{labels[item.status] ?? item.status} · Thứ tự {item.sort_order}</span></summary><Form item={item}/><form action={duplicateAssistant} className="admin-duplicate"><input type="hidden" name="id" value={item.id}/><button>Nhân bản thành bản nháp</button></form></details>)}
 </main>;
}
