import {
  Header,
  HeaderItem,
  HeaderTitle,
} from '@ikim-ui/ui-components/primitive/header';
import { Link } from '@tanstack/react-router';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { useTheme } from '@/components/ThemeProvider';

interface PublicHeaderProps {
  activeRoute: string;
}

function PublicHeader({ activeRoute }: PublicHeaderProps) {
  const isLandingPage = activeRoute === '/';
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
        <Link to="/docs">
          <HeaderItem
            isActive={activeRoute === '/docs'}
            className={
              isLandingPage
                ? isDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'
                : ''
            }
          >
            Docs
          </HeaderItem>
        </Link>
        <Link to="/about">
          <HeaderItem
            isActive={activeRoute === '/about'}
            className={
              isLandingPage
                ? isDark
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'
                : ''
            }
          >
            About
          </HeaderItem>
        </Link>
      </div>
      <div className="flex gap-4 mr-12 items-center">
        <Link to="/auth/login">
          <Button
            variant="ghost"
            className={
              isLandingPage
                ? isDark
                  ? 'border border-white/15 text-white hover:bg-white/20 px-4 py-2'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2'
                : ''
            }
          >
            Login
          </Button>
        </Link>
        <Link to="/auth/signup">
          <Button
            variant="default"
            className={isLandingPage ? 'px-4 py-2' : ''}
          >
            Sign Up
          </Button>
        </Link>
      </div>
    </Header>
  );
}

export default PublicHeader;
