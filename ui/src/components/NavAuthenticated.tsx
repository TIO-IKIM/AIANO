import {
  Header,
  HeaderItem,
  HeaderTitle,
} from '@ikim-ui/ui-components/primitive/header';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { LogOut, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ikim-ui/ui-components/primitive/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';

interface AuthenticatedHeaderProps {
  activeRoute: string;
}

function AuthenticatedHeader({ activeRoute }: AuthenticatedHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLandingPage = activeRoute === '/';
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleLogout = () => {
    logout();
    navigate({ to: '/auth/login' });
  };

  return (
    <Header
      className={`h-14 ${isLandingPage ? 'backdrop-blur-sm' : ''}`}
      data-theme={isLandingPage ? 'light' : undefined}
      style={
        isLandingPage
          ? {
              backgroundColor: isDark
                ? 'transparent'
                : 'rgba(248, 250, 252, 0.8)',
              border: 'none',
              boxShadow: 'none',
              borderBottom: 'none',
            }
          : {
              backgroundColor: isDark ? '#000000' : '#ffffff',
            }
      }
    >
      <HeaderTitle
        className={`text-base ${isLandingPage ? (isDark ? 'text-white' : 'text-gray-900') : ''}`}
      >
        <Link to="/">AIANO</Link>
      </HeaderTitle>
      <div className="flex flex-1 gap-4 ml-12">
        <Link to="/projects">
          <HeaderItem
            isActive={activeRoute.startsWith('/projects')}
            className={
              isLandingPage
                ? isDark
                  ? '!text-white/80 hover:!text-white hover:!bg-white/10 !bg-transparent px-3 py-2 rounded-md transition-colors'
                  : '!text-gray-700 hover:!text-gray-900 hover:!bg-gray-100 !bg-transparent px-3 py-2 rounded-md transition-colors'
                : ''
            }
          >
            Projects
          </HeaderItem>
        </Link>
        <Link to="/settings">
          <HeaderItem
            isActive={activeRoute === '/settings'}
            className={
              isLandingPage
                ? isDark
                  ? '!text-white/80 hover:!text-white hover:!bg-white/10 !bg-transparent px-3 py-2 rounded-md transition-colors'
                  : '!text-gray-700 hover:!text-gray-900 hover:!bg-gray-100 !bg-transparent px-3 py-2 rounded-md transition-colors'
                : ''
            }
          >
            Settings
          </HeaderItem>
        </Link>
      </div>
      <div className="flex gap-4 mr-12 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 ${isLandingPage ? (isDark ? 'text-white hover:bg-white/20 border border-white/30' : 'text-gray-700 hover:bg-gray-100 border border-gray-300') : ''}`}
            >
              <User className="h-4 w-4" />
              {user?.username || 'User'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Header>
  );
}

export default AuthenticatedHeader;
