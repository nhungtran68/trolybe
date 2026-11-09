import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

type Assistant = { id: string; slug: string; name: string; description: string; image_url: string; category: string };

async function assistants(): Promise<{items: Assistant[]; error: boolean}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { items: [], error: true };
  try {
    const response = await fetch(`${url}/rest/v1/assistants?select=id,slug,name,description,image_url,category&status=eq.published&order=sort_order.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store"
    });
    if (!response.ok) throw new Error("Database unavailable");
    return { items: await response.json(), error: false };
  } catch { return { items: [], error: true }; }
}

export default async function Home() {
  const {items, error} = await assistants();
  return <main>
    <header className="header"><Link href="/" className="brand"><span className="brand-icon">✦</span><span>Trường Học AI <small>TẠI NHÀ</small></span></Link><span className="header-note">Một nơi nhỏ cho những ý tưởng lớn</span><span className="header-badge">Dành cho bé lớp 1–5</span></header>
    <section className="intro"><div><span className="eyebrow">✦ CÙNG NHAU KHÁM PHÁ</span><h1>Hôm nay, mình sẽ<br/><em>học điều gì mới?</em></h1><p>Chọn một người bạn đồng hành và bắt đầu hành trình khám phá của con nhé!</p></div><div className="intro-art" aria-hidden="true"><span>✳</span><span>✦</span><strong>Học vui<br/>mỗi ngày!</strong></div></section>
    <section className="catalog"><div className="section-heading"><div><span className="eyebrow">GẶP GỠ NHỮNG NGƯỜI BẠN AI</span><h2>Chọn trợ lý của con <span>✳</span></h2><p>Mỗi người bạn đều có một điều thú vị để cùng con khám phá.</p></div><span className="count">{items.length} trợ lý</span></div>
    {error ? <div className="empty"><strong>Chưa kết nối được thư viện trợ lý</strong><p>Người quản trị cần cấu hình Supabase và khởi tạo dữ liệu trước khi các lớp học xuất hiện.</p></div> : items.length === 0 ? <div className="empty">Chưa có trợ lý nào được xuất bản.</div> : <div className="grid">{items.map(a=><Link className="card" key={a.id} href={`/tro-ly/${a.slug}`}><div className="card-image"><Image src={a.image_url} alt="" fill sizes="(max-width: 600px) 50vw, 25vw" /></div><span className="category">{a.category}</span><h3>{a.name}</h3><p>{a.description}</p><span className="card-arrow" aria-hidden="true">↗</span></Link>)}</div>}
    </section><footer>✦ &nbsp; Trường Học AI Tại Nhà <span>Học cùng tò mò. Lớn lên cùng yêu thương.</span></footer>
  </main>
}
