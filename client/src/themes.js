// Màu thật của từng theme nằm trong styles.css ([data-theme="..."]); ở đây chỉ là danh sách để hiện nút chọn.
export const THEMES = [
  { key: 'bk', label: 'Xanh Bách Khoa', swatch: '#1588db' },
  { key: 'gold', label: 'Vàng cử nhân', swatch: '#f2b84b' },
  { key: 'rose', label: 'Hồng pastel', swatch: '#ff6fa8' },
  { key: 'mint', label: 'Ngọc lam', swatch: '#3fd1b0' },
  {
    key: 'dharma',
    label: 'Phật pháp (theme đặc biệt)',
    swatch: 'conic-gradient(#f4a52e, #ff9ec2, #f4a52e)',
    special: true
  }
];

export const DEFAULT_THEME = 'bk';
