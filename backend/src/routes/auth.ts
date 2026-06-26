import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { studentId, password } = req.body;
  if (!studentId || !password)
    return res.status(400).json({ message: '학번/사번과 비밀번호를 입력해주세요.' });

  const user = await prisma.user.findUnique({ where: { studentId } });
  if (!user) return res.status(401).json({ message: '존재하지 않는 계정입니다.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });

  const token = jwt.sign(
    { id: user.id, studentId: user.studentId, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, studentId: user.studentId, role: user.role },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, studentId: true, role: true, grade: true, classNum: true },
  });
  res.json(user);
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ message: '현재 비밀번호가 틀렸습니다.' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  res.json({ message: '비밀번호가 변경되었습니다.' });
});

export default router;
