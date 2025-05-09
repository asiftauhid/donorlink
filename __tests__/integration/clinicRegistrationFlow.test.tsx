import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ClinicRegistrationPage from '../../src/app/clinic_registration/page';
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

describe('Clinic Registration Flow', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  test('clinic can complete registration successfully', async () => {
    // Mock successful registration
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          clinic: {
            id: 'clinic1',
            name: 'Test Clinic',
            email: 'clinic@test.com'
          }
        }),
      })
    );

    render(<ClinicRegistrationPage />);

    // Fill in the registration form
    fireEvent.change(screen.getByLabelText(/clinic name/i), { target: { value: 'Test Clinic' } });
    fireEvent.change(screen.getByLabelText(/clinic address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'clinic@test.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/license number/i), { target: { value: 'LIC123456' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Use current location button
    fireEvent.click(screen.getByText(/use current location/i));
    
    // Wait for geolocation to be set
    await waitFor(() => {
      expect(screen.getByLabelText(/latitude/i)).toHaveValue('51.5074');
      expect(screen.getByLabelText(/longitude/i)).toHaveValue('-0.1278');
    });

    // Submit the form
    fireEvent.submit(screen.getByRole('form'));

    // Verify registration was successful
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/clinics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Clinic',
            latitude: '51.5074',
            longitude: '-0.1278',
            email: 'clinic@test.com',
            phone: '1234567890',
            licenseNumber: 'LIC123456',
            password: 'password123',
            address: '123 Test St',
          }),
        })
      );
    });

    // Check for success message and redirect
    await waitFor(() => {
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
      expect(screen.getByText(/Congratulations! Test Clinic is successfully registered/)).toBeInTheDocument();
    });

    // Wait for the redirect timeout
    await new Promise(resolve => setTimeout(resolve, 2100)); // Wait slightly longer than the 2000ms timeout

    // Verify redirect to login
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  test('handles validation errors correctly', async () => {
    render(<ClinicRegistrationPage />);

    // Submit empty form
    fireEvent.submit(screen.getByRole('form'));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getAllByText('All fields must be filled to complete registration.')).toHaveLength(9);
    });

    // Test invalid email format
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });

    // Test invalid phone format
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '123' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number.')).toBeInTheDocument();
    });

    // Test password mismatch
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  test('handles server errors correctly', async () => {
    // Mock failed registration
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      })
    );

    render(<ClinicRegistrationPage />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/clinic name/i), { target: { value: 'Test Clinic' } });
    fireEvent.change(screen.getByLabelText(/clinic address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'clinic@test.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/license number/i), { target: { value: 'LIC123456' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: '51.5074' } });
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: '-0.1278' } });

    // Submit the form
    fireEvent.submit(screen.getByRole('form'));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('handles geolocation errors correctly', async () => {
    // Mock geolocation error
    const mockGeolocationError = {
      getCurrentPosition: jest.fn()
        .mockImplementationOnce((success, error) => error({
          code: 1,
          message: 'User denied geolocation'
        }))
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocationError,
      writable: true
    });

    render(<ClinicRegistrationPage />);

    // Click use current location
    fireEvent.click(screen.getByText(/use current location/i));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Unable to get your current location. Please enter coordinates manually.')).toBeInTheDocument();
    });
  });

  test('validates coordinate inputs correctly', async () => {
    render(<ClinicRegistrationPage />);

    // Test invalid latitude
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: '91' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText('Latitude must be a number between -90 and 90.')).toBeInTheDocument();
    });

    // Test invalid longitude
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: '181' } });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText('Longitude must be a number between -180 and 180.')).toBeInTheDocument();
    });
  });
}); 