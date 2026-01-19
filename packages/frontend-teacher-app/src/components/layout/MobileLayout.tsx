import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, ClipboardList, Settings, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/training', icon: GraduationCap, label: 'Training' },
  { path: '/report', icon: PlusCircle, label: 'Report' },
  { path: '/history', icon: ClipboardList, label: 'History' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className={cn(
        "flex-1 overflow-y-auto",
        showNav && "pb-20"
      )}>
        {children}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110"
                  )} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
