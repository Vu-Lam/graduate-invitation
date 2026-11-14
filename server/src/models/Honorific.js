import mongoose from 'mongoose';

const { Schema } = mongoose;

// Danh sách cách xưng hô để chọn trong admin. `name` chính là chữ hiện trên thiệp: "anh Nam", "thầy Minh"...
const HonorificSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true, maxlength: 20, unique: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Honorific = mongoose.models.Honorific || mongoose.model('Honorific', HonorificSchema);

const DEFAULTS = ['bạn', 'anh', 'chị', 'em', 'cô', 'chú', 'thầy', 'sếp'];

export async function seedHonorifics() {
  if ((await Honorific.estimatedDocumentCount()) === 0) {
    await Honorific.insertMany(DEFAULTS.map((name, order) => ({ name, order })));
  }
}
