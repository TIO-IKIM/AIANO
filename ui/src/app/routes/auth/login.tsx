import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Checkbox } from '@ikim-ui/ui-components/primitive/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' }) as { redirect?: string };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);

      // Redirect to the intended page or projects
      const redirectTo = search.redirect || '/projects';

      // Ensure we don't redirect to login page again
      if (
        redirectTo === '/auth/login' ||
        redirectTo.startsWith('/auth/login')
      ) {
        navigate({ to: '/projects' });
      } else {
        navigate({ to: redirectTo });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-1/3">
        <CardHeader className="w-full">
          <CardTitle className="font-bold">Sign in to continue</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 mb-3 w-full"
          >
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email (Required)"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (Required)"
                className="w-full pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            <div className="flex flex-row gap-2">
              <Checkbox
                className="w-4 h-4 border-input"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <Label className="text-sm">Remember me</Label>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <div className="flex flex-1 justify-between gap-2 items-center">
              <div className="w-1/2 h-px bg-border" />
              <Label className="text-sm text-center">or</Label>
              <div className="w-1/2 h-px bg-border" />
            </div>

            <Label className="font-bold justify-center">
              SSO
            </Label>
            <Button
              variant="secondary"
              className="w-full"
              type="button"
              disabled
            >
              Login with OIDC
            </Button>

            <div className="flex flex-1 justify-between gap-2 items-center mt-2">
              <Label className="text-sm justify-center">
                Don't have an account? <Link to="/auth/signup">Sign up</Link>
              </Label>
              <Link
                className="text-sm text-muted-foreground"
                to="/auth/forgot-password"
              >
                Lost your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
