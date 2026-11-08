import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Guest } from '../models/Guest.js';
import { SLUG_RE } from '../utils/slug.js';

const router = Router();

const rsvpLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn thao tác hơi nhanh, thử lại sau một phút nhé.' }
});

// Chỉ trả về những gì chính khách đó cần thấy.
function publicGuest(g) {
  return {
    slug: g.slug,
    name: g.name,
    honorific: g.honorific,
    rsvp: {
      status: g.rsvp?.status ?? null,
      reason: g.rsvp?.reason ?? '',
      wish: g.rsvp?.wish ?? '',
      contact: g.rsvp?.contact ?? '',
      respondedAt: g.rsvp?.respondedAt ?? null
    }
  };
}

const notFound = { error: 'Không tìm thấy thiệp mời này.' };

router.param('slug', (req, res, next, slug) => {
  if (!SLUG_RE.test(slug)) return res.status(404).json(notFound);
  return next();
});

// Lấy thông tin khách theo slug (đồng thời đếm lượt mở thiệp)
router.get('/guests/:slug', async (req, res, next) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { visits: 1 }, $set: { lastVisitAt: new Date() } },
      { new: true }
    ).lean();
    if (!guest) return res.status(404).json(notFound);
    res.set('Cache-Control', 'no-store');
    return res.json(publicGuest(guest));
  } catch (err) {
    return next(err);
  }
});

const rsvpSchema = z
  .object({
    status: z.enum(['yes', 'no'], { message: 'Bạn hãy chọn đi hoặc không đi.' }),
    reason: z.string().trim().max(500, 'Lý do tối đa 500 ký tự.').optional().default(''),
    wish: z.string().trim().max(500, 'Lời chúc tối đa 500 ký tự.').optional().default(''),
    contact: z.string().trim().min(1, 'Bạn vui lòng để lại thông tin liên lạc.').max(100, 'Thông tin liên lạc tối đa 100 ký tự.')
  })
  .superRefine((value, ctx) => {
    if (value.status === 'no' && !value.reason) {
      ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Bạn cho mình biết lý do với nhé.' });
    }
  });

// Gửi / sửa xác nhận tham dự (được gửi lại nhiều lần để khách đổi ý)
router.put('/guests/:slug/rsvp', rsvpLimiter, async (req, res, next) => {
  try {
    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(400).json({ error: issue.message, field: issue.path[0] ?? null });
    }
    const { status, wish } = parsed.data;
    const reason = status === 'no' ? parsed.data.reason : '';

    const guest = await Guest.findOne({ slug: req.params.slug });
    if (!guest) return res.status(404).json(notFound);

    // Đổi lời chúc thì cần duyệt lại trước khi lên sổ lưu bút
    if ((guest.rsvp?.wish ?? '') !== wish) guest.wishVisible = false;

    guest.rsvp = { status, reason, wish, contact: parsed.data.contact, respondedAt: new Date() };
    await guest.save();
    return res.json(publicGuest(guest.toObject()));
  } catch (err) {
    return next(err);
  }
});

const ANONYMOUS_NAMES = [
  'Mèo thần tài',
  'Kỳ lân ham ăn',
  'Rồng biếu tiền',
  'Bà Ngoại yêu dấu',
  'Thỏ con vui tính',
  'Chuột đêm thánh thót',
  'Rùa già hiền',
  'Chim bồ câu bình yên',
  'Chó cưng loyal',
  'Hổ ơi hổ',
  'Sư tử bạo chúa',
  'Cáo tinh quỷ',
  'Nai hươu nhẹ nhàng',
  'Cua cương trực',
  'Cá vàng lặng lẽ',
  'Cào cào bao hết',
  'Ốc sên chậm chạp',
  'Chim đại bàng thần',
  'Gấu trúc hiền lành',
  'Lạc đà sa mạc'
];

function getAnonymousName(guestId) {
  const seed = parseInt(guestId.slice(-8), 16);
  return ANONYMOUS_NAMES[seed % ANONYMOUS_NAMES.length];
}

// Sổ lưu bút: chỉ các lời chúc đã duyệt
router.get('/wishes', async (req, res, next) => {
  try {
    if (process.env.GUESTBOOK_ENABLED !== 'true') return res.json({ enabled: false, items: [] });
    const currentSlug = req.query.slug || null;

    const rows = await Guest.find({ wishVisible: true, 'rsvp.wish': { $ne: '' } })
      .select('slug name honorific _id rsvp.wish rsvp.respondedAt')
      .sort({ 'rsvp.respondedAt': -1 })
      .limit(100)
      .lean();

    const items = rows.map((g) => {
      const isOwnWish = currentSlug && g.slug === currentSlug;
      const from = isOwnWish
        ? `${g.honorific} ${g.name}`.trim()
        : getAnonymousName(String(g._id));

      return {
        id: String(g._id),
        from,
        wish: g.rsvp.wish,
        at: g.rsvp.respondedAt,
        isOwn: isOwnWish
      };
    });
    return res.json({ enabled: true, items });
  } catch (err) {
    return next(err);
  }
});

// Admin middleware: kiểm tra admin token
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Không có quyền.' });
  }
  next();
}

// Admin: Lấy danh sách tất cả khách
router.get('/admin/guests', requireAdmin, async (req, res, next) => {
  try {
    const guests = await Guest.find()
      .select('slug name honorific group rsvp.status rsvp.wish wishVisible visits lastVisitAt createdAt')
      .sort({ createdAt: -1 })
      .lean();
    const items = guests.map((g) => ({
      id: String(g._id),
      slug: g.slug,
      name: g.name,
      honorific: g.honorific,
      group: g.group,
      rsvpStatus: g.rsvp?.status ?? null,
      wish: g.rsvp?.wish ?? '',
      wishVisible: Boolean(g.wishVisible),
      visits: g.visits,
      lastVisitAt: g.lastVisitAt,
      createdAt: g.createdAt
    }));
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

// Admin: Thêm khách mới
const addGuestSchema = z.object({
  slug: z.string().regex(SLUG_RE, 'Slug không hợp lệ.'),
  name: z.string().trim().min(1, 'Tên không được để trống.').max(80, 'Tên tối đa 80 ký tự.'),
  honorific: z.string().trim().max(20).default('bạn'),
  group: z.string().trim().max(40).default('')
});

router.post('/admin/guests', requireAdmin, async (req, res, next) => {
  try {
    const parsed = addGuestSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(400).json({ error: issue.message });
    }

    const { slug, name, honorific, group } = parsed.data;

    // Kiểm tra slug đã tồn tại chưa
    const existing = await Guest.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Slug này đã tồn tại rồi.' });
    }

    const guest = new Guest({ slug, name, honorific, group });
    await guest.save();

    return res.status(201).json({
      id: String(guest._id),
      slug: guest.slug,
      name: guest.name,
      honorific: guest.honorific,
      group: guest.group
    });
  } catch (err) {
    return next(err);
  }
});

// Admin: Sửa thông tin khách
const updateGuestSchema = z.object({
  name: z.string().trim().min(1, 'Tên không được để trống.').max(80, 'Tên tối đa 80 ký tự.'),
  honorific: z.string().trim().max(20).default('bạn'),
  group: z.string().trim().max(40).default('')
});

router.put('/admin/guests/:id', requireAdmin, async (req, res, next) => {
  try {
    const parsed = updateGuestSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return res.status(400).json({ error: issue.message });
    }

    const guest = await Guest.findByIdAndUpdate(req.params.id, parsed.data, { new: true }).lean();
    if (!guest) return res.status(404).json({ error: 'Không tìm thấy khách.' });

    return res.json({
      id: String(guest._id),
      slug: guest.slug,
      name: guest.name,
      honorific: guest.honorific,
      group: guest.group,
      rsvpStatus: guest.rsvp?.status ?? null,
      wish: guest.rsvp?.wish ?? '',
      wishVisible: Boolean(guest.wishVisible),
      visits: guest.visits,
      lastVisitAt: guest.lastVisitAt,
      createdAt: guest.createdAt
    });
  } catch (err) {
    return next(err);
  }
});

// Admin: Duyệt (hiện) hoặc ẩn lời chúc trên sổ lưu bút
router.put('/admin/guests/:id/wish-visible', requireAdmin, async (req, res, next) => {
  try {
    if (typeof req.body?.visible !== 'boolean') {
      return res.status(400).json({ error: 'Thiếu trạng thái hiện/ẩn.' });
    }
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { wishVisible: req.body.visible },
      { new: true }
    ).lean();
    if (!guest) return res.status(404).json({ error: 'Không tìm thấy khách.' });
    return res.json({ id: String(guest._id), wishVisible: Boolean(guest.wishVisible) });
  } catch (err) {
    return next(err);
  }
});

// Admin: Xóa khách
router.delete('/admin/guests/:id', requireAdmin, async (req, res, next) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ error: 'Không tìm thấy khách.' });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
