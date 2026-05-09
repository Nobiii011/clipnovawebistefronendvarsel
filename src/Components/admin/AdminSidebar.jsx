// AdminSidebar — navigation for admin panel.
// Visually distinct from CreatorSidebar (dark theme, red accent for admin).
// Uses AuthContext for logout.

import { LayoutDashboard, Users, Wallet, Shield, BarChart3, FileText, Settings, LogOut, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const ADMIN_MENU = [
  { name: "Dashboard",   icon: LayoutDashboard, path: ROUTES.ADMIN },
  { name: "Users",       icon: Users,           path: ROUTES.ADMIN_USERS },
  { name: "Withdrawals", icon: Wallet,          path: ROUTES.ADMIN_WITHDRAWALS },
  { name: "Fraud",       icon: Shield,          path: ROUTES.ADMIN_FRAUD },
  { name: "Analytics",   icon: BarChart3,       path: ROUTES.ADMIN_ANALYTICS },
  { name: "Audit Logs",  icon: FileText,        path: ROUTES.ADMIN_AUDIT_LOGS },
  { name: "Settings",    icon: Settings,        path: ROUTES.ADMIN_SETTINGS },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 min-h-screen w-64 z-50
          bg-gradient-to-b from-gray-900 to-black border-r border-gray-800
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              NovaX Admin
            </h1>
            <p className="text-sm text-gray-400">Super Admin Panel</p>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {ADMIN_MENU.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.ADMIN}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-white
                ${isActive ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-lg" : "hover:bg-gray-800"}`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-2 rounded-full text-red-400 hover:bg-red-900/20 transition w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
