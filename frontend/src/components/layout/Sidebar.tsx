import { Link, useLocation } from 'react-router-dom';
import { Briefcase, TrendingUp, FileText, Users, PlusCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { authAPI } from '@/services/api';

export default function Sidebar() {
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const professionalLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/projects', label: 'Find Projects', icon: Briefcase },
    { path: '/applications', label: 'My Applications', icon: FileText },
    { path: '/profile', label: 'Profile', icon: Users },
  ];

  const companyLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/projects/new', label: 'Post a Project', icon: PlusCircle },
    { path: '/projects', label: 'Manage Projects', icon: Briefcase },
    { path: '/talent', label: 'Search Talent', icon: Users },
  ];

  const links = user?.userType === 'professional' ? professionalLinks : companyLinks;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Professional Network</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 p-3 rounded-lg bg-muted">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.userType}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
