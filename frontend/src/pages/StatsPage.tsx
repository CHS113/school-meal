import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import api from '../lib/api';
import { DailyStat, MEAL_LABEL } from '../types';

export default function StatsPage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [summary, setSummary] = useState({ BREAKFAST: 0, LUNCH: 0, DINNER: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/stats/daily?month=${month}`),
      api.get('/stats/summary'),
    ]).then(([d, s]) => {
      setStats(d.data);
      setSummary(s.data);
    }).finally(() => setLoading(false));
  }, [month]);

  // 차트용 데이터 변환 (날짜별로 조식/중식/석식 합치기)
  const chartData = Object.values(
    stats.reduce<Record<string, any>>((acc, s) => {
      const key = s.date.slice(0, 10);
      if (!acc[key]) acc[key] = { date: format(new Date(key), 'M/d'), 조식: 0, 중식: 0, 석식: 0 };
      acc[key][MEAL_LABEL[s.mealType]] = s.count;
      return acc;
    }, {})
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">급식 신청 통계</h2>
          <p className="text-gray-400 mt-1">날짜별 신청 인원 현황</p>
        </div>
        <input
          type="month" value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 이번달 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(['BREAKFAST', 'LUNCH', 'DINNER'] as const).map((type) => (
          <div key={type} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-400 mb-1">이번달 {MEAL_LABEL[type]} 누적</p>
            <p className="text-4xl font-bold text-primary">{summary[type]}</p>
            <p className="text-xs text-gray-400 mt-1">명</p>
          </div>
        ))}
      </div>

      {/* 막대 차트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">일별 신청 현황</h3>
        {loading ? (
          <p className="text-center text-gray-400 py-10">불러오는 중...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="조식" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="중식" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="석식" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 상세 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">상세 내역</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium">날짜</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium">구분</th>
              <th className="px-5 py-3 text-right text-xs text-gray-500 font-medium">신청 인원</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stats.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-600">
                  {format(new Date(s.date), 'M월 d일')}
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium">{MEAL_LABEL[s.mealType]}</span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-gray-800">{s.count}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
