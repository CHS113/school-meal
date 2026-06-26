import { Router, Response } from 'express';
import { PrismaClient, MealType } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/meals/today
router.get('/today', authenticate, async (req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const meals = await prisma.meal.findMany({
    where: { date: today },
    orderBy: { mealType: 'asc' },
  });
  res.json(meals);
});

// GET /api/meals?date=YYYY-MM-DD
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { date, month } = req.query;

  if (month) {
    // 월별 조회 (YYYY-MM)
    const [year, mon] = (month as string).split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);
    const meals = await prisma.meal.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
    return res.json(meals);
  }

  if (date) {
    const d = new Date(date as string);
    d.setHours(0, 0, 0, 0);
    const meals = await prisma.meal.findMany({
      where: { date: d },
      orderBy: { mealType: 'asc' },
    });
    return res.json(meals);
  }

  res.status(400).json({ message: 'date 또는 month 쿼리가 필요합니다.' });
});

// POST /api/meals (관리자/교사만)
router.post('/', authenticate, requireRole('ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  const { date, mealType, menu, calories } = req.body;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const meal = await prisma.meal.upsert({
    where: { date_mealType: { date: d, mealType: mealType as MealType } },
    update: { menu, calories },
    create: { date: d, mealType: mealType as MealType, menu, calories },
  });
  res.json(meal);
});

// DELETE /api/meals/:id (관리자만)
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  await prisma.meal.delete({ where: { id: req.params.id } });
  res.json({ message: '삭제되었습니다.' });
});

export default router;
