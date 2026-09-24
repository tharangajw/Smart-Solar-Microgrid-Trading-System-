import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../Services/apiClient';
import { Lock, Mail, User, Phone, MapPin, Zap } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    solarCapacityKw: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = {
        ...formData,
        solarCapacityKw: formData.solarCapacityKw ? parseFloat(formData.solarCapacityKw) : undefined,
      };

      const response = await apiClient.register(userData);
      
      if (response.message) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 border border-forest/10">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Smart Solar Microgrid Logo" className="w-20 h-20 object-contain" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-forest mb-2">
          Smart Solar Microgrid
        </h1>
        <p className="text-center text-charcoal-light mb-8">
          Register as a Prosumer
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                NIC Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="901234567V"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="0771234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Solar Capacity (kW)
              </label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest/40 w-5 h-5" />
                <input
                  type="number"
                  name="solarCapacityKw"
                  value={formData.solarCapacityKw}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition"
                  placeholder="5.5"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-forest/40 w-5 h-5" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition resize-none"
                placeholder="123 Main St, Colombo"
                rows="3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest text-ivory py-3 rounded-lg font-semibold hover:bg-forest/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-charcoal-light mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-forest font-semibold hover:text-leaf transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
