export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export const MEAL_LABEL: Record<MealType, string> = {
  BREAKFAST: '조식',
  LUNCH: '중식',
  DINNER: '석식',
};

export const MEAL_COLOR: Record<MealType, string> = {
  BREAKFAST: 'bg-amber-100 text-amber-800 border-amber-200',
  LUNCH:     'bg-emerald-100 text-emerald-800 border-emerald-200',
  DINNER:    'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export interface User {
  id: string;
  name: string;
  studentId: string;
  role: Role;
  grade?: number;
  classNum?: number;
}

export interface Meal {
  id: string;
  date: string;
  mealType: MealType;
  menu: string[];
  calories?: number;
}

export interface Subscription {
  id: string;
  mealId: string;
  userId: string;
  status: 'ACTIVE' | 'CANCELLED';
  meal: Meal;
}

export interface DailyStat {
  id: string;
  date: string;
  mealType: MealType;
  count: number;
  menu: string[];
}
