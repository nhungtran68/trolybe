import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
export default async function Classroom({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params; const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key) return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Chưa kết nối được lớp học</h1><p>Vui lòng liên hệ người quản trị.</p></main>;
 const q=new URLSearchParams({select:'name,description,image_url',slug:`eq.${slug}`,status:'eq.published',limit:'1'});
 let list=[]; try { const response=await fetch(`${url}/rest/v1/assistants?${q}`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:'no-store'}); if(!response.ok) throw new Error(); list=await response.json(); } catch { return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Không thể tải lớp học</h1><p>Hãy thử lại sau nhé.</p></main> }
 if(!list.length) notFound(); const a=list[0];
 return <main className="classroom"><Link href="/">← Trang chủ</Link><div className="classroom-card"><div className="classroom-image"><Image src={a.image_url} alt="" fill sizes="160px"/></div><div><span className="eyebrow">PHÒNG HỌC CỦA EM</span><h1>{a.name}</h1><p>{a.description}</p></div></div><div className="empty"><strong>Phòng học đang được xây dựng</strong><p>Hội thoại AI và các công cụ thực hành chưa được kết nối. Hãy quay lại sau nhé!</p></div></main>
}
