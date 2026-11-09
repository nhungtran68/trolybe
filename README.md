# Trường Học AI Tại Nhà — nền tảng đang xây dựng

Ứng dụng Next.js, giao diện tiếng Việt ưu tiên điện thoại. Trang chủ lấy danh sách trợ lý đã xuất bản từ bảng Supabase, không chứa danh sách cố định trong mã giao diện. `supabase/schema.sql` tạo bảng dữ liệu công khai và nạp đúng sáu bản ghi ban đầu; cấu hình nhạy cảm nằm ở bảng riêng bị chặn truy cập từ API công khai. Khi chưa khai báo cả hai biến kết nối, trang hiển thị bản xem trước từ cơ sở dữ liệu SQLite chỉ đọc `data/preview.sqlite`. Đây là dữ liệu mẫu tĩnh, không phải cơ sở dữ liệu thực hay trang quản trị; khi cấu hình Supabase, website dùng Supabase và báo lỗi nếu kết nối thất bại.

## Chạy thử

1. Cài Node.js phiên bản 22.13 trở lên và chạy `npm ci`.
2. Với một dự án Supabase **mới dành riêng cho thử nghiệm**, xem lại `supabase/schema.sql` và chạy nó trong SQL editor. Script chỉ dành cho cơ sở dữ liệu trống và chưa được kiểm thử trên Supabase.
3. Sao chép `.env.example` thành `.env.local`, nhập URL và publishable key của dự án. Không đặt service role key trong biến `NEXT_PUBLIC_`.
4. Đặt `NEXT_PUBLIC_SITE_URL` trong `.env.local` thành địa chỉ chính xác của ứng dụng (ví dụ `http://localhost:3000`). Trong Supabase Auth, bật đăng nhập email/mật khẩu, đặt Site URL và thêm địa chỉ `http://localhost:3000/auth/callback` vào Redirect URLs. Với môi trường triển khai, dùng URL HTTPS tương ứng. Email xác nhận mặc định phải chuyển người dùng đến callback cùng mã PKCE; kiểm tra mẫu email nếu đã tùy chỉnh.
5. Chạy `npm run dev` và mở địa chỉ do Next.js in ra. Tạo tài khoản phụ huynh, xác nhận email nếu dự án yêu cầu, rồi đăng nhập. `/tro-ly/*` và `/tai-khoan` yêu cầu phiên hợp lệ; trang chủ và hai góc thực hành vẫn công khai. Đăng xuất qua trang tài khoản.

Auth cần kết nối Supabase thực; bản xem trước SQLite không tạo tài khoản giả. Cấu hình đăng ký, xác nhận email, SMTP, URL chuyển hướng và giới hạn của Auth phải được kiểm tra trên dự án trước khi sử dụng. Bảo vệ đường dẫn không thay thế RLS cho dữ liệu: mọi bảng hoặc thao tác riêng tư bổ sung phải có kiểm tra quyền trên server và chính sách RLS phù hợp.

Các hình trong `public/assistants` là những cảnh minh họa riêng được tạo bằng AI cho dự án và được tối ưu WebP.

## Góc thực hành

- `/thuc-hanh/rubik`: lưới Rubik 3×3 có sáu phép xoay, xoay ngược, xoay hai lần, duyệt lại các bước và làm lại. Mô hình là lưới 2D; chưa có bộ giải, nhập màu hay mô phỏng 3D.
- `/thuc-hanh/lap-trinh`: trò chơi điều khiển robot trên lưới bằng ba loại lệnh giới hạn, có xem lại từng bước. Không thực thi mã do học sinh viết; chưa phải Scratch hay Python.
- Chạy `npm test` để kiểm tra phép xoay và bộ diễn giải lệnh. Hai góc thực hành có thể mở ngay cả khi chưa cấu hình Supabase.

## Quản trị danh mục đang phát triển

Màn hình `/admin` cho phép quản trị viên thêm, sửa, nhân bản thông tin cơ bản thành bản nháp, xuất bản, lưu trữ và sắp xếp trợ lý. Màn hình chỉ nhận người dùng có `app_metadata.school_role` là `admin`; `user_metadata` không được dùng để cấp quyền. Các chính sách trong `supabase/admin_policies.sql` cần được áp dụng một lần sau `schema.sql`. Trên dự án hiện tại, chính sách đã được kiểm tra trong một giao dịch hoàn tác với các vai trò giả lập trước khi áp dụng.

Tài khoản quản trị đầu tiên phải là một người dùng Supabase Auth đã được xác minh. Quản trị viên dự án cần xác nhận đúng định danh người dùng, đặt `school_role: admin` trong **app metadata** bằng giao diện quản trị hoặc công cụ quản lý đáng tin cậy, sau đó yêu cầu tài khoản đăng nhập lại để làm mới JWT. Không cấp quyền dựa trên email tự nhập hoặc user metadata. Chưa có sẵn mật khẩu quản trị trong mã nguồn. Việc thu hồi quyền cần xử lý cả phiên JWT đang còn hiệu lực.

Trang quản trị hiện chưa cấu hình system prompt, model, giới hạn chi phí, tài liệu hoặc tải ảnh; hình ảnh phải có sẵn qua đường dẫn hợp lệ. Chưa kiểm thử luồng đăng nhập và quản trị từ đầu đến cuối với một tài khoản thật.

## Tình trạng và các việc còn lại

Đây **chưa phải MVP hoàn chỉnh**, chưa phù hợp đưa trẻ sử dụng. Đã có nền tảng đăng nhập email/mật khẩu, bảo vệ phòng học và màn hình quản trị danh mục đang phát triển, nhưng chưa kiểm thử đầy đủ với một tài khoản thực. Chưa có hồ sơ, quan hệ phụ huynh, lịch sử, AI, kiểm duyệt, định mức và ghi chi phí, soạn thảo lập trình, báo cáo hoặc quản lý dữ liệu. Trang phòng học hiện thông báo rõ là hội thoại AI chưa hoàn thành. Bảng cấu hình chưa có dữ liệu và không có đường truy cập công khai. Danh mục công khai hiện đã kết nối Supabase và triển khai Vercel; các thay đổi quản trị cần được phát hành riêng sau kiểm thử.

Trước khi triển khai cần thiết kế và kiểm thử phân quyền server và RLS cho từng vai trò, xác thực phụ huynh và trẻ, cơ chế an toàn nội dung, bảo vệ khóa, giới hạn và kiểm soát chi phí theo người dùng, phòng chống prompt injection, quyền dữ liệu và rà soát pháp lý. Các mô hình và giá cần kiểm tra theo tài liệu nhà cung cấp hiện hành. Đặc biệt không chạy mã Python chưa cách ly trên máy chủ chính; mô phỏng Rubik cần kiểm thử tính đúng đắn của từng phép xoay.
