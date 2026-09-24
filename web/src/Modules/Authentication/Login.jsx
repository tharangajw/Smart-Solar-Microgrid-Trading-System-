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
          <div className="mb-4">
            <img src="/logo.png" alt="Smart Solar Microgrid Logo" className="w-24 h-24 object-contain" />
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
      </div>
    </div>
  );
}
