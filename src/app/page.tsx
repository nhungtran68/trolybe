import Link from "next/link";
import Image from "next/image";
import { getAssistants } from "@/lib/assistants";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {items, mode} = await getAssistants();
  return <main>
    <header className="header"><Link href="/" className="brand"><span className="brand-icon">✦</span><span>Trường Học AI <small>TẠI NHÀ</small></span></Link><span className="header-note">Một nơi nhỏ cho những ý tưởng lớn</span><Link className="header-badge" href="/tai-khoan">Tài khoản</Link></header>
    <section className="intro"><div><span className="eyebrow">✦ CÙNG NHAU KHÁM PHÁ</span><h1>Hôm nay, mình sẽ <em>học điều gì mới?</em></h1><p>Chọn một người bạn đồng hành và bắt đầu hành trình khám phá của con nhé!</p></div></section>
    <section className="catalog"><div className="section-heading"><div><span className="eyebrow">GẶP GỠ NHỮNG NGƯỜI BẠN AI</span><h2>Chọn trợ lý của con <span>✳</span></h2><p>Mỗi người bạn đều có một điều thú vị để cùng con khám phá.</p></div><span className="count">{items.length} trợ lý</span></div>
    {mode === 'preview' && <p className="preview-notice">Đây là bản xem trước với dữ liệu mẫu. Trò chuyện AI đang được phát triển.</p>}
    {mode === 'error' ? <div className="empty"><strong>Chưa kết nối được thư viện trợ lý</strong><p>Vui lòng kiểm tra cấu hình cơ sở dữ liệu và thử lại.</p></div> : items.length === 0 ? <div className="empty">Chưa có trợ lý nào được xuất bản.</div> : <div className="grid">{items.map(a=><Link className="card" key={a.id} href={`/tro-ly/${a.slug}`}><div className="card-image"><Image src={a.image_url} alt="" fill unoptimized={a.image_url.startsWith('https://')} sizes="(max-width: 600px) 50vw, 33vw" /></div><h3>{a.name}</h3><p>{a.description}</p></Link>)}</div>}
    <div className="practice-links"><strong>Thử góc thực hành</strong><Link href="/thuc-hanh/rubik">Khám phá Rubik →</Link><Link href="/thuc-hanh/lap-trinh">Lập trình đường đi →</Link></div>
    </section><footer>✦ &nbsp; Trường Học AI Tại Nhà <span>Học cùng tò mò. Lớn lên cùng yêu thương.</span></footer>
  </main>
}
