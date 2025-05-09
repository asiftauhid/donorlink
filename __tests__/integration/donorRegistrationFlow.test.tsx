import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { within } from '@testing-library/dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DonorRegistrationPage from '../../src/app/donor_registration/page';
import DonorDashboardPage from '../../src/app/dashboard/donor/page';
import '@testing-library/jest-dom';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the Auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn()
    .mockImplementationOnce((success) => success({
      coords: {
        latitude: 51.5074,
        longitude: -0.1278
      }
    }))
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('Donor Registration and Matching Flow', () => {
  const mockPush = jest.fn();
  const mockDonor = {
    id: 'donor1',
    name: 'Test Donor',
    userType: 'donor',
    bloodType: 'B+',
    email: 'donor@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Donor Registration Flow', () => {
    test('new donor can complete eligibility quiz and register', async () => {
      // Mock successful registration
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: mockDonor,
            token: 'test-token'
          }),
        })
      );

      // Render the registration page
      render(<DonorRegistrationPage />);

      // Complete the eligibility quiz
      // Age question
      const ageQuestion = screen.getByText('What is your age?').closest('div');
      if (!ageQuestion) throw new Error('Age question not found');
      fireEvent.click(within(ageQuestion).getByLabelText('17 to 65'));
      
      // Weight question
      const weightQuestion = screen.getByText('What is your weight?').closest('div');
      if (!weightQuestion) throw new Error('Weight question not found');
      fireEvent.click(within(weightQuestion).getByLabelText('50kg to 60kg'));
      
      // Last donation question
      const donationQuestion = screen.getByText('When was your last blood donation?').closest('div');
      if (!donationQuestion) throw new Error('Last donation question not found');
      fireEvent.click(within(donationQuestion).getByLabelText('Never donated before'));
      
      // Medical conditions question
      const medicalQuestion = screen.getByText('Do you have any chronic medical conditions?').closest('div');
      if (!medicalQuestion) throw new Error('Medical conditions question not found');
      fireEvent.click(within(medicalQuestion).getByLabelText('No'));
      
      // Medications question
      const medicationsQuestion = screen.getByText('Are you currently taking any medications?').closest('div');
      if (!medicationsQuestion) throw new Error('Medications question not found');
      fireEvent.click(within(medicationsQuestion).getByLabelText('No'));
      
      // Recent surgeries question
      const surgeriesQuestion = screen.getByText('Have you had any recent surgeries within the past 6 months?').closest('div');
      if (!surgeriesQuestion) throw new Error('Recent surgeries question not found');
      fireEvent.click(within(surgeriesQuestion).getByLabelText('No'));
      
      // Blood type question
      const bloodTypeQuestion = screen.getByText('What is your blood type (if known)?').closest('div');
      if (!bloodTypeQuestion) throw new Error('Blood type question not found');
      fireEvent.click(within(bloodTypeQuestion).getByLabelText('B+'));

      // Submit the quiz
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Wait for the registration form to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      });

      // Fill in the registration form
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Donor' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'donor@test.com' } });
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });
      
      // Use more specific selectors for password fields
      const passwordInput = screen.getByLabelText(/^Password$/);
      const confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Test St' } });

      // Fill in location coordinates
      fireEvent.change(screen.getByLabelText(/Latitude/i), { target: { value: '51.5074' } });
      fireEvent.change(screen.getByLabelText(/Longitude/i), { target: { value: '-0.1278' } });

      // Select blood type
      fireEvent.change(screen.getByLabelText(/Blood Type/i), { target: { value: 'B+' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      // Verify registration was successful
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/donors',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName: 'Test Donor',
              email: 'donor@test.com',
              phoneNumber: '1234567890',
              bloodType: 'B+',
              location: {
                coordinates: [-0.1278, 51.5074]
              },
              address: '123 Test St',
              password: 'password123',
              eligibilityQuiz: {
                age: '17to65',
                weight: '50to60kg',
                lastDonation: 'never',
                medicalConditions: 'no',
                medications: 'no',
                recentSurgery: 'no'
              },
              longitude: -0.1278,
              latitude: 51.5074,
              phone: '1234567890'
            }),
          })
        );
      });
    });

    test('donor can filter requests by compatibility', async () => {
      // Mock auth context with all required properties
      (useAuth as jest.Mock).mockReturnValue({
        user: mockDonor,
        loading: false,
        logout: jest.fn()
      });

      // Mock the donor dashboard data with mixed blood type requests
      const mockDashboardData = {
        donorData: {
          name: 'Test Donor',
          bloodType: 'B+',
          lastDonation: null,
          totalDonations: 0,
          eligibleToDonateSince: new Date().toISOString(),
          points: 0
        },
        requests: [
          {
            id: 'request1',
            clinic: 'Emergency Hospital',
            bloodType: 'B+',
            urgency: 'High',
            location: 'Nearby Location',
            date: new Date().toISOString(),
            distance: '2',
            notificationId: 'notif1'
          },
          {
            id: 'request2',
            clinic: 'City Clinic',
            bloodType: 'A+',
            urgency: 'Medium',
            location: 'City Center',
            date: new Date().toISOString(),
            distance: '5',
            notificationId: 'notif2'
          }
        ],
        donationHistory: []
      };

      // Mock the fetch response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData)
        })
      );

      // Render the donor dashboard
      const { rerender } = render(<DonorDashboardPage />);

      // Wait for loading state to finish and data to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading ...')).not.toBeInTheDocument();
      });

      // Wait for requests to load
      await waitFor(() => {
        expect(screen.getByText('Emergency Hospital')).toBeInTheDocument();
        expect(screen.getByText('City Clinic')).toBeInTheDocument();
      });

      // Select "Compatible with B+" filter
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'compatible' } });

      // Wait for the filter to take effect
      await waitFor(() => {
        expect(screen.getByText('Emergency Hospital')).toBeInTheDocument();
        expect(screen.queryByText('City Clinic')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
}); 