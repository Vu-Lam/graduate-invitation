// ============================================================
//  SỬA FILE NÀY: toàn bộ thông tin của bạn nằm ở đây.
//  Chỗ nào còn dạng [NHƯ THẾ NÀY] là chỗ bạn cần điền.
// ============================================================

export const config = {
  host: {
    name: 'Lâm Vũ',
    major: 'Khoa Học Máy Tính',
    faculty: 'KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH',
    school: 'Trường ĐH Bách khoa - ĐHQG-HCM',
    bio: 'Mình sắp tốt nghiệp rồi.',
    // Ảnh chân dung: bỏ file vào client/public rồi điền đường dẫn, ví dụ '/portrait.jpg'. Để trống = hiện khung chờ.
    photo: '/ava-invitation-transparent.png',
    // Mỗi dòng: { label, value, href }. href để trống nếu không cần bấm được.
    // Ví dụ: { label: 'Điện thoại', value: '0900 000 000', href: 'tel:0900000000' }
    contacts: [
      { label: 'Điện thoại', value: '0372914171', href: 'tel:0372914171' },
      { label: 'Zalo', value: 'https://zalo.me/0372914171', href: 'https://zalo.me/0372914171' }
    ]
  },

  event: {
    // Giờ bắt đầu theo chuẩn ISO để chạy đếm ngược, ví dụ '2026-12-20T08:00:00+07:00'. Để trống = ẩn đếm ngược.
    iso: '2026-11-28T15:00:00+07:00',
    year: '2026',
    dateText: 'Thứ 7, ngày 28 tháng 11',
    timeText: '15h – 16h',
    schedule: '[Lịch trình: lễ tại trường, chụp ảnh, tiệc…]',
    venue: 'Toà A3 (gần cổng Tô Hiến Thành)',
    address: '268 Đ. Lý Thường Kiệt, Diên Hồng, Hồ Chí Minh',
    mapUrl: 'https://www.google.com/maps/search/268+Lý+Thường+Kiệt,+Hồ+Chí+Minh'
  },

  tour: {
    url: 'https://hcmut.edu.vn/virtual-tour/',
    // Ảnh xem trước tour (tuỳ chọn), ví dụ '/tour-preview.jpg' đặt trong client/public
    preview: ''
  },

  music: {
    // Đặt file nhạc không bản quyền vào client/public/music/invite.mp3
    // Nguồn: https://www.youtube.com/watch?v=pAbhAmOxGfc&list=RDpAbhAmOxGfc&start_radio=1
    src: '/music/invite.mp3',
    volume: 0.5
  },

  // Địa chỉ web dùng để tạo mã QR trên ảnh thiệp. Mặc định lấy theo tên miền đang chạy.
  siteUrl: import.meta.env.VITE_SITE_URL || window.location.origin,

  // Địa chỉ backend API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001'
};
