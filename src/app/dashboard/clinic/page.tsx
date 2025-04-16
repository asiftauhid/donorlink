'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClinicDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('requests');

  // Mock data for blood requests
  const requests = [
    { id: 1, bloodType: 'A+', quantity: 2, urgency: 'High', status: 'Active', date: '2025-04-15' },
    { id: 2, bloodType: 'O-', quantity: 1, urgency: 'Medium', status: 'Fulfilled', date: '2025-04-10' },
    { id: 3, bloodType: 'B+', quantity: 3, urgency: 'Low', status: 'Active', date: '2025-04-05' },
  ];

  const handleRequestBlood = () => {
    router.push('/request_blood');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Dashboard Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Clinic Dashboard</h2>
            <button
              onClick={handleRequestBlood}
              className="bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-2 px-6 rounded-full transition-colors duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Request Blood
            </button>
          </div>

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
                Blood Requests
              </button>
              <button
                onClick={() => setActiveTab('donors')}
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'donors'
                    ? 'border-b-2 border-[#e56f6f] text-[#e56f6f]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Donors
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
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="expired">Expired</option>
                    </select>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md text-sm"
                    >
                      Filter
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blood Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            #{request.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {request.bloodType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {request.quantity} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.urgency === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : request.urgency === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {request.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.status === 'Active'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {request.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <button className="text-[#e56f6f] hover:text-[#d05a5a] mr-3">
                              View
                            </button>
                            {request.status === 'Active' && (
                              <button className="text-gray-600 hover:text-gray-900">
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {requests.length === 0 && (
                  <div className="text-center py-20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No blood requests found</p>
                    <button
                      onClick={handleRequestBlood}
                      className="mt-4 bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-2 px-4 rounded-full text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Request
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'donors' && (
              <div>
                <h3 className="text-lg font-medium mb-6 text-gray-800">Available Donors</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        Donor information is only visible when they respond to your blood requests.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No donor data available yet</p>
                  <button
                    onClick={handleRequestBlood}
                    className="mt-4 bg-[#e56f6f] hover:bg-[#d05a5a] text-white py-2 px-4 rounded-full text-sm"
                  >
                    Create Blood Request
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-medium mb-6 text-gray-800">Donation History</h3>
                
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="mt-2 text-gray-500">No donation history available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Donation history will appear once donors respond to your requests
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}