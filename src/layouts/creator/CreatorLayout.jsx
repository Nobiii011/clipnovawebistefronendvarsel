import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import CreatorSidebar from "../../Components/creator/CreatorSidebar";
import MobileBottomNav from "../../Components/creator/MobileBottomNav";
import CommandPalette, { useCommandPalette } from "../../Components/ui/CommandPalette";

export default function CreatorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { open: searchOpen, setOpen: setSearchOpen } = useCommandPalette();

  return (
    <div className="flex min-h-screen w-full bg-neutral-950">
      <CreatorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-neutral-950 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Open menu">
            <Menu size={20} className="text-white" />
          </button>
          <span className="text-white font-bold flex-1">ClipNova</span>
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Search">
            <Search size={18} className="text-white/50" />
          </button>
        </div>

        {/* Desktop search hint */}
        <div className="hidden lg:flex items-center justify-end px-10 pt-4">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 transition hover:bg-white/10">
            <Search size={13} /> Search videos
            <kbd className="ml-1 bg-white/10 rounded px-1 text-white/20">Ctrl K</kbd>
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0 pb-20 lg:pb-10">
          <Outlet context={{ setIsSidebarOpen }} />
        </main>
      </div>

      <MobileBottomNav />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
