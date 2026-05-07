import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import LiquidEther from '@/components/BackGround';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { resolvedTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isDark = resolvedTheme === 'dark';

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate({ to: '/projects' });
    } else {
      navigate({ to: '/auth/signup' });
    }
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}
      data-theme={isDark ? 'dark' : 'light'}
      style={{
        backgroundColor: isDark ? '#000' : '#ffffff',
        colorScheme: isDark ? 'dark' : 'light',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LiquidEther
          colors={['#ff2929', '#f291aa', '#d4d2db']}
          mouseForce={18}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={0}
          autoRampDuration={0.6}
        />
      </div>
      <div className="relative z-20 flex flex-col h-full w-full justify-center items-center">
        <p
          className={`text-7xl font-bold tracking-tight mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'} drop-shadow-lg`}
        >
          AIANO
        </p>
        <p
          className={`text-xl mb-8 text-center max-w-2xl ${isDark ? 'text-white/90' : 'text-gray-700'} drop-shadow-md`}
        >
          Enhancing Information Retrieval with AI Augmented Annotation.
        </p>
        <div className="flex gap-4">
          <Button
            variant="default"
            onClick={handleGetStarted}
            style={{
              backgroundColor: isDark ? '#ef5054' : undefined,
              color: isDark ? '#ffffff' : undefined,
              border: isDark ? '1px solid #ef5054' : undefined,
            }}
          >
            Get Started
          </Button>
          <Link to="/docs">
            <Button
              variant="ghost"
              className={
                isDark
                  ? 'border border-white/15 text-white hover:bg-white/20'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }
            >
              Read The Docs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
