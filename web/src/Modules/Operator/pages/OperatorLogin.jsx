/**
 * OperatorLogin.jsx
 * Login page for Grid Operators accessing the web dashboard.
 * Calls POST /api/auth/login, validates the role is GridOperator,
 * stores the JWT token and user info in localStorage, then redirects
 * to the operator dashboard.
 * Author: Member 4 – Operator Product
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOperator } from '../../../Services/operatorApi';
import { Zap, Mail, Lock, AlertCircle, Loader } from 'lucide-react';

const OperatorLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes and clear any previous errors
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Submit login form and authenticate with the Web API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginOperator(form.email, form.password);
      const { token, userId, email, role, fullName } = res.data;
      const user = { userId, email, role, fullName };

      // Validate that the logged-in user has the GridOperator role
      if (user.role !== 'GridOperator') {
        setError('Access denied. This portal is for Grid Operators only.');
        setLoading(false);
        return;
      }

      // Persist token and user details for the session
      localStorage.setItem('operator_token', token);
      localStorage.setItem('operator_user', JSON.stringify(user));

      // Redirect to the operator dashboard
      navigate('/operator/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-leaf/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-solar-soft/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-forest rounded-2xl shadow-lg mb-4">
            <Zap size={32} className="text-ivory" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-forest tracking-tight">
            SmartSolar Grid
          </h1>
          <p className="text-sage font-medium mt-2">Grid Operator Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-forest/10 rounded-3xl shadow-xl p-8">
          <h2 className="font-display text-xl font-semibold text-forest mb-6">Sign In to Dashboard</h2>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-sage" />
                </div>
                <input
                  id="operator-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="operator@smartsolar.com"
                  className="w-full pl-12 pr-4 py-3 bg-ivory border border-forest/10 rounded-xl text-charcoal placeholder-charcoal-light font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-sage" />
                </div>
                <input
                  id="operator-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-ivory border border-forest/10 rounded-xl text-charcoal placeholder-charcoal-light font-medium focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="operator-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-forest hover:bg-forest-light text-ivory font-semibold rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-charcoal-light mt-6">
            Grid Operator accounts are created by Backoffice staff only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorLogin;
