import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../ui/sidebar';
import { ThemeToggle } from '../ui/theme-toggle';
// @ts-ignore
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  // @ts-ignore
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { useToast } from '../ui/use-toast';
import { SkipLink } from '../ui/skip-link';
// @ts-ignore
import { AdminOnly, EmployeeOrAdmin } from '@/components/auth/RoleBasedUI';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Search,
  // @ts-ignore
  Command,
  // @ts-ignore
  ChevronDown,
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  // @ts-ignore
  DollarSign,
  // @ts-ignore
  BadgeDollarSign,
  // @ts-ignore
  MinusCircle,
  // @ts-ignore
  Group,
  UserCircle,
  Settings,
  Menu,
  RefreshCw,
  Bell,
  // @ts-ignore
  CalendarRange,
  // @ts-ignore
  Calendar,
  // @ts-ignore
  Building,
  // @ts-ignore
  Briefcase,
  // @ts-ignore
  CalendarCheck,
  // @ts-ignore
  CalendarClock,
  Plus,
  Shield,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from '../ui/dropdown-menu';
import { Tooltip } from '../ui/tooltip';
// @ts-ignore
import { Badge } from '../ui/badge';
// @ts-ignore
import { Separator } from '../ui/separator';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { announce } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error logging out',
        description: 'There was a problem logging out. Please try again.',
      });
    }
  };

  // Command menu keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const userInitials =
    user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Format segment for display (capitalize, replace hyphens with spaces)
  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Recent searches for command menu
  const recentSearches = [
    { id: '1', term: 'Leave requests', path: '/dashboard/leave-requests' },
    { id: '3', term: 'John Doe', path: '/dashboard/employees' },
  ];

  // Quick actions for command menu
  const quickActions = [
    {
      id: '1',
      label: 'New Employee',
      path: '/dashboard/employees',
      action: () => {
        navigate('/dashboard/employees');
        setOpen(false);
      },
    },
    {
      id: '2',
      label: 'New Attendance',
      path: '/dashboard/attendance/new',
      action: () => {
        navigate('/dashboard/attendance/new');
        setOpen(false);
      },
    },
    {
      id: '3',
      label: 'New Leave Request',
      path: '/dashboard/leave-requests',
      action: () => {
        navigate('/dashboard/leave-requests');
        setOpen(false);
      },
    },
  ];

  // Announce page changes for screen readers
  useEffect(() => {
    // @ts-ignore
    const currentPath = location.pathname;
    const pageTitle =
      pathSegments.length > 0 ? formatSegment(pathSegments[pathSegments.length - 1]) : 'Dashboard';

    announce(`Navigated to ${pageTitle} page`, false);
  }, [location.pathname, pathSegments, announce]);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <SkipLink targetId="main-content" />
      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex w-full flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </BreadcrumbItem>
                  {pathSegments.slice(1).map((segment, index) => (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === pathSegments.length - 2 ? (
                          <BreadcrumbPage className="text-sm font-medium">
                            {formatSegment(segment)}
                          </BreadcrumbPage>
                        ) : (
                          <Link
                            to={`/${pathSegments.slice(0, index + 2).join('/')}`}
                            className="text-sm font-medium transition-colors hover:text-foreground"
                          >
                            {formatSegment(segment)}
                          </Link>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <span className="text-sm font-medium md:hidden">
                {formatSegment(pathSegments[pathSegments.length - 1] || 'Dashboard')}
              </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden h-9 items-center gap-2 text-muted-foreground md:flex"
                onClick={() => setOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline-flex">Search...</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                onClick={() => setOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Notifications dropdown */}
              <DropdownMenu>
                <Tooltip content="Notifications">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9">
                      <Bell className="h-4 w-4" />
                      {/* unreadNotificationsCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px]"
                        >
                          {unreadNotificationsCount}
                        </Badge>
                      ) */}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-2">
                    <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
                    {/* unreadNotificationsCount > 0 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={markAllNotificationsAsRead}
                        className="h-7 text-xs"
                      >
                        Mark all as read
                      </Button>
                    ) */}
                  </div>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-80">
                    {/* notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex cursor-default flex-col items-start p-3"
                          onSelect={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex w-full justify-between">
                            <span
                              className={`font-medium ${notification.read ? '' : 'text-primary'}`}
                            >
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <Badge variant="secondary" className="ml-2 h-auto">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {notification.description}
                          </span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">No notifications</div>
                    ) */}
                  </ScrollArea>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/dashboard/notifications')}
                    className="justify-center"
                  >
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />

              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger>
                  <div
                    className={cn(
                      'hidden items-center gap-1 text-sm font-medium md:flex'
                      // getTimerColor()
                    )}
                  >
                    <span className="sr-only">Session time remaining:</span>
                    {/* formatTime(remainingSessionTime) */}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-60" align="end">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm">
                      Your session will expire in {/* formatTime(remainingSessionTime) */}
                    </p>
                    <Button size="sm" onClick={() => {}} className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Extend Session
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/static/images/avatar/1.jpg"
                        alt={user?.firstName || 'User'}
                      />
                      <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/change-password')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/accessibility-guide')}>
                      <span role="img" aria-label="Accessibility" className="mr-2">
                        ♿
                      </span>
                      <span>Accessibility Guide</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <ScrollArea className="flex-1">
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-background p-0 text-foreground md:p-6"
          >
            <Outlet />
            {children}
          </main>
        </ScrollArea>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((search) => (
                  <CommandItem
                    key={search.id}
                    onSelect={() => {
                      navigate(search.path);
                      setOpen(false);
                    }}
                  >
                    <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                    {search.term}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem key={action.id} onSelect={action.action}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                navigate('/dashboard');
                setOpen(false);
              }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/employees');
                setOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Employees
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/departments');
                setOpen(false);
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Departments
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/attendance');
                setOpen(false);
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              Attendance
              <CommandShortcut>⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/profile');
                setOpen(false);
              }}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/change-password');
                setOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Change Password
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/roles');
                setOpen(false);
              }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Roles
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Accessibility">
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/accessibility-guide');
                setOpen(false);
              }}
            >
              <span role="img" aria-label="Accessibility" className="mr-2">
                ♿
              </span>
              Accessibility Guide
            </CommandItem>
            <CommandItem
              onSelect={() => {
                navigate('/dashboard/accessible-employee-form');
                setOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Accessible Employee Form
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default DashboardLayout;
