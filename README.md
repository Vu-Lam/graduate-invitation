# Thiệp mời tốt nghiệp

React (Vite) + Express + MongoDB. Mỗi khách mời có một link riêng `/moi/<slug>`, ví dụ `/moi/co-lan-x7k2`.

## Có gì trong thiệp

- Màn "Chạm để mở thiệp" (cú chạm này cho phép phát nhạc nhẹ)
- Glassmorphism, 5 theme: Xanh Bách Khoa, Vàng cử nhân, Hồng, Ngọc lam, **Phật pháp** (Pháp luân + hoa sen). Nhớ lựa chọn của khách
- Tên khách, cách xưng hô, thời gian, địa điểm, liên hệ, đếm ngược
- Link sang tour 360° của trường
- Xác nhận có/không đi (không đi thì nhập lý do), kèm lời chúc, sửa lại được nhiều lần
- Tải ảnh thiệp PNG 1080×1350 có tên khách và mã QR về đúng link của họ
- Sổ lưu bút (tắt mặc định, bật khi sẵn sàng)

## Chạy thử

Cần Node 18+ và một MongoDB (cài sẵn, hoặc tạo cụm free trên MongoDB Atlas).

```bash
npm install
cp .env.example .env          # sửa MONGODB_URI
cp data/guests.example.json data/guests.json   # sửa danh sách khách mời
npm run seed                  # tạo khách + in link riêng, lưu vào data/links.csv
npm run dev                   # web: http://localhost:5173, API: http://localhost:3001
```

Mở một link in ra từ `npm run seed` nhưng đổi cổng thành `5173` khi chạy `npm run dev`.

## Điền thông tin của bạn

Sửa `client/src/config.js`: tên, ngành, khoa, ngày giờ, địa điểm, liên hệ, đường dẫn Google Maps.
Chỗ nào còn `[DẠNG NÀY]` là chưa điền. Điền `event.iso` (ví dụ `2026-12-20T08:00:00+07:00`) để bật đếm ngược.

- **Nhạc:** đặt file `.mp3` không bản quyền vào `client/public/music/invite.mp3` (Pixabay Music, Free Music Archive). Chưa có file thì nút nhạc tự ẩn.
- **Ảnh chân dung / ảnh xem trước tour:** bỏ vào `client/public/`, điền đường dẫn trong `config.js`.
- **Logo:** `client/public/logo.png`.

## Quản lý khách mời

```bash
npm run seed                      # thêm khách từ data/guests.json (chạy lại không bị trùng)
npm run guests                    # ai đã mở thiệp, đi hay không, lý do
npm run guests -- --csv > ds.csv  # xuất CSV
npm run wish -- pending           # lời chúc đang chờ duyệt
npm run wish -- show <slug>       # cho một lời chúc lên sổ lưu bút
npm run wish -- show-all
npm run wish -- hide <slug>
```

Slug có đuôi 4 ký tự ngẫu nhiên nên không thể đoán link của người khác. Khách sửa lời chúc thì lời chúc đó bị ẩn lại để bạn duyệt lại.

## Bật sổ lưu bút

Đặt `GUESTBOOK_ENABLED=true` trong `.env` rồi duyệt lời chúc bằng `npm run wish`. Chưa bật thì trang hiện khung "Sắp ra mắt".

## Đưa lên mạng

Một service Node duy nhất phục vụ cả API lẫn web:

```bash
npm install && npm run build   # build bước cài đặt
npm start                      # chạy server
```

Trên Render / Railway / Fly.io: đặt biến môi trường `MONGODB_URI`, `PUBLIC_URL` (tên miền thật, để `npm run seed` in đúng link), `GUESTBOOK_ENABLED`. Mã QR trên ảnh thiệp tự lấy theo tên miền đang mở; muốn cố định thì đặt `VITE_SITE_URL` lúc build.

Chạy `npm run seed` trên máy bạn với `MONGODB_URI` trỏ vào Atlas là đủ để tạo khách trên bản thật.

## API

| Method | Đường dẫn              | Mô tả                                                                      |
| ------ | -------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/guests/:slug`      | Thông tin khách + câu trả lời hiện tại (đếm lượt mở)             |
| PUT    | `/api/guests/:slug/rsvp` | `{ status: "yes"\|"no", reason?, wish? }`, `reason` bắt buộc khi `no` |
| GET    | `/api/wishes`            | Lời chúc đã duyệt (chỉ khi bật sổ lưu bút)                         |

## Cấu trúc

```
client/   React + Vite (giao diện, theme, tải ảnh thiệp)
server/   Express + Mongoose (API, script seed/guests/wish)
data/     danh sách khách mời (guests.json không được commit)
```
