import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Users,
  Building2,
  Clock,
  DollarSign,
  LayoutDashboard,
  UserCircle,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  Plus,
  Group,
  BadgeDollarSign,
  MinusCircle,
  CalendarDays,
  Menu,
  Calendar,
  Building,
  CalendarRange,
  CalendarCheck,
  CalendarClock,
  X,
  Receipt,
  Minus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ScrollArea } from './scroll-area';
import { useRoleBasedAccess } from '@/components/auth/RoleBasedUI';
import { Button } from './button';
import { Separator } from './separator';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  requiredRoles?: string[];
  requireAll?: boolean;
}

interface SidebarSection {
  title?: string;
  links: SidebarLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { leaveRequests } = useLeaveRequests();
  const { canAccess } = useRoleBasedAccess();

  // Calculate pending leave requests
  const pendingLeaveRequests = Array.isArray(leaveRequests)
    ? leaveRequests.filter((request: any) => request.approved === null && !request.cancelled)
        ?.length || 0
    : 0;

  // Generate sidebar sections with dynamic badge for leave requests
  const sidebarSections: SidebarSection[] = [
    // Main Dashboard
    {
      title: 'Overview',
      links: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    // Employees Section (Admin Only)
    {
      title: 'Employee Management',
      links: [
        {
          href: '/dashboard/employees',
          label: 'Employees',
          icon: <Users className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/job-titles',
          label: 'Job Titles',
          icon: <Briefcase className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/departments',
          label: 'Departments',
          icon: <Building className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/category-groups',
          label: 'Category Groups',
          icon: <Group className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
      ],
    },
    // Attendance Section
    {
      title: 'Attendance',
      links: [
        {
          href: '/dashboard/attendance',
          label: 'Attendance Management',
          icon: <Clock className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/attendance/new',
          label: 'New Attendance',
          icon: <Plus className="h-4 w-4" />,
          badge: 'New',
          badgeVariant: 'secondary',
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/my-attendance',
          label: 'My Attendance',
          icon: <CalendarCheck className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
      ],
    },
    // Leave Management Section
    {
      title: 'Leave Management',
      links: [
        {
          href: '/dashboard/leave-types',
          label: 'Leave Types',
          icon: <CalendarRange className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/leave-allocations',
          label: 'Leave Allocations',
          icon: <CalendarDays className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/leave-requests',
          label: 'All Leave Requests',
          icon: <Calendar className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
          ...(pendingLeaveRequests > 0 && {
            badge: pendingLeaveRequests.toString(),
            badgeVariant: 'destructive',
          }),
        },
        {
          href: '/dashboard/my-leave-requests',
          label: 'My Leave Requests',
          icon: <CalendarCheck className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
        {
          href: '/dashboard/leave-balance',
          label: 'Leave Balance',
          icon: <CalendarClock className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
      ],
    },
    // Financial Management Section
    {
      title: 'Financial Management',
      links: [
        {
          href: '/dashboard/allowances',
          label: 'Allowances (Admin)',
          icon: <BadgeDollarSign className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/deductions',
          label: 'Deductions (Admin)',
          icon: <MinusCircle className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
        {
          href: '/dashboard/payroll',
          label: 'Payroll Management',
          icon: <Receipt className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
      ],
    },
    // Personal Finance Section (Employee)
    {
      title: 'My Finance',
      links: [
        {
          href: '/dashboard/my-allowances',
          label: 'My Allowances',
          icon: <BadgeDollarSign className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
        {
          href: '/dashboard/my-deductions',
          label: 'My Deductions',
          icon: <Minus className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
        {
          href: '/dashboard/my-payroll',
          label: 'My Payroll',
          icon: <Receipt className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
      ],
    },
    // Settings Section
    {
      title: 'Settings',
      links: [
        {
          href: '/dashboard/profile',
          label: 'Profile',
          icon: <UserCircle className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
        {
          href: '/dashboard/change-password',
          label: 'Change Password',
          icon: <Settings className="h-4 w-4" />,
          requiredRoles: ['EMPLOYEE', 'ADMIN'],
        },
        {
          href: '/dashboard/roles',
          label: 'Role Management',
          icon: <Shield className="h-4 w-4" />,
          requiredRoles: ['ADMIN'],
        },
      ],
    },
  ];

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
      if (window.innerWidth >= 768) {
        // Reset mobile sidebar state when resizing to desktop
        if (onMobileClose) onMobileClose();
      }
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [onMobileClose]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }

    // Set active section based on current path
    const currentPath = location.pathname;
    for (const section of sidebarSections) {
      if (section.links.some((link) => currentPath.startsWith(link.href))) {
        setActiveSection(section.title || null);
        break;
      }
    }
  }, [location, isMobile, onMobileClose, sidebarSections]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Filter sections based on user roles
  const filteredSections =
    sidebarSections
      ?.map((section) => ({
        ...section,
        links:
          section.links?.filter((link) => {
            // If no roles required, show to all authenticated users
            if (!link.requiredRoles || link.requiredRoles.length === 0) {
              return true;
            }
            // Check if user has required roles
            return canAccess(link.requiredRoles, link.requireAll);
          }) || [],
      }))
      .filter((section) => section.links.length > 0) || [];

  const userInitials =
    user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out md:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64',
          isMobile && 'hidden md:flex',
          isMobileOpen
            ? 'translate-x-0 shadow-xl'
            : '-translate-x-full md:translate-x-0 md:shadow-none'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className={cn('flex items-center gap-2', isCollapsed && 'hidden')}>
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">HR System</span>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn('hidden md:flex', isMobile && 'hidden')}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            {(isMobile || isMobileOpen) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <nav className="space-y-1 p-2">
            <TooltipProvider delayDuration={0}>
              {filteredSections.map((section, index) => (
                <div key={section.title || index} className="space-y-1">
                  {!isCollapsed && section.title && (
                    <h4 className="mb-1 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {section.title}
                    </h4>
                  )}
                  <div className="space-y-0.5">
                    {section.links.map((link) => {
                      const isActive = location.pathname === link.href;
                      const isInSection = location.pathname.startsWith(link.href);

                      return isCollapsed ? (
                        <Tooltip key={link.href} content={link.label}>
                          <TooltipTrigger asChild>
                            <Link
                              to={link.href}
                              className={cn(
                                'relative flex h-8 items-center justify-center rounded-md transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : isInSection
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              {link.icon}
                              {link.badge && (
                                <Badge
                                  variant={link.badgeVariant || 'default'}
                                  className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                                >
                                  {link.badge}
                                </Badge>
                              )}
                            </Link>
                          </TooltipTrigger>
                        </Tooltip>
                      ) : (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={cn(
                            'flex h-8 items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : isInSection
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {link.icon}
                          <span className="flex-1">{link.label}</span>
                          {link.badge && (
                            <Badge variant={link.badgeVariant || 'default'} className="ml-auto">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </nav>
        </ScrollArea>

        <div className="border-t p-2">
          <div
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isCollapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      user?.firstName
                        ? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`
                        : undefined
                    }
                    alt={user?.firstName || 'User'}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="max-w-[140px] truncate font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="max-w-[140px] truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            )}

            {isCollapsed ? (
              <Tooltip content="Logout">
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
