import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../Services/apiClient';
import { Lock, Mail, Sun, Zap } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();
  const [searchParams]          = useSearchParams();

  useEffect(() => {
    const token     = searchParams.get('token');
    const userId    = searchParams.get('userId');
    const userRole  = searchParams.get('role');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(oauthError.replace(/_/g, ' '));
      window.history.replaceState({}, document.title, '/login');
      return;
    }

    if (token && userId) {
      let navigatePath;
      if (userRole === 'Backoffice') {
        localStorage.setItem('backoffice_token', token);
        localStorage.setItem('backoffice_user', JSON.stringify({ id: userId, role: userRole }));
        navigatePath = '/backoffice/dashboard';
      } else if (userRole === 'GridOperator') {
        localStorage.setItem('operator_token', token);
        localStorage.setItem('operator_user', JSON.stringify({ id: userId, role: userRole }));
        navigatePath = '/operator/dashboard';
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ id: userId, role: userRole }));
        navigatePath = '/dashboard';
      }
      window.history.replaceState({}, document.title, navigatePath);
      navigate(navigatePath);
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.login(formData.email, formData.password);
      if (response.token) {
        const userRole = response.role || response.Role;
        if (userRole === 'Backoffice') {
          localStorage.setItem('backoffice_token', response.token);
          localStorage.setItem('backoffice_user', JSON.stringify(response));
          navigate('/backoffice/dashboard');
        } else if (userRole === 'GridOperator') {
          localStorage.setItem('operator_token', response.token);
          localStorage.setItem('operator_user', JSON.stringify(response));
          navigate('/operator/dashboard');
        } else {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          navigate('/dashboard');
        }
      } else {
        setError('Invalid credentials or account inactive.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-solar/20 blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-forest p-4 rounded-2xl shadow-lg mb-4">
            <div className="flex items-center gap-1">
              <Sun className="w-7 h-7 text-solar" />
              <Zap className="w-5 h-5 text-ivory" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-forest text-center">Smart Solar Microgrid</h1>
          <p className="text-charcoal-light text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/40 w-5 h-5" />
              <input
                type="email" name="email"
                value={formData.email} onChange={handleChange} required
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/40 w-5 h-5" />
              <input
                type="password" name="password"
                value={formData.password} onChange={handleChange} required
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-xl focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-forest text-ivory py-3 rounded-xl font-semibold hover:bg-forest/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-forest/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-ivory/50 border-t-ivory rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-forest/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-charcoal-light">Or continue with</span>
          </div>
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button type="button" onClick={() => apiClient.googleLogin()}
            className="flex items-center justify-center gap-2 border border-forest/15 py-2.5 rounded-xl hover:bg-forest/5 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-charcoal font-medium text-xs">Google</span>
          </button>

          <button type="button" onClick={() => apiClient.facebookLogin()}
            className="flex items-center justify-center gap-2 border border-forest/15 py-2.5 rounded-xl hover:bg-forest/5 transition-colors">
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-charcoal font-medium text-xs">Facebook</span>
          </button>

          <button type="button" onClick={() => apiClient.appleLogin()}
            className="flex items-center justify-center gap-2 border border-forest/15 py-2.5 rounded-xl hover:bg-forest/5 transition-colors">
            <svg className="w-5 h-5" fill="#000" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-charcoal font-medium text-xs">Apple</span>
          </button>
        </div>

        <p className="text-center text-charcoal-light text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')}
            className="text-forest font-semibold hover:text-leaf transition-colors">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
