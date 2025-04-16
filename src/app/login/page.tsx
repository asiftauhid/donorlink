'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'donor', // Default to donor
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect based on user type
      if (formData.userType === 'clinic') {
        router.push('/dashboard/clinic');
      } else {
        router.push('/dashboard/donor');
      }
      
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf4f2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-md p-8 max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-800">Log in to DonorLink</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your account
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-800">
                I am a
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800"
              >
                <option value="donor">Donor</option>
                <option value="clinic">Clinic</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#e56f6f] focus:ring-[#e56f6f] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#e56f6f] hover:text-[#d05a5a]">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-[#e56f6f] hover:bg-[#d05a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e56f6f]"
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/" className="font-medium text-[#e56f6f] hover:text-[#d05a5a]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}