# System Testing Checklist

Sử dụng checklist này để kiểm thử thủ công website trước khi deploy lên môi trường Production.

## 1. Public Website

- [ ] **Home load được**: Truy cập `/`, kiểm tra banner, danh sách dịch vụ, gallery và đối tác tải thành công.
- [ ] **Services load từ API**: Truy cập `/services`, kiểm tra danh sách hiển thị đúng từ database. Không bị trắng trang.
- [ ] **Service detail load đúng slug**: Click vào một dịch vụ, URL chuyển sang `/services/slug-cua-dich-vu` và hiển thị chi tiết (ảnh, giá, thông tin) đầy đủ. Không bị lỗi crash JSON Parse.
- [ ] **Contact form submit thành công**: Ở trang `/contact` hoặc chân trang, điền form Liên hệ. Màn hình báo thành công.
- [ ] **Booking form submit lưu đúng guests**: Bấm `Book Now` hoặc `Inquire` trong trang Service Detail. Gõ "Khoảng 5 người" vào ô Pax/Guests. Gửi thành công.
- [ ] **Lead mới xuất hiện trong admin**: Mở `/admin/inquiries` (sau khi login), kiểm tra thấy Lead vừa gửi có xuất hiện ở đầu danh sách, và trường Guests hiển thị là `5` thay vì `1`.
- [ ] **Email notification (Nếu đã config SMTP)**: Kiểm tra hộp thư `ADMIN_NOTIFY_EMAIL` xem có nhận được email báo khách mới hay không. (Nếu test local chưa có SMTP, kiểm tra log ở Terminal Server xem có dòng `[Email Simulation]`).

## 2. Admin & CMS

- [ ] **Login sai báo lỗi**: Nhập sai password ở `/login`, hệ thống từ chối và hiện lỗi.
- [ ] **Login đúng vào /admin**: Nhập đúng password, chuyển hướng mượt mà vào trang chủ Admin. Thanh navbar Admin xuất hiện.
- [ ] **Reload /admin vẫn giữ login**: Đang ở `/admin/...`, bấm f5 tải lại trang. Hệ thống hiển thị `Loading admin session...` 1 giây rồi vào lại bình thường.
- [ ] **Token sai/hết hạn bị logout**: Mở Application -> Session Storage -> Sửa chữ trong `adminToken` thành một chuỗi bậy bạ. Bấm f5 tải lại trang. Hệ thống tự động văng ra `/login` và xoá token hỏng.
- [ ] **Admin xem leads**: Truy cập `/admin/inquiries`, danh sách Leads tải về đầy đủ.
- [ ] **Admin filter/search leads**: Gõ tên hoặc số điện thoại vào ô Search. Danh sách lập tức tự động lọc ra kết quả đúng. Chọn Filter theo `Status` (VD: New, Contacted) hệ thống lọc chuẩn xác.
- [ ] **Admin update status lead**: Thay đổi Status của một khách hàng từ `New` sang `Quoted`, thêm nội dung vào ô `Internal Note`, bấm `Save Updates`. Load lại trang, thông tin vẫn giữ nguyên (tức là đã cập nhật Database thành công).
- [ ] **Admin thêm/sửa/xóa service**: Vào `/admin/services`, bấm thêm mới Dịch vụ, sửa tên, xoá thử. Kiểm tra hiển thị ngoài trang chủ.
- [ ] **Admin upload ảnh**: Khi sửa ảnh ở trang chủ hoặc trang Service, tải lên một ảnh hợp lệ (jpg/png), ảnh tải thành công và trả về URL đúng.
- [ ] **Logout hoạt động**: Bấm Logout trên thanh menu Admin. Hệ thống trả về `/login` và nút Admin biến mất khỏi UI public.

## 3. Security

- [ ] **Không có token chặn API leads**: Dùng Postman hoặc Terminal gọi `GET http://localhost:5001/api/leads` (không kèm Header Authorization). Mong đợi: Lỗi `401 Unauthorized`.
- [ ] **Không có token chặn API services**: Gọi `POST /api/services` hoặc `DELETE /api/services/xxx` bằng Postman. Mong đợi: Lỗi `401 Unauthorized`.
- [ ] **Public GET services vẫn hoạt động**: Gọi `GET http://localhost:5001/api/services` (không kèm token). Mong đợi: Trả về HTTP 200 kèm danh sách dịch vụ.
- [ ] **Public POST leads vẫn hoạt động**: Gọi `POST /api/leads` để gửi form contact ẩn danh. Mong đợi: Trả về HTTP 201 kèm Lead mới.
- [ ] **Upload chặn file rác**: Thử upload một file `.txt` hoặc `.pdf` qua `/api/upload`. Mong đợi: Lỗi HTTP 400 `Invalid file type`.
- [ ] **Upload chặn file lớn**: Thử upload ảnh có dung lượng > 5MB. Mong đợi: Báo lỗi giới hạn fileSize.

## 4. Build & Deployment

- [ ] **`npm install` chạy sạch**: Xoá `node_modules` và chạy lại `npm install` thành công (không bị crash do native binding).
- [ ] **`npm run db:generate` chạy sạch**: Lệnh generate Prisma Client thành công.
- [ ] **`npm run db:push` chạy sạch**: Prisma đồng bộ cấu trúc DB không báo lỗi.
- [ ] **`npm run dev` chạy song song**: Lệnh gọi lên được cả Vite và Express.
- [ ] **`npm run build` không lỗi**: Thử build ra production bằng `npm run build`, thư mục `dist` tạo thành công.
