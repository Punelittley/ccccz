import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { LogOut, Home } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/admin", label: "Панель управления" },
    { path: "/admin/books", label: "Управление книгами" },
    { path: "/admin/users", label: "Управление пользователями" },
    { path: "/admin/content", label: "Управление контентом" }
  ];

  return (
    <div className="app-page section-muted">
      <aside className="admin-sidebar">
        <div className="p-6 border-b">
          <h2 className="font-bold text-xl">Админ-панель</h2>
          <p className="text-sm text-muted mt-1">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home style={{ width: 16, height: 16, marginRight: 8 }} />
              На главную
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut style={{ width: 16, height: 16, marginRight: 8 }} />
            Выйти
          </Button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
