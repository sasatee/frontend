import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import { ThemeToggle } from './theme-toggle';
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

// Layout component wraps the sidebar and main content area
const Layout: React.FC<{ children?: React.ReactNode }> = ({ children = null }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userInitials =
    user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar on the left */}
      <Sidebar />
      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
        {/* Professional header/top bar */}
        <header className="sticky top-0 z-20 flex w-full items-center justify-between border-b bg-background/95 px-6 py-3 text-foreground shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Current route: {location.pathname}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/static/images/avatar/1.jpg" alt={user?.firstName || 'User'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:block">
                  {user.firstName} {user.lastName}
                </span>
                <LogoutButton variant="ghost" size="sm" />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-0 text-foreground md:p-6">
          {/* Render nested route content */}
          <Outlet />
          {/* Fallback to children if provided */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
