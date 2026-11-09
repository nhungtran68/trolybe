import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import RubikLab from "@/components/RubikLab";
import LogicLab from "@/components/LogicLab";
import { getAssistants } from "@/lib/assistants";
export default async function Classroom({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params; const {items,mode}=await getAssistants();
 if(mode === 'error') return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Không thể tải lớp học</h1><p>Hãy thử lại sau nhé.</p></main>;
 const a=items.find(item => item.slug === slug); if(!a) notFound();
 return <main className="classroom"><Link href="/">← Trang chủ</Link><div className="classroom-card"><div className="classroom-image"><Image src={a.image_url} alt="" fill sizes="160px"/></div><div><span className="eyebrow">PHÒNG HỌC CỦA EM</span><h1>{a.name}</h1><p>{a.description}</p></div></div><div className="empty"><strong>Hội thoại AI đang được xây dựng</strong><p>Phần trò chuyện chưa được kết nối. Hãy quay lại sau nhé!</p></div>{a.tool_type === 'rubik' && <RubikLab />}{a.tool_type === 'logic' && <LogicLab />}</main>
}
