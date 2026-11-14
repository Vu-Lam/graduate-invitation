import mongoose from 'mongoose';

const { Schema } = mongoose;

// Khung giờ khách của từng nhóm được mời có mặt. Khớp với Guest.group theo tên (không phân biệt hoa/thường).
const GroupScheduleSchema = new Schema(
  {
    group: { type: String, required: true, trim: true, maxlength: 40, unique: true },
    start: { type: String, required: true }, // 'HH:mm'
    end: { type: String, required: true } // 'HH:mm'
  },
  { timestamps: true }
);

export const GroupSchedule =
  mongoose.models.GroupSchedule || mongoose.model('GroupSchedule', GroupScheduleSchema);

export const normGroup = (s) => String(s ?? '').normalize('NFC').trim().toLowerCase();

const DEFAULTS = [
  { group: 'Cơ quan', start: '10:00', end: '12:00' },
  { group: 'Bạn bè', start: '10:00', end: '14:00' },
  { group: 'Người thân', start: '12:00', end: '14:00' }
];

// Lần đầu chạy (collection còn trống) thì tạo sẵn 3 nhóm mặc định.
export async function seedGroupSchedules() {
  if ((await GroupSchedule.estimatedDocumentCount()) === 0) {
    await GroupSchedule.insertMany(DEFAULTS);
  }
}

// Trả về { start, end } của nhóm, hoặc null nếu nhóm chưa có khung giờ.
export function pickArrival(schedules, group) {
  const key = normGroup(group);
  if (!key) return null;
  const s = schedules.find((x) => normGroup(x.group) === key);
  return s ? { start: s.start, end: s.end } : null;
}
