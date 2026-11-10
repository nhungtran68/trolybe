import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RubikLab from "@/components/RubikLab";
import LogicLab from "@/components/LogicLab";
import ChatRoom from "@/components/ChatRoom";
import { getAssistants } from "@/lib/assistants";
import { getAssistantAIConfig } from "@/lib/ai";
export default async function Classroom({params}:{params:Promise<{slug:string}>}) {
 const client = await createClient();
 if (!client) redirect("/dang-nhap?status=config");
 const { data, error } = await client.auth.getClaims();
 if (error || !data?.claims?.sub) redirect("/dang-nhap");
 const {slug}=await params; const {items,mode}=await getAssistants();
 if(mode === 'error') return <main className="classroom"><Link href="/">← Trang chủ</Link><h1>Không thể tải lớp học</h1><p>Hãy thử lại sau nhé.</p></main>;
 const a=items.find(item => item.slug === slug); if(!a) notFound();
 const config=await getAssistantAIConfig(a.id);
 const greeting=config?.greeting || `Chào con! ${a.name} sẵn sàng học cùng con.`;
 const enabled=Boolean(config && process.env.OPENAI_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
 return <main className="classroom"><Link href="/">← Trang chủ</Link><div className="classroom-card"><div className="classroom-image"><Image src={a.image_url} alt="" fill unoptimized={a.image_url.startsWith('https://')} sizes="160px"/></div><div><span className="eyebrow">PHÒNG HỌC CỦA EM</span><h1>{a.name}</h1><p>{a.description}</p></div></div><ChatRoom slug={a.slug} name={a.name} greeting={greeting} enabled={enabled}/>{a.tool_type === 'rubik' && <RubikLab />}{a.tool_type === 'logic' && <LogicLab />}</main>
}
