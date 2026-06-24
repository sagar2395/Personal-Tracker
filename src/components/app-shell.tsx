import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-16 overflow-y-auto">{children}</main>
      <BottomNav />
    </>
  );
}
