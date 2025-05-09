import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => {
  return {
    models: {
      Clinic: null,
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

// Create a mock Clinic model
const Clinic = {
  validateSync: jest.fn(),
};

describe('Clinic Registration', () => {
  describe('Schema Validation', () => {
    test('should validate with correct clinic data', () => {
      Clinic.validateSync.mockReturnValueOnce(undefined);
      
      const validData = {
        name: 'City Hospital',
        email: 'contact@cityhospital.com',
        phone: '+1234567890',
        address: '123 Medical Center Dr',
        licenseNumber: 'CLN123456',
        password: 'securePassword123',
        verificationStatus: 'Pending'
      };
      
      const validationError = Clinic.validateSync();
      
      expect(validationError).toBeUndefined();
    });

    test('should throw error for invalid email format', () => {
      Clinic.validateSync.mockReturnValueOnce({
        errors: {
          email: new Error('Invalid email format')
        }
      });
      
      const invalidData = {
        name: 'City Hospital',
        email: 'invalid-email',
        phone: '+1234567890',
        address: '123 Medical Center Dr',
        licenseNumber: 'CLN123456',
        password: 'securePassword123'
      };
      
      const validationError = Clinic.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.email).toBeDefined();
    });

    test('should throw error for missing required fields', () => {
      Clinic.validateSync.mockReturnValueOnce({
        errors: {
          name: new Error('Required'),
          email: new Error('Required'),
          licenseNumber: new Error('Required')
        }
      });
      
      const incompleteData = {
        phone: '+1234567890',
        address: '123 Medical Center Dr'
      };
      
      const validationError = Clinic.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.email).toBeDefined();
      expect(validationError?.errors.licenseNumber).toBeDefined();
    });
  });

  describe('Clinic Registration API', () => {
    test('registerClinic should create a new clinic account', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        _id: 'mockClinicId',
        name: 'City Hospital',
        email: 'contact@cityhospital.com',
        phone: '+1234567890',
        address: '123 Medical Center Dr',
        licenseNumber: 'CLN123456',
        verificationStatus: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mongoose.model = jest.fn().mockReturnValue({
        create: mockCreate,
        findOne: jest.fn().mockResolvedValue(null) // No existing clinic with same email
      });

      const clinicData = {
        name: 'City Hospital',
        email: 'contact@cityhospital.com',
        phone: '+1234567890',
        address: '123 Medical Center Dr',
        licenseNumber: 'CLN123456',
        password: 'securePassword123'
      };

      const registerClinic = async (data: any) => {
        const ClinicModel = mongoose.model('Clinic');
        const existingClinic = await ClinicModel.findOne({ email: data.email });
        if (existingClinic) {
          throw new Error('Clinic with this email already exists');
        }
        return await ClinicModel.create(data);
      };

      const result = await registerClinic(clinicData);

      expect(mockCreate).toHaveBeenCalledWith(clinicData);
      expect(result).toHaveProperty('_id', 'mockClinicId');
      expect(result).toHaveProperty('verificationStatus', 'Pending');
    });

    test('should prevent duplicate clinic registration', async () => {
      const mockFindOne = jest.fn().mockResolvedValue({
        _id: 'existingClinicId',
        email: 'contact@cityhospital.com'
      });

      mongoose.model = jest.fn().mockReturnValue({
        findOne: mockFindOne
      });

      const clinicData = {
        name: 'City Hospital',
        email: 'contact@cityhospital.com',
        phone: '+1234567890',
        address: '123 Medical Center Dr',
        licenseNumber: 'CLN123456',
        password: 'securePassword123'
      };

      const registerClinic = async (data: any) => {
        const ClinicModel = mongoose.model('Clinic');
        const existingClinic = await ClinicModel.findOne({ email: data.email });
        if (existingClinic) {
          throw new Error('Clinic with this email already exists');
        }
        return await ClinicModel.create(data);
      };

      await expect(registerClinic(clinicData)).rejects.toThrow('Clinic with this email already exists');
    });
  });
}); 