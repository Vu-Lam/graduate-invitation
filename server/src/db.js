import mongoose from 'mongoose';

export async function connectDb(uri) {
  if (!uri) throw new Error('Thiếu MONGODB_URI. Hãy tạo file .env từ .env.example');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return mongoose.connection;
}
