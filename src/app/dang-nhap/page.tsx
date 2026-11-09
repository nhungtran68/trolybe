import Link from "next/link";
import { authenticate } from "./actions";

const messages: Record<string, string> = {
  config: "Tài khoản chưa được cấu hình. Vui lòng liên hệ người quản trị.",
  invalid: "Vui lòng nhập email và mật khẩu có ít nhất 8 ký tự.",
  "login-error": "Không thể đăng nhập. Kiểm tra email, mật khẩu và xác nhận email.",
  "signup-error": "Không thể tạo tài khoản. Vui lòng thử lại sau.",
  "check-email": "Nếu địa chỉ đủ điều kiện đăng ký, hãy kiểm tra email để xác nhận tài khoản.",
  "callback-error": "Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Hãy thử đăng nhập lại.",
};
export default async function Login({searchParams}: {searchParams: Promise<{status?: string}>}) {
  const {status} = await searchParams;
  const signupEnabled = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  return <main className="classroom"><Link href="/">← Trang chủ</Link><div className="auth-card"><span className="eyebrow">TÀI KHOẢN PHỤ HUYNH</span><h1>Chào mừng trở lại!</h1><p>{signupEnabled ? 'Đăng nhập hoặc tạo tài khoản để vào phòng học.' : 'Đăng nhập bằng tài khoản đã được cấp.'}</p>{status && messages[status] && <p className="auth-message" role="status">{messages[status]}</p>}<form action={authenticate} className="auth-form"><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label><button name="action" value="login">Đăng nhập</button>{signupEnabled && <button name="action" value="signup" className="auth-secondary">Tạo tài khoản</button>}</form>{!signupEnabled && <p>Đăng ký tài khoản mới đang được chuẩn bị.</p>}</div></main>;
}

