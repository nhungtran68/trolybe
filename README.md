# Trường Học AI Tại Nhà — nền tảng đang xây dựng

Ứng dụng Next.js, giao diện tiếng Việt ưu tiên điện thoại. Trang chủ lấy danh sách trợ lý đã xuất bản từ bảng Supabase, không chứa danh sách cố định trong mã giao diện. `supabase/schema.sql` tạo bảng dữ liệu công khai và nạp đúng sáu bản ghi ban đầu; cấu hình nhạy cảm nằm ở bảng riêng bị chặn truy cập từ API công khai.

## Chạy thử

1. Cài Node.js và chạy `npm ci`.
2. Với một dự án Supabase **mới dành riêng cho thử nghiệm**, xem lại `supabase/schema.sql` và chạy nó trong SQL editor. Script chỉ dành cho cơ sở dữ liệu trống và chưa được kiểm thử trên Supabase.
3. Sao chép `.env.example` thành `.env.local`, nhập URL và publishable key của dự án. Không đặt service role key trong biến `NEXT_PUBLIC_`.
4. Chạy `npm run dev` và mở địa chỉ do Next.js in ra.

Các hình trong `public/assistants` là những cảnh minh họa riêng được tạo bằng AI cho dự án và được tối ưu WebP.

## Góc thực hành

- `/thuc-hanh/rubik`: lưới Rubik 3×3 có sáu phép xoay, xoay ngược, xoay hai lần, duyệt lại các bước và làm lại. Mô hình là lưới 2D; chưa có bộ giải, nhập màu hay mô phỏng 3D.
- `/thuc-hanh/lap-trinh`: trò chơi điều khiển robot trên lưới bằng ba loại lệnh giới hạn, có xem lại từng bước. Không thực thi mã do học sinh viết; chưa phải Scratch hay Python.
- Chạy `npm test` để kiểm tra phép xoay và bộ diễn giải lệnh. Hai góc thực hành có thể mở ngay cả khi chưa cấu hình Supabase.

## Tình trạng và các việc còn lại

Đây **chưa phải MVP hoàn chỉnh**, chưa phù hợp đưa trẻ sử dụng. Chưa có đăng nhập, hồ sơ, quan hệ phụ huynh, lịch sử, AI, kiểm duyệt, định mức và ghi chi phí, quản trị, soạn thảo lập trình, báo cáo hoặc quản lý dữ liệu. Trang phòng học hiện thông báo rõ là hội thoại AI chưa hoàn thành. Bảng cấu hình chưa có dữ liệu và không có đường truy cập công khai. Chưa kết nối database hoặc kiểm thử RLS, chưa triển khai Vercel.

Trước khi triển khai cần thiết kế và kiểm thử phân quyền server và RLS cho từng vai trò, xác thực phụ huynh và trẻ, cơ chế an toàn nội dung, bảo vệ khóa, giới hạn và kiểm soát chi phí theo người dùng, phòng chống prompt injection, quyền dữ liệu và rà soát pháp lý. Các mô hình và giá cần kiểm tra theo tài liệu nhà cung cấp hiện hành. Đặc biệt không chạy mã Python chưa cách ly trên máy chủ chính; mô phỏng Rubik cần kiểm thử tính đúng đắn của từng phép xoay.
