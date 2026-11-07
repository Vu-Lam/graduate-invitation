// Duyệt lời chúc cho sổ lưu bút.
//   npm run wish -- pending          -> các lời chúc đang chờ duyệt
//   npm run wish -- show <slug>      -> cho hiện lời chúc của một khách
//   npm run wish -- hide <slug>      -> ẩn lại
//   npm run wish -- show-all         -> duyệt tất cả lời chúc đang chờ
import '../src/env.js';
import mongoose from 'mongoose';
import { connectDb } from '../src/db.js';
import { Guest } from '../src/models/Guest.js';

const [command, slug] = process.argv.slice(2);

await connectDb(process.env.MONGODB_URI);

try {
  if (command === 'pending') {
    const rows = await Guest.find({ wishVisible: false, 'rsvp.wish': { $ne: '' } }).lean();
    if (!rows.length) console.log('Không có lời chúc nào đang chờ duyệt.');
    for (const g of rows) console.log(`- ${g.slug}  (${g.honorific} ${g.name}): ${g.rsvp.wish}`);
  } else if (command === 'show-all') {
    const result = await Guest.updateMany({ wishVisible: false, 'rsvp.wish': { $ne: '' } }, { wishVisible: true });
    console.log(`Đã duyệt ${result.modifiedCount} lời chúc.`);
  } else if ((command === 'show' || command === 'hide') && slug) {
    const guest = await Guest.findOneAndUpdate({ slug }, { wishVisible: command === 'show' }, { new: true });
    console.log(guest ? `${command === 'show' ? 'Hiện' : 'Ẩn'} lời chúc của ${guest.honorific} ${guest.name}.` : 'Không tìm thấy slug này.');
  } else {
    console.log('Cách dùng: npm run wish -- pending | show <slug> | hide <slug> | show-all');
  }
} finally {
  await mongoose.disconnect();
}
