# Vocabulary Garden – Quản trị từ vựng

## Cloudflare Pages bindings
- D1 database binding: variable `DB`, database `vocabulary-garden-db`
- Secret: `ADMIN_PASSWORD`
- Cấu hình cho Production (và Preview nếu muốn thử trên preview).

## Routes
- `/admin` – trang quản trị
- `/api/admin/login` – đăng nhập, cấp cookie HttpOnly 8 giờ
- `/api/admin/logout` – đăng xuất
- `/api/admin/words` – CRUD, yêu cầu phiên quản trị hợp lệ
- `/api/words` – chỉ đọc danh sách từ bổ sung để trang học hiển thị

## Deploy
Thư mục `functions/` ở thư mục gốc là Cloudflare Pages Functions. Giữ nguyên cấu hình Pages hiện tại (build command trống, output directory `/`). Commit và push lên `main` để triển khai Production.

## Lưu ý hiện tại
- 414 từ gốc và ảnh `img/word-*.webp` được giữ nguyên.
- Từ bổ sung được lưu trong D1 và được tải vào trang học khi API hoạt động.
- Trường ảnh hiện nhận URL HTTPS công khai; chưa có upload ảnh trực tiếp lên R2.
- IPA được lưu trong D1 và trang quản trị; phần phát âm vẫn dùng Web Speech API hiện có.
- API quản trị không mở nếu cookie hợp lệ và mật khẩu ADMIN_PASSWORD không khớp.
