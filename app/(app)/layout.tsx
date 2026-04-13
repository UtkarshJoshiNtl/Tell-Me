import { BottomDock } from "@/components/bottom-dock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh]">
      <BottomDock />
      <div className="flex-1 pb-[64px] pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0 md:pl-20 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
