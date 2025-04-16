'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const handleClinicClick = () => {
    router.push('/clinic_registration');
  };

  const handleDonorClick = () => {
    router.push('/donor_registration');
  };

  return (
    <div className="min-h-screen bg-[#fdf4f2] flex flex-col">
      {/* Navigation Bar */}
      <nav className="p-4 flex justify-end">
        <Link 
          href="/login" 
          className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-6 rounded-full border border-[#e56f6f] transition-colors duration-300"
        >
          Log In
        </Link>
      </nav>
      
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-md p-12 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-medium text-gray-800 mb-12">
            Welcome To <span className="font-bold text-[#e56f6f]">DonorLink</span>
          </h1>
          <div className="flex flex-col md:flex-row justify-center md:space-x-24 gap-6">
            <button
              onClick={handleClinicClick}
              className="bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-4 px-8 rounded-full text-xl transition-colors duration-300"
            >
              I&apos;m a Clinic
            </button>
            
            <button
              onClick={handleDonorClick}
              className="bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-4 px-8 rounded-full text-xl transition-colors duration-300"
            >
              I&apos;m a Donor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}