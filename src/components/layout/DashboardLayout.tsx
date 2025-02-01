import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['ADMIN', 'SCOLARITE', 'STUDENT'],
    },
    {
      name: 'Students',
      icon: Users,
      href: '/dashboard/students',
      roles: ['ADMIN', 'SCOLARITE'],
    },
    {
      name: 'Courses',
      icon: BookOpen,
      href: '/dashboard/courses',
      roles: ['ADMIN', 'SCOLARITE', 'STUDENT'],
    },
    {
      name: 'Grades',
      icon: GraduationCap,
      href: '/dashboard/grades',
      roles: ['ADMIN', 'SCOLARITE'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold">Student Management</h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="px-4 py-4">
          {menuItems
            .filter(item => item.roles.includes(user?.role || ''))
            .map(item => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white shadow-sm z-40">
          <div className="flex items-center justify-between h-full px-4">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email} ({user?.role})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}