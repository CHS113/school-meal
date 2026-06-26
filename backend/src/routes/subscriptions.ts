import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/subscriptions/me - 내 신청 목록
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const { month } = req.query;
  let dateFilter = {};

  if (month) {
    const [year, mon] = (month as string).split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);
    dateFilter = { meal: { date: { gte: start, lte: end } } };
  }

  const subs = await prisma.subscription.findMany({
    where: { userId: req.user!.id, status: 'ACTIVE', ...dateFilter },
    include: { meal: true },
    orderBy: { meal: { date: 'asc' } },
  });
  res.json(subs);
});

// POST /api/subscriptions - 급식 신청
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { mealId } = req.body;

  // 중복 신청 확인
  const existing = await prisma.subscription.findFirst({
    where: { userId: req.user!.id, mealId, status: 'ACTIVE' },
  });
  if (existing) return res.status(400).json({ message: '이미 신청한 급식입니다.' });

  // 과거 날짜 신청 방지
  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal) return res.status(404).json({ message: '급식을 찾을 수 없습니다.' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (meal.date < today) return res.status(400).json({ message: '지난 날짜는 신청할 수 없습니다.' });

  const sub = await prisma.subscription.upsert({
    where: { userId_mealId: { userId: req.user!.id, mealId } },
    update: { status: 'ACTIVE' },
    create: { userId: req.user!.id, mealId },
  });
  res.json(sub);
});

// DELETE /api/subscriptions/:id - 신청 취소
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const sub = await prisma.subscription.findUnique({ where: { id: req.params.id } });
  if (!sub || sub.userId !== req.user!.id)
    return res.status(403).json({ message: '권한이 없습니다.' });

  await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });
  res.json({ message: '신청이 취소되었습니다.' });
});

export default router;
