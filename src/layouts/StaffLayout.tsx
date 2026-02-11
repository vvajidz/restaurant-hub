import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  ClipboardList,
  Armchair,
  ChefHat,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/urls';
import restaurantLogo from '@/assets/restaurant-logo.png';

const navItems = [
  { icon: ShoppingCart, label: 'POS', path: ROUTES.STAFF.POS },
  { icon: ClipboardList, label: 'Orders', path: ROUTES.STAFF.ORDERS },
  { icon: Armchair, label: 'Tables', path: ROUTES.STAFF.SEATING },
  { icon: ChefHat, label: 'Kitchen', path: ROUTES.STAFF.KITCHEN },
];

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <img src={restaurantLogo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-foreground hidden sm:inline">La Bella Italia</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
