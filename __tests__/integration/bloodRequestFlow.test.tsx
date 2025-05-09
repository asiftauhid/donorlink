import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RequestBloodPage from '../../src/app/request_blood/page';
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

describe('Blood Request Flow Integration', () => {
  const mockPush = jest.fn();
  const mockClinic = {
    id: 'clinic1',
    name: 'Test Clinic',
    userType: 'clinic',
    email: 'clinic@test.com'
  };
  
  const mockDonor = {
    id: 'donor1',
    name: 'Test Donor',
    userType: 'donor',
    bloodType: 'B+',
    points: 100,
    email: 'donor@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Clinic Request Flow', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockClinic,
        loading: false,
      });
    });

    test('clinic can create a blood request and it appears in donor dashboard', async () => {
      // Mock successful request creation
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            request: { _id: 'request123' }
          }),
        })
      );

      // Render the request blood page
      render(<RequestBloodPage />);

      // Fill in the request form
      fireEvent.change(screen.getByLabelText(/Blood Type/i), { target: { value: 'B+' } });
      fireEvent.change(screen.getByLabelText(/Quantity \(units\)/i), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText(/Urgency Level/i), { target: { value: 'High' } });
      fireEvent.change(screen.getByLabelText(/Additional Notes/i), { target: { value: 'Emergency need' } });

      // Submit the request
      fireEvent.click(screen.getByText('Submit Request'));

      // Verify the request was created
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/clinics/requests',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              bloodType: 'B+',
              quantity: '3',
              urgency: 'High',
              notes: 'Emergency need',
              clinicId: 'clinic1',
              clinicName: 'Test Clinic',
              clinicEmail: 'clinic@test.com'
            }),
          })
        );
      });

      // Mock the donor dashboard data
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            donorData: {
              name: 'Test Donor',
              bloodType: 'B+',
              lastDonation: null,
              totalDonations: 0,
              eligibleToDonateSince: new Date().toISOString(),
              points: 100
            },
            requests: [{
              id: 'request123',
              clinic: 'Test Clinic',
              bloodType: 'B+',
              urgency: 'High',
              location: 'Test Location',
              date: new Date().toISOString(),
              distance: '5',
              notificationId: 'notif123'
            }],
            donationHistory: []
          }),
        })
      );

      // Switch to donor context
      (useAuth as jest.Mock).mockReturnValue({
        user: mockDonor,
        loading: false,
      });

      // Render the donor dashboard
      render(<DonorDashboardPage />);

      // Verify the request appears in the donor dashboard
      await waitFor(() => {
        expect(screen.getByText('Test Clinic')).toBeInTheDocument();
        expect(screen.getByText('B+')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
      });
    });

    test('donor can express interest in a blood request', async () => {
      // Mock the donor dashboard data
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            donorData: {
              name: 'Test Donor',
              bloodType: 'B+',
              lastDonation: null,
              totalDonations: 0,
              eligibleToDonateSince: new Date().toISOString(),
              points: 100
            },
            requests: [{
              id: 'request123',
              clinic: 'Test Clinic',
              bloodType: 'B+',
              urgency: 'High',
              location: 'Test Location',
              date: new Date().toISOString(),
              distance: '5',
              notificationId: 'notif123'
            }],
            donationHistory: []
          }),
        })
      );

      // Mock successful interest expression
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      // Render the donor dashboard
      render(<DonorDashboardPage />);

      // Wait for the request to appear
      await waitFor(() => {
        expect(screen.getByText('Test Clinic')).toBeInTheDocument();
      });

      // Click the Interested button
      fireEvent.click(screen.getByText('Interested'));

      // Verify the interest was expressed
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/donors/express-interest',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ notificationId: 'notif123' }),
          })
        );
      });

      // Verify the thank you message appears
      expect(screen.getByText('Thanks for your interest. We\'ll contact you shortly!!')).toBeInTheDocument();
    });

    test('handles validation errors correctly', async () => {
      // Mock auth context for clinic
      (useAuth as jest.Mock).mockReturnValue({
        user: mockClinic,
        loading: false
      });

      render(<RequestBloodPage />);

      // Fill in the form with invalid quantity
      fireEvent.change(screen.getByLabelText(/blood type/i), { target: { value: 'B+' } });
      fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '0' } });
      fireEvent.change(screen.getByLabelText(/urgency level/i), { target: { value: 'High' } });
      fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Emergency need' } });

      // Submit the form
      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/quantity must be at least 1 unit/i)).toBeInTheDocument();
      });
    });

    test('handles server errors correctly', async () => {
      // Mock auth context for clinic
      (useAuth as jest.Mock).mockReturnValue({
        user: mockClinic,
        loading: false
      });

      // Mock failed request
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error occurred' })
        })
      );

      render(<RequestBloodPage />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/blood type/i), { target: { value: 'B+' } });
      fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText(/urgency level/i), { target: { value: 'High' } });
      fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Emergency need' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    test('handles invalid response format correctly', async () => {
      // Mock auth context for clinic
      (useAuth as jest.Mock).mockReturnValue({
        user: mockClinic,
        loading: false
      });

      // Mock successful request but with invalid response format
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ request: { someOtherField: 'value' } })
        })
      );

      render(<RequestBloodPage />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/blood type/i), { target: { value: 'B+' } });
      fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText(/urgency level/i), { target: { value: 'High' } });
      fireEvent.change(screen.getByLabelText(/additional notes/i), { target: { value: 'Emergency need' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit request/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid response format from server')).toBeInTheDocument();
      });
    });

    test('redirects non-clinic users', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush
      });

      // Mock auth context for donor
      (useAuth as jest.Mock).mockReturnValue({
        user: mockDonor,
        loading: false
      });

      render(<RequestBloodPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    test('shows loading state', () => {
      // Mock auth context with loading state
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: true
      });

      render(<RequestBloodPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 