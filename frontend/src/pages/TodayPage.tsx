import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Meal, MealType, MEAL_LABEL, MEAL_COLOR, Subscription } from '../types';

export default function TodayPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  useEffect(() => {
    Promise.all([
      api.get('/meals/today'),
      api.get('/subscriptions/me'),
    ]).then(([m, s]) => {
      setMeals(m.data);
      setSubs(s.data);
    }).finally(() => setLoading(false));
  }, []);

  const isSubscribed = (mealId: string) => subs.some((s) => s.mealId === mealId);

  const handleSubscribe = async (mealId: string) => {
    await api.post('/subscriptions', { mealId });
    const { data } = await api.get('/subscriptions/me');
    setSubs(data);
  };

  const handleCancel = async (mealId: string) => {
    const sub = subs.find((s) => s.mealId === mealId);
    if (!sub) return;
    await api.delete(`/subscriptions/${sub.id}`);
    const { data } = await api.get('/subscriptions/me');
    setSubs(data);
  };

  if (loading) return <div className="p-8 text-gray-400">불러오는 중...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">오늘의 급식</h2>
        <p className="text-gray-400 mt-1">{dateStr}</p>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🈳</div>
          <p>오늘 등록된 급식이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['BREAKFAST', 'LUNCH', 'DINNER'] as MealType[]).map((type) => {
            const meal = meals.find((m) => m.mealType === type);
            const subscribed = meal ? isSubscribed(meal.id) : false;

            return (
              <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between`}>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${MEAL_COLOR[type]}`}>
                    {MEAL_LABEL[type]}
                  </span>
                  {meal?.calories && (
                    <span className="text-xs text-gray-400">{meal.calories} kcal</span>
                  )}
                </div>

                <div className="p-5">
                  {meal ? (
                    <>
                      <ul className="space-y-1.5 mb-5">
                        {meal.menu.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => subscribed ? handleCancel(meal.id) : handleSubscribe(meal.id)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          subscribed
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                      >
                        {subscribed ? '신청 취소' : '급식 신청'}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">등록된 메뉴 없음</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
