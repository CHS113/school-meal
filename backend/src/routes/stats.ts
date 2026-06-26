import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/stats/daily?month=YYYY-MM - 날짜별 신청 인원
router.get('/daily', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 0);

  const meals = await prisma.meal.findMany({
    where: { date: { gte: start, lte: end } },
    include: {
      subscriptions: { where: { status: 'ACTIVE' } },
    },
    orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
  });

  const result = meals.map((m) => ({
    id: m.id,
    date: m.date,
    mealType: m.mealType,
    count: m.subscriptions.length,
    menu: m.menu,
  }));

  res.json(result);
});

// GET /api/stats/summary - 조식/중식/석식별 이번달 합계
router.get('/summary', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const result = await prisma.subscription.groupBy({
    by: ['mealId'],
    where: {
      status: 'ACTIVE',
      meal: { date: { gte: start, lte: end } },
    },
    _count: { id: true },
  });

  const meals = await prisma.meal.findMany({
    where: { date: { gte: start, lte: end } },
    select: { id: true, mealType: true },
  });

  const mealMap = Object.fromEntries(meals.map((m) => [m.id, m.mealType]));

  const summary = { BREAKFAST: 0, LUNCH: 0, DINNER: 0 };
  for (const r of result) {
    const type = mealMap[r.mealId];
    if (type) summary[type] += r._count.id;
  }

  res.json(summary);
});

// GET /api/stats/users - 전체 사용자 목록 (관리자만)
router.get('/users', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, studentId: true, role: true,
      grade: true, classNum: true, createdAt: true,
      _count: { select: { subscriptions: { where: { status: 'ACTIVE' } } } },
    },
    orderBy: { studentId: 'asc' },
  });
  res.json(users);
});

export default router;
