import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '../lib/api';
import { Subscription, MEAL_LABEL, MEAL_COLOR, MealType } from '../types';

export default function SubscriptionPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await api.get(`/subscriptions/me?month=${month}`);
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [month]);

  const handleCancel = async (id: string) => {
    if (!confirm('신청을 취소하시겠습니까?')) return;
    await api.delete(`/subscriptions/${id}`);
    fetchSubs();
  };

  const grouped = subs.reduce<Record<string, Subscription[]>>((acc, s) => {
    const key = s.meal.date.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">내 급식 신청 현황</h2>
          <p className="text-gray-400 mt-1">이번 달 신청 내역</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['BREAKFAST', 'LUNCH', 'DINNER'] as MealType[]).map((type) => {
          const count = subs.filter((s) => s.meal.mealType === type).length;
          return (
            <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{MEAL_LABEL[type]}</p>
              <p className="text-3xl font-bold text-gray-800">{count}</p>
              <p className="text-xs text-gray-400">회</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-gray-400">불러오는 중...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>신청 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([date, items]) => (
            <div key={date} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })}
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${MEAL_COLOR[sub.meal.mealType as MealType]}`}>
                        {MEAL_LABEL[sub.meal.mealType as MealType]}
                      </span>
                      <span className="text-sm text-gray-600">{sub.meal.menu.join(', ')}</span>
                    </div>
                    <button
                      onClick={() => handleCancel(sub.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
