# Vocabulary Garden – Quản trị từ vựng

## Cloudflare Pages bindings
- D1 database binding: variable `DB`, database `vocabulary-garden-db`
- Secret: `ADMIN_PASSWORD`
- Secret: `OPENAI_API_KEY` (cần để tạo IPA và ảnh bằng AI; tạo API key trong OpenAI API Platform, không dùng mật khẩu ChatGPT)
- R2 bucket binding: `VG_IMAGES` (cần để lưu ảnh AI vĩnh viễn)
- Variable: `IMAGE_PUBLIC_BASE_URL` (URL HTTPS công khai trỏ đến bucket R2, không có dấu `/` ở cuối)
- Cấu hình cho Production (và Preview nếu muốn thử trên preview).

## Routes
- `/admin` – trang quản trị
- `/api/admin/login` – đăng nhập, cấp cookie HttpOnly 8 giờ
- `/api/admin/logout` – đăng xuất
- `/api/admin/words` – CRUD, yêu cầu phiên quản trị hợp lệ
- `/api/admin/ai-ipa` – đề xuất IPA giọng Anh-Mỹ bằng AI
- `/api/admin/ai-image` – tạo ảnh hoạt hình AI để xem trước
- `/api/admin/image-save` – lưu ảnh đã chọn vào Cloudflare R2
- `/api/words` – chỉ đọc danh sách từ bổ sung để trang học hiển thị

## Cấu hình AI và lưu ảnh (cần làm một lần trên Cloudflare)
1. Mở Cloudflare Dashboard → Workers & Pages → `vocabulary-garden` → Settings → Variables and Secrets.
2. Thêm `OPENAI_API_KEY` dưới dạng **Secret**. API usage có thể tính phí riêng; tài khoản ChatGPT không tự bao gồm API credits.
3. Mở R2 Object Storage và tạo bucket, ví dụ `vocabulary-garden-images`.
4. Bật Public Development URL hoặc gắn custom domain cho bucket để có URL HTTPS công khai. Sao chép base URL đó.
5. Trong Pages project, phần Settings → Bindings, thêm R2 bucket binding: variable name `VG_IMAGES`, chọn bucket vừa tạo.
6. Thêm variable `IMAGE_PUBLIC_BASE_URL` bằng base URL công khai của bucket, không có dấu `/` cuối.
7. Redeploy Pages sau khi lưu cấu hình.

Nếu chưa cấu hình API key, các nút AI sẽ báo hướng dẫn cấu hình. Nếu chưa cấu hình R2/public URL, ảnh vẫn tạo và xem trước được nhưng khi lưu từ, hệ thống sẽ báo cần cấu hình R2. Từ vựng và IPA không bị mất vì thông báo xảy ra trước khi lưu bản ghi từ mới.

## Deploy
Thư mục `functions/` ở thư mục gốc là Cloudflare Pages Functions. Giữ nguyên cấu hình Pages hiện tại (build command trống, output directory `/`). Commit và push lên `main` để triển khai Production.

## Lưu ý
- 414 từ gốc và ảnh `img/word-*.webp` được giữ nguyên.
- Từ bổ sung được lưu trong D1 và được tải vào trang học khi API hoạt động.
- IPA do AI gợi ý, người quản trị có thể sửa trước khi lưu.
- Ảnh AI có thể xem trước; khi lưu, ảnh được đưa vào R2 và URL HTTPS được lưu trong D1.
- Cơ chế phát âm trên trang học vẫn dùng Web Speech API hiện có; các hàm phát âm, giọng đọc, tốc độ và nhạc nền không bị thay đổi.
- API quản trị yêu cầu cookie hợp lệ và mật khẩu `ADMIN_PASSWORD`.
