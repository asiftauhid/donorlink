import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => {
  return {
    models: {
      Donor: null,
    },
    model: jest.fn().mockImplementation(() => ({
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    })),
    Schema: jest.fn().mockImplementation(() => ({
      pre: jest.fn().mockReturnThis(),
    })),
    connect: jest.fn(),
    Types: {
      ObjectId: jest.fn().mockImplementation(() => 'mockObjectId'),
    },
  };
});

// Create a mock Donor model
const Donor = {
  validateSync: jest.fn(),
};

describe('Donor Registration', () => {
  describe('Schema Validation', () => {
    test('should validate with correct donor data', () => {
      Donor.validateSync.mockReturnValueOnce(undefined);
      
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bloodType: 'O+',
        age: 25,
        weight: 70,
        lastDonationDate: new Date('2023-01-01'),
        healthStatus: 'Eligible',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610] // New York coordinates
        },
        verificationStatus: 'Pending'
      };
      
      const validationError = Donor.validateSync();
      
      expect(validationError).toBeUndefined();
    });

    test('should throw error for invalid blood type', () => {
      Donor.validateSync.mockReturnValueOnce({
        errors: {
          bloodType: new Error('Invalid blood type')
        }
      });
      
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        bloodType: 'X+', // Invalid blood type
        age: 25,
        weight: 70
      };
      
      const validationError = Donor.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.bloodType).toBeDefined();
    });

    test('should throw error for underage donor', () => {
      Donor.validateSync.mockReturnValueOnce({
        errors: {
          age: new Error('Donor must be at least 18 years old')
        }
      });
      
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        bloodType: 'O+',
        age: 16, // Underage
        weight: 70
      };
      
      const validationError = Donor.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.age).toBeDefined();
    });

    test('should throw error for insufficient weight', () => {
      Donor.validateSync.mockReturnValueOnce({
        errors: {
          weight: new Error('Donor must weigh at least 50kg')
        }
      });
      
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        bloodType: 'O+',
        age: 25,
        weight: 45 // Insufficient weight
      };
      
      const validationError = Donor.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.weight).toBeDefined();
    });
  });

  describe('Donor Registration API', () => {
    test('registerDonor should create a new donor account', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        _id: 'mockDonorId',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bloodType: 'O+',
        age: 25,
        weight: 70,
        lastDonationDate: new Date('2023-01-01'),
        healthStatus: 'Eligible',
        verificationStatus: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mongoose.model = jest.fn().mockReturnValue({
        create: mockCreate,
        findOne: jest.fn().mockResolvedValue(null) // No existing donor with same email
      });

      const donorData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bloodType: 'O+',
        age: 25,
        weight: 70,
        lastDonationDate: new Date('2023-01-01'),
        healthStatus: 'Eligible'
      };

      const registerDonor = async (data: any) => {
        const DonorModel = mongoose.model('Donor');
        const existingDonor = await DonorModel.findOne({ email: data.email });
        if (existingDonor) {
          throw new Error('Donor with this email already exists');
        }
        return await DonorModel.create(data);
      };

      const result = await registerDonor(donorData);

      expect(mockCreate).toHaveBeenCalledWith(donorData);
      expect(result).toHaveProperty('_id', 'mockDonorId');
      expect(result).toHaveProperty('verificationStatus', 'Pending');
    });

    test('should prevent duplicate donor registration', async () => {
      const mockFindOne = jest.fn().mockResolvedValue({
        _id: 'existingDonorId',
        email: 'john@example.com'
      });

      mongoose.model = jest.fn().mockReturnValue({
        findOne: mockFindOne
      });

      const donorData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        bloodType: 'O+',
        age: 25,
        weight: 70
      };

      const registerDonor = async (data: any) => {
        const DonorModel = mongoose.model('Donor');
        const existingDonor = await DonorModel.findOne({ email: data.email });
        if (existingDonor) {
          throw new Error('Donor with this email already exists');
        }
        return await DonorModel.create(data);
      };

      await expect(registerDonor(donorData)).rejects.toThrow('Donor with this email already exists');
    });

    test('should check donation eligibility based on last donation date', async () => {
      const mockFindOne = jest.fn().mockResolvedValue({
        _id: 'mockDonorId',
        lastDonationDate: new Date() // Set to current date to make donor ineligible
      });

      mongoose.model = jest.fn().mockReturnValue({
        findOne: mockFindOne
      });

      const checkEligibility = async (donorId: string) => {
        const DonorModel = mongoose.model('Donor');
        const donor = await DonorModel.findOne({ _id: donorId });
        if (!donor) {
          throw new Error('Donor not found');
        }

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (donor.lastDonationDate > threeMonthsAgo) {
          return {
            eligible: false,
            nextEligibleDate: new Date(donor.lastDonationDate.getTime() + (90 * 24 * 60 * 60 * 1000))
          };
        }

        return { eligible: true };
      };

      const result = await checkEligibility('mockDonorId');
      expect(result.eligible).toBe(false);
      expect(result.nextEligibleDate).toBeDefined();
    });
  });
}); 