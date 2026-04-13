"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AddSheet } from "./add-sheet";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}

function StatsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 md:left-0 md:top-0 md:w-20 md:border-t-0 md:border-r flex md:flex-col items-center justify-around md:justify-center md:gap-12 h-[64px] md:h-[100dvh] pb-[env(safe-area-inset-bottom)] md:pb-0 px-4 md:px-0">
        
        <Link 
          href="/calendar"
          className={`flex flex-col items-center justify-center w-16 h-12 md:w-12 transition-colors ${pathname === '/calendar' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'}`}
        >
          <CalendarIcon className="w-6 h-6" />
        </Link>

        {/* Center Add Button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="relative -top-3 md:top-0 w-14 h-14 bg-zinc-900 dark:bg-zinc-50 rounded-full flex items-center justify-center text-white dark:text-zinc-900 shadow-lg hover:scale-105 transition-transform shrink-0"
        >
          <PlusIcon className="w-8 h-8" />
        </button>

        <Link 
          href="/stats"
          className={`flex flex-col items-center justify-center w-16 h-12 md:w-12 transition-colors ${pathname === '/stats' ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'}`}
        >
          <StatsIcon className="w-6 h-6" />
        </Link>
        
      </nav>

      <AddSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
