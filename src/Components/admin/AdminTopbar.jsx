// AdminTopbar — sticky top bar for admin panel.
// Shows mobile menu toggle, current page context, and admin user badge.

import { Menu, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar({ setIsOpen }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="text-white" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="text-red-500" size={20} />
            <span className="text-white font-semibold">Admin Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-3 py-1 rounded-full font-medium">
            SUPER ADMIN
          </span>
          {user?.name && (
            <span className="text-sm text-gray-400 hidden sm:block">{user.name}</span>
          )}
        </div>
      </div>
    </header>
  );
}
