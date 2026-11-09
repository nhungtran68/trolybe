import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/dang-nhap/actions";
export const dynamic = "force-dynamic";
export default async function Account() {
  const client = await createClient();
  if (!client) redirect("/dang-nhap?status=config");
  const { data, error } = await client.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/dang-nhap");
  const {data: {user}} = await client.auth.getUser();
  return <main className="classroom"><Link href="/">← Trang chủ</Link><div className="auth-card"><h1>Tài khoản của bạn</h1><p>Bạn đã đăng nhập.</p><Link href="/">Khám phá các phòng học →</Link>{user?.app_metadata?.school_role === 'admin' && <p><Link href="/admin">Quản lý trợ lý →</Link></p>}<form action={signOut}><button className="auth-secondary">Đăng xuất</button></form></div></main>;
}

