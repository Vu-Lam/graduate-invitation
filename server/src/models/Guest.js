import mongoose from 'mongoose';

const { Schema } = mongoose;

const GuestSchema = new Schema(
  {
    // Phần định danh trong link: /moi/:slug
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // Cách xưng hô hiển thị: anh, chị, cô, chú, bạn, em...
    honorific: { type: String, default: 'bạn', trim: true, maxlength: 20 },
    // Nhóm để bạn tiện lọc: gia đình, bạn bè, thầy cô...
    group: { type: String, default: '', trim: true, maxlength: 40 },

    rsvp: {
      status: { type: String, enum: ['yes', 'no'] }, // chưa trả lời = undefined
      reason: { type: String, default: '', maxlength: 500 },
      wish: { type: String, default: '', maxlength: 500 },
      contact: { type: String, default: '', maxlength: 100 }, // phone or email
      respondedAt: { type: Date }
    },

    // Lời chúc chỉ lên sổ lưu bút sau khi bạn duyệt
    wishVisible: { type: Boolean, default: false },

    visits: { type: Number, default: 0 },
    lastVisitAt: { type: Date }
  },
  { timestamps: true }
);

export const Guest = mongoose.models.Guest || mongoose.model('Guest', GuestSchema);
