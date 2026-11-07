// Tạo khách mời từ file JSON và in ra link riêng cho từng người.
//   npm run seed                      -> đọc data/guests.json
//   npm run seed -- data/khac.json    -> đọc file khác
import '../src/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDb } from '../src/db.js';
import { Guest } from '../src/models/Guest.js';
import { makeSlug, SLUG_RE } from '../src/utils/slug.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const file = path.resolve(root, process.argv[2] || 'data/guests.json');
const baseUrl = (process.env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');

if (!fs.existsSync(file)) {
  console.error(`Không thấy file ${file}.\nHãy copy data/guests.example.json thành data/guests.json rồi sửa danh sách.`);
  process.exit(1);
}

const list = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(list)) {
  console.error('File phải là một mảng JSON: [{ "name": "...", "honorific": "...", "group": "..." }]');
  process.exit(1);
}

await connectDb(process.env.MONGODB_URI);

const rows = [];
let created = 0;

for (const item of list) {
  const name = String(item.name || '').trim();
  if (!name) continue;
  const honorific = String(item.honorific || 'bạn').trim();
  const group = String(item.group || '').trim();

  // Chạy lại nhiều lần không tạo trùng: coi (tên + xưng hô + nhóm) là một người.
  let guest = await Guest.findOne({ name, honorific, group });
  if (!guest) {
    const slug = item.slug && SLUG_RE.test(item.slug) ? item.slug : makeSlug(honorific, name);
    guest = await Guest.create({ slug, name, honorific, group });
    created += 1;
  }
  rows.push({ name: `${honorific} ${name}`, group, link: `${baseUrl}/moi/${guest.slug}` });
}

const csv = ['name,group,link', ...rows.map((r) => `"${r.name}","${r.group}","${r.link}"`)].join('\n');
fs.writeFileSync(path.resolve(root, 'data/links.csv'), `﻿${csv}\n`);

console.log(`\nĐã tạo mới ${created} khách, tổng ${rows.length}. Link riêng:\n`);
for (const r of rows) console.log(`  ${r.name.padEnd(28)} ${r.link}`);
console.log('\nĐã lưu bảng link vào data/links.csv (mở bằng Excel/Google Sheets để gửi cho từng người).');

await mongoose.disconnect();
