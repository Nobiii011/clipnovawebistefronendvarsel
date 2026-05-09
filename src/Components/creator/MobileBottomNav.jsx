// src/components/creator/MobileBottomNav.jsx
import { NavLink } from "react-router-dom";
import { Home, Upload, Video, Send, Wallet } from "lucide-react";
import { ROUTES } from "../../constants/routes";

const NAV = [
  { icon: Home,   path: ROUTES.DASHBOARD,       label: "Home" },
  { icon: Video,  path: ROUTES.UPLOADED_VIDEOS, label: "Videos" },
  { icon: Upload, path: ROUTES.UPLOAD,          label: "Upload" },
  { icon: Send,   path: ROUTES.TELEGRAM,        label: "Telegram" },
  { icon: Wallet, path: ROUTES.WITHDRAWALS,     label: "Wallet" },
];

export default function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ icon: Icon, path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition text-xs font-medium
              ${isActive ? "text-cyan-400" : "text-white/40 hover:text-white/70"}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
