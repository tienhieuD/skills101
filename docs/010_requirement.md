# Requirements - Blog cá nhân về lập trình

> Tài liệu này mô tả hệ thống PHẢI làm gì / đạt kết quả gì (WHAT) - không quy định công cụ/giải pháp kỹ thuật cụ thể (HOW). Với mỗi yêu cầu, giải pháp kỹ thuật tương ứng được ghi ở `techdraft.md`.

## 1. Mục tiêu
- Blog cá nhân chia sẻ kiến thức lập trình, dùng để ôn lại và học hỏi.
- Đối tượng đọc: chủ yếu bản thân + các dev khác quan tâm.
- Mục tiêu phụ: quá trình xây dựng là cơ hội học tập (frontend, backend nhẹ, devops, performance).

## 2. Đối tượng người dùng

| Vai trò | Nhu cầu |
|---|---|
| Tác giả (chính chủ) | Viết/sửa bài ở một nơi duy nhất; bài tự xuất hiện trên web không cần thao tác thủ công; xem trước bài chưa công bố |
| Người đọc | Tìm bài nhanh (search/tag); đọc nhanh; dùng tốt trên mobile, kể cả khi mất mạng; bình luận; theo dõi bài mới |

## 3. Phạm vi

### Trong phạm vi
- Nội dung được viết và quản lý ở một nơi duy nhất, tự động xuất hiện trên web sau khi công bố
- Trang chủ: danh sách bài, tìm kiếm, lọc theo tag, sắp xếp, phân trang
- Trang chi tiết bài viết, trang theo tag
- Chế độ sáng/tối (dark mode)
- Hỗ trợ SEO: sitemap, feed theo dõi bài mới, metadata chia sẻ social
- Bình luận, đếm lượt xem, đăng ký nhận tin
- Xem trước bài ở trạng thái chưa công bố (qua link riêng)
- Tối ưu tốc độ tải trang
- Thân thiện mobile + cài được như app, dùng được offline cho nội dung đã từng xem

### Ngoài phạm vi
- Multi-author / phân quyền phức tạp
- Công cụ soạn nội dung (editor/CMS) tự xây dựng
- Đa ngôn ngữ (i18n)
- Ứng dụng mobile native riêng
- Offline cho TOÀN BỘ nội dung (chỉ nội dung đã từng xem)
- Cộng tác chỉnh sửa thời gian thực

## 4. Tính năng / Requirements

### 4.1 Đọc & khám phá nội dung
- Trang chủ PHẢI hiển thị các bài đã công bố, sắp xếp theo ngày mới nhất (mặc định), phân trang 10 bài/trang.
- Người đọc PHẢI có thể đổi cách sắp xếp sang "phổ biến nhất" (theo lượt xem); nếu giá trị sắp xếp không hợp lệ, hệ thống PHẢI tự dùng lại mặc định, không lỗi.
- Người đọc PHẢI có thể lọc danh sách bài theo tag; trạng thái lọc PHẢI phản ánh ở URL (để chia sẻ link, dùng nút back/forward bình thường).
- Mỗi tag PHẢI có một trang riêng liệt kê bài thuộc tag đó; nếu không có bài nào, hiển thị thông báo rõ ràng (không phải danh sách trống không giải thích).
- Người đọc PHẢI tìm được bài viết theo từ khóa (tiêu đề/nội dung), kết quả hiển thị ngay không có độ trễ chờ server.
- Trang chi tiết bài viết PHẢI hiển thị đầy đủ nội dung (heading, đoạn code có tô màu cú pháp, ảnh, danh sách...); nếu bài không tồn tại hoặc chưa công bố, trả về trang "không tìm thấy" (404).
- Người đọc PHẢI chuyển được giữa chế độ sáng/tối; lựa chọn PHẢI được nhớ cho lần sau; khi tải trang KHÔNG được xảy ra hiện tượng nhấp nháy sai theme.
- Hệ thống PHẢI cung cấp feed (chuẩn RSS) chứa các bài mới nhất để người đọc theo dõi không cần ghé thăm.
- Hệ thống PHẢI cung cấp sitemap liệt kê các trang công khai; sitemap KHÔNG được chứa bài chưa công bố.
- Mỗi bài PHẢI có metadata phục vụ SEO và chia sẻ trên mạng xã hội (tiêu đề, mô tả ngắn, ảnh preview).

### 4.2 Tương tác
- Mỗi bài viết PHẢI có số lượt xem, tăng tối đa 1 lần cho mỗi lượt tải trang (không tăng khi người dùng chỉ tương tác UI khác trên cùng trang).
- Mỗi bài viết PHẢI có khu vực bình luận; khu vực này KHÔNG được làm chậm việc hiển thị nội dung chính của trang (chỉ tải khi người đọc cần đến).
- Người đọc PHẢI đăng ký được nhận email khi có bài mới; email không hợp lệ PHẢI bị báo lỗi ngay, không gửi đi. Mọi email gửi cho người đăng ký PHẢI có cách hủy đăng ký, và email người đọc KHÔNG được chia sẻ cho bên thứ ba ngoài mục đích gửi thông báo.

### 4.3 Viết & Công bố nội dung
- Khi tác giả đánh dấu một bài là "đã công bố", bài PHẢI xuất hiện trên web trong vòng vài phút, không cần tác giả thao tác thêm gì trên web.
- Khi tác giả sửa nội dung một bài đã công bố, thay đổi PHẢI được phản ánh trên web trong vòng tối đa 1 ngày, không cần thao tác thủ công.
- Nếu việc lấy/đồng bộ nội dung gặp lỗi tạm thời, site PHẢI tiếp tục hoạt động bình thường với nội dung hiện có - KHÔNG được hiển thị lỗi, trang trống, hoặc nội dung hỏng.
- Lặp lại việc đồng bộ với nội dung không thay đổi KHÔNG được tạo ra bất kỳ thay đổi/cập nhật thừa nào trên site.
- Tác giả PHẢI xem được bản xem trước của bài ở trạng thái "chưa công bố" trên giao diện web thật (qua một đường dẫn riêng có mã truy cập); người đọc thông thường (không có đường dẫn này) KHÔNG được thấy bài chưa công bố.

### 4.4 Mobile & PWA
- Giao diện PHẢI hiển thị tốt trên màn hình điện thoại (responsive), không bị tràn ngang.
- Trên màn hình nhỏ, menu điều hướng PHẢI thu gọn lại (ví dụ dạng menu ẩn/hiện) thay vì hiển thị đầy đủ như desktop.
- Mọi phần tử có thể bấm (nút, link, tag, công cụ chuyển theme...) PHẢI đủ lớn để bấm chính xác bằng ngón tay (tối thiểu khoảng 44x44px).
- Người dùng PHẢI cài được blog vào màn hình chính thiết bị như một ứng dụng.
- Bài viết người dùng đã từng mở PHẢI mở lại được khi thiết bị không có kết nối mạng.
- Khi người dùng mở một bài CHƯA từng xem trong lúc không có mạng, hệ thống PHẢI hiển thị thông báo rõ ràng (không phải lỗi mặc định của trình duyệt) kèm cách thử lại.
- Dung lượng lưu trữ cho nội dung offline trên thiết bị KHÔNG được tăng vô hạn - PHẢI có giới hạn hợp lý (ví dụ giữ lại khoảng 30 bài gần nhất đã mở).
- Khi site có bản cập nhật mới, người dùng PHẢI nhận được phiên bản mới trong tối đa 1 lần tải lại trang, không cần tự xóa dữ liệu/cache.

## 5. Yêu cầu phi chức năng (Non-functional)

### Performance
- Thời gian build site PHẢI dưới 60 giây cho khoảng 50 bài viết, và KHÔNG được phụ thuộc vào độ trễ/khả dụng của nguồn nội dung tại thời điểm build (đây là ràng buộc cốt lõi để tránh lỗi timeout đã từng gặp).
- Điểm Performance (đo bằng công cụ audit chuẩn, mobile) PHẢI ≥ 95 cho trang chủ và trang chi tiết bài viết.
- Thời gian hiển thị nội dung chính (LCP) ≤ 2.5 giây; độ "giật" layout (CLS) ≤ 0.1.
- Một lượt đồng bộ cho 1 bài viết PHẢI hoàn thành trong khoảng thời gian hợp lý (≤ 10 giây) để tránh bị huỷ giữa chừng do timeout.

### Security
- Endpoint nhận thông báo thay đổi nội dung từ nguồn bên ngoài PHẢI xác thực được người/hệ thống gửi; request không xác thực được PHẢI bị từ chối và không gây ra bất kỳ thay đổi nào.
- Đường dẫn xem trước bài chưa công bố PHẢI có mã truy cập đủ khó đoán và KHÔNG được xuất hiện trong source code đã công khai.
- Mọi thông tin xác thực (khóa truy cập, token) KHÔNG được lưu trong source code.

### Reliability
- Đã cover ở mục 4.3 (đồng bộ lỗi không phá site, không tạo thay đổi thừa).

### Observability
- Mọi lượt đồng bộ nội dung (thành công hoặc thất bại) PHẢI được ghi lại để có thể kiểm tra khi cần, không ghi lại thông tin xác thực.
- Hệ thống PHẢI có số liệu cơ bản về lượt truy cập trang.

### Design

- Giao diện PHẢI theo phong cách **Geist Design System** (Vercel) — tối giản, đen trắng làm chủ đạo, typography rõ ràng, khoảng trắng rộng, không dùng màu sắc trang trí.

### Compliance
- Email thu thập qua đăng ký nhận tin chỉ được dùng để gửi thông báo bài mới, PHẢI có cách hủy đăng ký, và KHÔNG được chia sẻ cho bên thứ ba ngoài mục đích này.

## 6. Success Metrics

| Metric | Target |
|---|---|
| Thời gian build | < 1 phút cho ~20-50 bài |
| Điểm Performance (mobile) | ≥ 95 |
| Điểm SEO / Best Practices | = 100 |
| Khả năng "cài như app" | đạt (pass) |
| Thời gian từ "công bố" đến "lên web" | ≤ vài phút |
| Đồng bộ thất bại | không làm hỏng site |
| Offline cho bài đã xem | mở lại được khi mất mạng |

## 7. Roadmap (theo năng lực, không theo công nghệ)

1. **Nền tảng đọc cơ bản**: hiển thị danh sách bài + trang chi tiết từ nội dung đã đồng bộ.
   - Verify: build nhanh, ổn định, không phụ thuộc nguồn nội dung lúc build.
2. **Khám phá nội dung**: tìm kiếm, lọc tag, sắp xếp, SEO (sitemap/feed/metadata).
   - Verify: tìm kiếm đúng kết quả, lọc qua URL hoạt động, sitemap hợp lệ.
3. **Trải nghiệm đọc**: dark/light mode.
   - Verify: không nhấp nháy sai theme, lưu lựa chọn.
4. **Đồng bộ tự động**: nội dung công bố/sửa đổi tự phản ánh lên web theo đúng mốc thời gian ở 4.3.
   - Verify: đúng thời gian quy định ở 4.3 cho cả công bố mới và sửa nội dung.
5. **Xem trước nội dung chưa công bố**: qua đường dẫn riêng có mã truy cập.
   - Verify: xem được bản chưa công bố qua link riêng, không lộ ra công khai.
6. **Tương tác**: bình luận, đếm lượt xem, đăng ký nhận tin.
   - Verify: đúng hành vi mô tả ở 4.2.
7. **Tinh chỉnh hiệu năng**: đạt các chỉ số ở mục 5 (Performance) và mục 6.
   - Verify: đo bằng audit tool, đạt target.
8. **Mobile & PWA**: hoàn thiện các yêu cầu ở 4.4.
   - Verify: cài được như app; mở lại bài đã xem khi offline; bài chưa xem + offline → thông báo phù hợp.