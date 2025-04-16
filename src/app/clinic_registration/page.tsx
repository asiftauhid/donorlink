'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  name: string;
  location: string;
  email: string;
  phone: string;
  licenseNumber: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  [key in keyof FormData]?: string;
} & {
  form?: string;
};

export default function ClinicRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    email: '',
    phone: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Check for empty fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof FormData] = 'All fields must be filled to complete registration.';
      }
    });
    
    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    // Phone validation - simple pattern for illustration
    if (formData.phone && !/^\+?[0-9\s]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
    }
    
    // Password matching
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    
    // Password strength
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be replaced with your actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success case
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/clinic-dashboard');
      }, 2000);
      
    } catch (error: any) {
      setErrors({
        form: error.message || 'An error occurred during registration. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf4f2]">
        <div className="bg-white rounded-3xl shadow-md p-8 max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h2>
          <p className="mb-6 text-gray-800">
            Congratulations! {formData.name} is successfully registered to DonorLink.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fdf4f2] py-8">
      <div className="bg-white rounded-3xl shadow-md p-8 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Clinic Registration</h1>
        
        {errors.form && (
          <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-800">
              Clinic Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-800">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              placeholder="e.g., Zone 5"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-800">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-800">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
              placeholder="+9715********"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          
          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1 text-gray-800">
              License Number
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-800">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-3 px-6 rounded-full transition-colors duration-300 font-medium"
            >
              {isSubmitting ? 'Registering...' : 'Register Clinic'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-[#e56f6f] hover:text-[#d05a5a] text-sm underline">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}