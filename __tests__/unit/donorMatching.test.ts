import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => {
  return {
    models: {
      Donor: null,
      BloodRequest: null,
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

describe('Donor Matching System', () => {
  describe('Blood Type Compatibility', () => {
    test('should match compatible blood types', () => {
      const isCompatible = (donorType: string, recipientType: string): boolean => {
        const compatibilityMap: { [key: string]: string[] } = {
          'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
          'O+': ['O+', 'A+', 'B+', 'AB+'],
          'A-': ['A-', 'A+', 'AB-', 'AB+'],
          'A+': ['A+', 'AB+'],
          'B-': ['B-', 'B+', 'AB-', 'AB+'],
          'B+': ['B+', 'AB+'],
          'AB-': ['AB-', 'AB+'],
          'AB+': ['AB+']
        };

        return compatibilityMap[donorType]?.includes(recipientType) || false;
      };

      expect(isCompatible('O-', 'A+')).toBe(true);
      expect(isCompatible('A+', 'O+')).toBe(false);
      expect(isCompatible('AB+', 'O-')).toBe(false);
      expect(isCompatible('B-', 'AB+')).toBe(true);
    });
  });

  describe('Donor Matching Algorithm', () => {
    test('should find eligible donors for a blood request', async () => {
      const mockDonors = [
        {
          _id: 'donor1',
          bloodType: 'O+',
          location: {
            type: 'Point',
            coordinates: [-73.935242, 40.730610]
          },
          lastDonationDate: new Date('2023-01-01'),
          healthStatus: 'Eligible'
        },
        {
          _id: 'donor2',
          bloodType: 'A+',
          location: {
            type: 'Point',
            coordinates: [-73.935242, 40.730610]
          },
          lastDonationDate: new Date('2023-01-01'),
          healthStatus: 'Eligible'
        }
      ];

      const mockFind = jest.fn().mockReturnThis();
      const mockNear = jest.fn().mockReturnThis();
      const mockMaxDistance = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue(mockDonors);

      mongoose.model = jest.fn().mockReturnValue({
        find: mockFind,
        near: mockNear,
        maxDistance: mockMaxDistance,
        exec: mockExec
      });

      const findEligibleDonors = async (request: any) => {
        const DonorModel = mongoose.model('Donor');
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        return await DonorModel.find()
          .near('location', {
            type: 'Point',
            coordinates: request.location.coordinates
          })
          .maxDistance('location', 50000) // 50km radius
          .exec();
      };

      const bloodRequest = {
        bloodType: 'A+',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610]
        },
        urgency: 'High'
      };

      const eligibleDonors = await findEligibleDonors(bloodRequest);

      expect(mockFind).toHaveBeenCalled();
      expect(mockNear).toHaveBeenCalled();
      expect(mockMaxDistance).toHaveBeenCalledWith('location', 50000);
      expect(eligibleDonors).toHaveLength(2);
    });

    test('should prioritize donors based on urgency and distance', async () => {
      const mockDonors = [
        {
          _id: 'donor1',
          bloodType: 'O+',
          location: {
            type: 'Point',
            coordinates: [-73.935242, 40.730610]
          },
          lastDonationDate: new Date('2023-01-01'),
          healthStatus: 'Eligible',
          distance: 5 // 5km
        },
        {
          _id: 'donor2',
          bloodType: 'O+',
          location: {
            type: 'Point',
            coordinates: [-73.935242, 40.730610]
          },
          lastDonationDate: new Date('2023-01-01'),
          healthStatus: 'Eligible',
          distance: 20 // 20km
        }
      ];

      const prioritizeDonors = (donors: any[], urgency: string) => {
        return donors.sort((a, b) => {
          // For high urgency, prioritize by distance only
          if (urgency === 'High') {
            return a.distance - b.distance;
          }
          // For medium urgency, consider both distance and last donation date
          return (a.distance * 0.7 + new Date(a.lastDonationDate).getTime() * 0.3) -
                 (b.distance * 0.7 + new Date(b.lastDonationDate).getTime() * 0.3);
        });
      };

      const prioritizedDonors = prioritizeDonors(mockDonors, 'High');
      expect(prioritizedDonors[0]._id).toBe('donor1');
      expect(prioritizedDonors[1]._id).toBe('donor2');
    });

    test('should handle no eligible donors found', async () => {
      const mockFind = jest.fn().mockReturnThis();
      const mockNear = jest.fn().mockReturnThis();
      const mockMaxDistance = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue([]);

      mongoose.model = jest.fn().mockReturnValue({
        find: mockFind,
        near: mockNear,
        maxDistance: mockMaxDistance,
        exec: mockExec
      });

      const findEligibleDonors = async (request: any) => {
        const DonorModel = mongoose.model('Donor');
        return await DonorModel.find()
          .near('location', {
            type: 'Point',
            coordinates: request.location.coordinates
          })
          .maxDistance('location', 50000)
          .exec();
      };

      const bloodRequest = {
        bloodType: 'AB-',
        location: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610]
        },
        urgency: 'High'
      };

      const eligibleDonors = await findEligibleDonors(bloodRequest);
      expect(eligibleDonors).toHaveLength(0);
    });
  });
}); 