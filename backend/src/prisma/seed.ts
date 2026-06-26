import { PrismaClient, Role, MealType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 관리자 계정
  const adminPw = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { studentId: 'admin' },
    update: {},
    create: {
      studentId: 'admin',
      name: '관리자',
      password: adminPw,
      role: Role.ADMIN,
    },
  });

  // 교사 계정
  const teacherPw = await bcrypt.hash('teacher1234', 10);
  await prisma.user.upsert({
    where: { studentId: 'T20240001' },
    update: {},
    create: {
      studentId: 'T20240001',
      name: '김선생',
      password: teacherPw,
      role: Role.TEACHER,
    },
  });

  // 학생 계정 3명
  const studentPw = await bcrypt.hash('student1234', 10);
  const students = [
    { studentId: 'S20240001', name: '홍길동', grade: 1, classNum: 1 },
    { studentId: 'S20240002', name: '이순신', grade: 1, classNum: 2 },
    { studentId: 'S20240003', name: '김유신', grade: 2, classNum: 1 },
  ];
  for (const s of students) {
    await prisma.user.upsert({
      where: { studentId: s.studentId },
      update: {},
      create: { ...s, password: studentPw, role: Role.STUDENT },
    });
  }

  // 오늘 기준 7일치 급식 메뉴 생성
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    await prisma.meal.upsert({
      where: { date_mealType: { date, mealType: MealType.BREAKFAST } },
      update: {},
      create: {
        date, mealType: MealType.BREAKFAST,
        menu: ['흰쌀죽', '김치', '계란후라이', '우유'],
        calories: 450,
      },
    });
    await prisma.meal.upsert({
      where: { date_mealType: { date, mealType: MealType.LUNCH } },
      update: {},
      create: {
        date, mealType: MealType.LUNCH,
        menu: ['쌀밥', '된장찌개', '제육볶음', '깍두기', '배추김치', '요구르트'],
        calories: 850,
      },
    });
    await prisma.meal.upsert({
      where: { date_mealType: { date, mealType: MealType.DINNER } },
      update: {},
      create: {
        date, mealType: MealType.DINNER,
        menu: ['쌀밥', '부대찌개', '계란말이', '총각김치', '배추김치'],
        calories: 750,
      },
    });
  }

  console.log('✅ 시드 완료!');
  console.log('');
  console.log('테스트 계정:');
  console.log('  관리자: admin / admin1234');
  console.log('  교사:   T20240001 / teacher1234');
  console.log('  학생:   S20240001 / student1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
