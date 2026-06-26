import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const studentNav = [
  { to: '/',             label: '오늘의 급식',   icon: '🍽️' },
  { to: '/calendar',    label: '급식 캘린더',   icon: '📅' },
  { to: '/subscription',label: '내 신청 현황',  icon: '✅' },
];

const staffNav = [
  { to: '/stats',       label: '신청 통계',     icon: '📊' },
  { to: '/manage',      label: '급식 관리',     icon: '⚙️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isStaff = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-primary">🏫 급식 시스템</h1>
          <p className="text-xs text-gray-400 mt-1">School Meal Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {studentNav.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}

          {isStaff && (
            <>
              <div className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                관리자
              </div>
              {staffNav.map((n) => (
                <NavLink
                  key={n.to} to={n.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>{n.icon}</span> {n.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* 유저 정보 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
              {user?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.studentId}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-xs text-gray-400 hover:text-red-500 transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
