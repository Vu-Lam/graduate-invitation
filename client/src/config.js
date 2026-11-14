// ============================================================
//  SỬA FILE NÀY: toàn bộ thông tin của bạn nằm ở đây.
//  Chỗ nào còn dạng [NHƯ THẾ NÀY] là chỗ bạn cần điền.
// ============================================================

const gmap = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

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
    iso: '2026-11-28T14:00:00+07:00',
    year: '2026',
    dateText: 'Thứ 7, ngày 28 tháng 11',
    timeText: '14h – 17h30',
    // Giờ mình có mặt tại trường (khách xem thêm khung giờ riêng theo nhóm)
    // Dòng thời gian trên thiệp (giờ 'HH:mm'). Trục hiển thị từ axis.start đến axis.end.
    hostFrom: '09:30',
    ceremony: { start: '14:00', end: '17:30' },
    axis: { start: '09:00', end: '18:00' },
    schedule: 'Mình có mặt từ 9h30 sáng và ở lại đến chiều.',
    venue: 'Toà A3 (gần cổng Tô Hiến Thành)',
    address: '268 Đ. Lý Thường Kiệt, Diên Hồng, Hồ Chí Minh',
    // Các chỗ gửi xe gợi ý cho khách
    parking: [
      {
        name: 'Trường Bách khoa',
        maps: [
          { label: 'Cổng Lý Thường Kiệt', url: gmap('Cổng Lý Thường Kiệt Đại học Bách Khoa TP.HCM') },
          { label: 'Cổng Tô Hiến Thành', url: gmap('Cổng Tô Hiến Thành Đại học Bách Khoa TP.HCM') }
        ]
      },
      { name: 'Bệnh viện Trưng Vương', maps: [{ label: 'Xem bản đồ', url: gmap('Bệnh viện Trưng Vương TP.HCM') }] },
      { name: 'Nhà thi đấu Phú Thọ', maps: [{ label: 'Xem bản đồ', url: gmap('Nhà thi đấu Phú Thọ TP.HCM') }] }
    ],
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
  siteUrl: window.location.origin,

  // Địa chỉ backend API
  apiUrl: ''
};
