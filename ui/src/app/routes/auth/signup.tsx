import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
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
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await register(email, username, password);

      // Redirect to projects after successful registration
      navigate({ to: '/projects' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-1/3">
        <CardHeader className="w-full">
          <CardTitle className="font-bold">Create your account</CardTitle>
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

            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Username (Required)"
              className="w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password (Required)"
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm Password (Required)"
              className="w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>

            <div className="flex flex-1 justify-center items-center mt-2">
              <Label className="text-sm">
                Already have an account? <Link to="/auth/login">Sign in</Link>
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
