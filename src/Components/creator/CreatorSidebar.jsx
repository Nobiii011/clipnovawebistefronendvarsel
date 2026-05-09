// CreatorSidebar — migrated from src/Components/Sidebar.jsx.
// Uses AuthContext for logout instead of old fake Utils/auth.js.
// Visual design preserved exactly.

import { Home, Upload, Video, Users, CreditCard, Wallet, HelpCircle, LogOut, X, Send, Settings } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const MENU_ITEMS = [
  { name: "Dashboard",       icon: Home,       path: ROUTES.DASHBOARD },
  { name: "Upload Video",    icon: Upload,     path: ROUTES.UPLOAD },
  { name: "My Videos",       icon: Video,      path: ROUTES.UPLOADED_VIDEOS },
  { name: "Telegram",        icon: Send,       path: ROUTES.TELEGRAM },
  { name: "Referrals",       icon: Users,      path: ROUTES.REFERRALS },
  { name: "Payments",        icon: CreditCard, path: ROUTES.PAYMENTS },
  { name: "Withdrawals",     icon: Wallet,     path: ROUTES.WITHDRAWALS },
  { name: "Support",         icon: HelpCircle, path: ROUTES.SUPPORT },
  { name: "Settings",        icon: Settings,   path: ROUTES.SETTINGS },
];

export default function CreatorSidebar({ isOpen, setIsOpen }) {
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
          bg-[#FCF9EA] text-[#0F2854]
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-[#1C4D8D]/20 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#0F2854]">NovaX</h1>
            <p className="text-sm text-[#1C4D8D]">Creator Panel</p>
          </div>
          <button className="lg:hidden text-[#0F2854]" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.DASHBOARD}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
                ${isActive ? "bg-[#4988C4] text-white" : "hover:bg-[#1C4D8D]/10 text-[#0F2854]"}`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1C4D8D]/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-2 rounded-full text-red-700 hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
