/**
 * LoginPage - Authentication page for Eve Horizon Dashboard
 * Allows users to paste their CLI token to authenticate
 */

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  const [token, setToken] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  // Redirect to projects if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(token.trim());
      navigate('/projects');
    } catch {
      // error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Eve Horizon Dashboard
          </h1>
          <p className="text-eve-300">
            Paste your CLI token below to log in
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-eve-400 mb-2">
            Get your token by running:
          </p>
          <div className="bg-eve-950 border border-eve-700 rounded-lg p-3 font-mono text-sm text-eve-200">
            eve auth token --print
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-eve-200 mb-2"
            >
              Token
            </label>
            <textarea
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              rows={6}
              className="w-full px-4 py-3 bg-eve-900 border border-eve-700 rounded-lg text-white placeholder-eve-400 font-mono text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-eve-600 focus:border-transparent hover:border-eve-600"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-error-400 text-sm">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!token.trim() || isLoading}
          >
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}
