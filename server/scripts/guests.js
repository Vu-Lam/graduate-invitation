// Xem ai đã mở thiệp / xác nhận.
//   npm run guests            -> bảng tóm tắt
//   npm run guests -- --csv   -> xuất CSV ra màn hình
import '../src/env.js';
import mongoose from 'mongoose';
import { connectDb } from '../src/db.js';
import { Guest } from '../src/models/Guest.js';

const asCsv = process.argv.includes('--csv');
const baseUrl = (process.env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');

await connectDb(process.env.MONGODB_URI);
const guests = await Guest.find().sort({ group: 1, name: 1 }).lean();

const label = { yes: 'ĐI', no: 'KHÔNG ĐI', undefined: 'chưa trả lời' };
const rows = guests.map((g) => ({
  khach: `${g.honorific} ${g.name}`,
  nhom: g.group,
  trangThai: label[g.rsvp?.status],
  luotMo: g.visits,
  loiChuc: g.rsvp?.wish ? (g.wishVisible ? 'đã duyệt' : 'chờ duyệt') : '',
  lyDo: g.rsvp?.reason || '',
  link: `${baseUrl}/moi/${g.slug}`
}));

if (asCsv) {
  console.log('khach,nhom,trang_thai,luot_mo,loi_chuc,ly_do,link');
  for (const r of rows) {
    console.log([r.khach, r.nhom, r.trangThai, r.luotMo, r.loiChuc, r.lyDo, r.link].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','));
  }
} else {
  console.table(rows.map(({ link, ...rest }) => rest));
  const yes = guests.filter((g) => g.rsvp?.status === 'yes').length;
  const no = guests.filter((g) => g.rsvp?.status === 'no').length;
  console.log(`Tổng ${guests.length} · đi ${yes} · không đi ${no} · chưa trả lời ${guests.length - yes - no}`);
}

await mongoose.disconnect();
