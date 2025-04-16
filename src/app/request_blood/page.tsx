'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FormData = {
  bloodType: string;
  quantity: string;
  urgency: string;
  requiredBy: string;
  patientName: string;
  patientAge: string;
  notes: string;
};

export default function RequestBloodPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    bloodType: '',
    quantity: '',
    urgency: 'Medium',
    requiredBy: '',
    patientName: '',
    patientAge: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Partial<FormData & { form?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.urgency) newErrors.urgency = 'Urgency level is required';
    if (!formData.requiredBy) newErrors.requiredBy = 'Required by date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      setIsSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/clinic-dashboard');
      }, 2000);
      
    } catch (error: any) {
      setErrors({
        form: error.message || 'Failed to submit blood request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">DonorLink</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-800">Clinic A</span>
              <Link 
                href="/"
                className="text-[#e56f6f] hover:text-[#d05a5a] text-sm font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Blood request submitted!</h3>
            <p className="mt-2 text-gray-800">
              Your emergency blood request has been sent. Eligible donors in your area will be notified immediately.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DonorLink</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-800">Clinic A</span>
            <Link 
              href="/"
              className="text-[#e56f6f] hover:text-[#d05a5a] text-sm font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-grow py-10">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-800">Emergency Blood Request</h2>
                <Link
                  href="/clinic-dashboard"
                  className="text-[#e56f6f] hover:text-[#d05a5a] text-sm font-medium"
                >
                  Back to Dashboard
                </Link>
              </div>

              {errors.form && (
                <div className="mb-6 p-4 bg-red-50 rounded-md text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-800">
                      Blood Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodType && (
                      <p className="mt-1 text-sm text-red-600">{errors.bloodType}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-800">
                      Quantity (Units) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      placeholder="Enter quantity needed"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-800">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    {errors.urgency && (
                      <p className="mt-1 text-sm text-red-600">{errors.urgency}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="requiredBy" className="block text-sm font-medium text-gray-800">
                      Required By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="requiredBy"
                      id="requiredBy"
                      value={formData.requiredBy}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    />
                    {errors.requiredBy && (
                      <p className="mt-1 text-sm text-red-600">{errors.requiredBy}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-800">
                      Patient Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      id="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="patientAge" className="block text-sm font-medium text-gray-800">
                      Patient Age (Optional)
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      id="patientAge"
                      value={formData.patientAge}
                      onChange={handleChange}
                      min="0"
                      max="120"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-800">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information that might help donors understand the urgency"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#e56f6f] focus:border-[#e56f6f] text-gray-800 sm:text-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/clinic-dashboard"
                    className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e56f6f]"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e56f6f] hover:bg-[#d05a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e56f6f]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}