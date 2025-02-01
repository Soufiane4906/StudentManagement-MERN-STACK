import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Mail, Linkedin, Twitter, Microscope as Microsoft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorMessage } from '../ui/error-message';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-500 animate-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-primary-50 transition-colors"
            onClick={() => handleOAuthLogin('google')}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-primary-50 transition-colors"
            onClick={() => handleOAuthLogin('github')}
          >
            <Github className="w-5 h-5 mr-2" />
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-primary-50 transition-colors"
            onClick={() => handleOAuthLogin('microsoft')}
          >
            <Microsoft className="w-5 h-5 mr-2" />
            Microsoft
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-primary-50 transition-colors"
            onClick={() => handleOAuthLogin('linkedin')}
          >
            <Linkedin className="w-5 h-5 mr-2" />
            LinkedIn
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError('')}
            />
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Mail className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
          </Button>

          <div className="text-center text-sm text-gray-600 space-y-1">
            <p className="font-medium">Demo Accounts:</p>
            <p>Admin: admin@school.com / admin123</p>
            <p>Scolarite: scolarite@school.com / scolarite123</p>
            <p>Student: student@school.com / student123</p>
          </div>
        </form>
      </div>
    </div>
  );
}