'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DonorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('requests');

  // Mock data for active blood requests
  const requests = [
    { 
      id: 1, 
      clinic: 'Clinic A', 
      bloodType: 'A+', 
      urgency: 'High', 
      location: 'Zone 5', 
      date: '2025-04-15',
      distance: '1.2 km'
    },
    { 
      id: 2, 
      clinic: 'Medical Center B', 
      bloodType: 'O-', 
      urgency: 'Medium', 
      location: 'Zone 3', 
      date: '2025-04-17',
      distance: '3.5 km'
    },
    { 
      id: 3, 
      clinic: 'Hospital C', 
      bloodType: 'B+', 
      urgency: 'Low', 
      location: 'Zone 8', 
      date: '2025-04-20',
      distance: '5.8 km'
    },
  ];

  // Mock data for donation history
  const donationHistory = [
    { id: 1, date: '2024-12-10', clinic: 'Clinic A', bloodType: 'A+', status: 'Completed' },
    { id: 2, date: '2024-08-05', clinic: 'Hospital C', bloodType: 'A+', status: 'Completed' },
  ];

  // Mock donor data
  const donorData = {
    name: 'John Doe',
    bloodType: 'A+',
    lastDonation: '2024-12-10',
    totalDonations: 2,
    eligibleToDonateSince: '2025-03-10',
    points: 250,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DonorLink</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-[#e56f6f]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{donorData.points} points</span>
            </div>
            <span className="text-gray-800">{donorData.name}</span>
            <Link 
              href="/"
              className="text-[#e56f6f] hover:text-[#d05a5a] text-sm font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-[#e56f6f] flex items-center justify-center text-white font-bold text-xl">
                    {donorData.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">{donorData.name}</h2>
                    <p className="text-[#e56f6f] font-medium">
                      Blood Type: {donorData.bloodType}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm uppercase font-medium text-gray-500 mb-2">Your Profile</h3>
                  <div className="space-y-3 text-gray-800">
                    <div className="flex justify-between">
                      <span>Last Donation</span>
                      <span>{donorData.lastDonation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Donations</span>
                      <span>{donorData.totalDonations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eligible Since</span>
                      <span>{donorData.eligibleToDonateSince}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm uppercase font-medium text-gray-500 mb-2">Donation Status</h3>
                  <div className="bg-green-100 text-green-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>You are eligible to donate</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button 
                    className="w-full bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-2 px-4 rounded-md shadow-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="col-span-1 md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`py-4 px-6 font-medium text-sm ${
                      activeTab === 'requests'
                        ? 'border-b-2 border-[#e56f6f] text-[#e56f6f]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Available Requests
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-6 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-b-2 border-[#e56f6f] text-[#e56f6f]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Donation History
                  </button>
                  <button
                    onClick={() => setActiveTab('rewards')}
                    className={`py-4 px-6 font-medium text-sm ${
                      activeTab === 'rewards'
                        ? 'border-b-2 border-[#e56f6f] text-[#e56f6f]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Rewards
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'requests' && (
                  <div>
                    <div className="flex justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-800">Active Blood Requests</h3>
                      <div className="flex space-x-3">
                        <select 
                          className="border border-gray-300 rounded-md text-sm text-gray-700 px-3 py-1.5"
                        >
                          <option value="all">All Blood Types</option>
                          <option value="compatible">Compatible with A+</option>
                        </select>
                        <button 
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md text-sm"
                        >
                          Filter
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-bold">
                                {request.bloodType}
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-gray-800">{request.clinic}</h4>
                                <p className="text-sm text-gray-500">
                                  {request.location} • {request.distance} • Required by: {request.date}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 flex items-center">
                              <span
                                className={`inline-flex items-center mr-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  request.urgency === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : request.urgency === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {request.urgency}
                              </span>
                              <button className="bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-1.5 px-4 rounded-md text-sm">
                                Respond
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {requests.length === 0 && (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="mt-2 text-gray-500">No blood requests matching your type at this time</p>
                        <p className="text-sm text-gray-400 mt-1">We'll notify you when new requests are available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-medium mb-6 text-gray-800">Your Donation History</h3>
                    
                    {donationHistory.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Clinic
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Blood Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Certificate
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {donationHistory.map((donation) => (
                              <tr key={donation.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                  {donation.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                  {donation.clinic}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                  {donation.bloodType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {donation.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#e56f6f]">
                                  <button className="hover:text-[#d05a5a]">
                                    Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="mt-2 text-gray-500">No donation history yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Your donations will be recorded here once completed
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800">Your Rewards</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Earn points with each successful donation and redeem for rewards
                      </p>
                    </div>
                    
                    <div className="bg-[#fdf4f2] rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-[#e56f6f] text-white flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">You have <span className="text-[#e56f6f] font-bold">{donorData.points} points</span></p>
                          <p className="text-sm text-gray-600">Next donation: +100 points</p>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-4">Available Rewards</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-800">$10 Gift Card</h5>
                            <p className="text-sm text-gray-500 mt-1">Redeem for a $10 gift card at participating stores</p>
                          </div>
                          <div className="bg-[#e56f6f] text-white px-3 py-1 rounded-full text-sm">
                            200 points
                          </div>
                        </div>
                        <button 
                          className={`mt-4 w-full py-2 rounded-md text-sm ${
                            donorData.points >= 200
                              ? 'bg-[#e56f6f] hover:bg-[#d05a5a] text-white'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={donorData.points < 200}
                        >
                          {donorData.points >= 200 ? 'Redeem' : 'Not enough points'}
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-800">Movie Ticket</h5>
                            <p className="text-sm text-gray-500 mt-1">Free movie ticket at partnered cinemas</p>
                          </div>
                          <div className="bg-[#e56f6f] text-white px-3 py-1 rounded-full text-sm">
                            300 points
                          </div>
                        </div>
                        <button 
                          className="mt-4 w-full py-2 rounded-md text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          Not enough points
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}