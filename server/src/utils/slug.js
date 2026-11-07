import { randomInt } from 'node:crypto';

// Bỏ ký tự dễ nhầm (0/o, 1/l/i) để khách gõ tay link vẫn đúng.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export const SLUG_RE = /^[a-z0-9-]{3,60}$/;

export function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function randomSuffix(length = 4) {
  let out = '';
  for (let i = 0; i < length; i += 1) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

// "cô" + "Lan" -> "co-lan-x7k2". Phần ngẫu nhiên giúp không ai đoán được link của người khác.
export function makeSlug(honorific, name) {
  const base = slugify(`${honorific} ${name}`) || 'khach';
  return `${base}-${randomSuffix()}`;
}
