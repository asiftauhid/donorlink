import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => {
  return {
    models: {
      Donor: null,
      Incentive: null,
      Donation: null,
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

describe('Incentive System', () => {
  describe('Incentive Calculation', () => {
    test('should calculate points based on donation frequency', () => {
      const calculatePoints = (donationCount: number): number => {
        if (donationCount <= 0) return 0;
        if (donationCount <= 3) return donationCount * 100;
        if (donationCount <= 6) return donationCount * 150;
        return donationCount * 200;
      };

      expect(calculatePoints(0)).toBe(0);
      expect(calculatePoints(2)).toBe(200);
      expect(calculatePoints(5)).toBe(750);
      expect(calculatePoints(8)).toBe(1600);
    });

    test('should calculate rewards based on points', () => {
      const calculateRewards = (points: number): string[] => {
        const rewards: string[] = [];
        if (points >= 1000) rewards.push('Premium Donor Badge');
        if (points >= 500) rewards.push('Free Health Checkup');
        if (points >= 200) rewards.push('Donor Certificate');
        return rewards;
      };

      expect(calculateRewards(1500)).toEqual(['Premium Donor Badge', 'Free Health Checkup', 'Donor Certificate']);
      expect(calculateRewards(600)).toEqual(['Free Health Checkup', 'Donor Certificate']);
      expect(calculateRewards(100)).toEqual([]);
    });
  });

  describe('Incentive Distribution', () => {
    test('should create incentive record after successful donation', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        _id: 'mockIncentiveId',
        donorId: 'donor123',
        points: 100,
        rewards: ['Donor Certificate'],
        createdAt: new Date()
      });

      mongoose.model = jest.fn().mockReturnValue({
        create: mockCreate
      });

      const createIncentive = async (donorId: string, points: number, rewards: string[]) => {
        const IncentiveModel = mongoose.model('Incentive');
        return await IncentiveModel.create({
          donorId,
          points,
          rewards,
          createdAt: new Date()
        });
      };

      const result = await createIncentive('donor123', 100, ['Donor Certificate']);

      expect(mockCreate).toHaveBeenCalledWith({
        donorId: 'donor123',
        points: 100,
        rewards: ['Donor Certificate'],
        createdAt: expect.any(Date)
      });
      expect(result).toHaveProperty('_id', 'mockIncentiveId');
    });

    test('should update donor points after donation', async () => {
      const mockFindOne = jest.fn().mockResolvedValue({
        _id: 'donor123',
        totalPoints: 100,
        save: jest.fn().mockResolvedValue({
          _id: 'donor123',
          totalPoints: 200
        })
      });

      mongoose.model = jest.fn().mockReturnValue({
        findOne: mockFindOne
      });

      const updateDonorPoints = async (donorId: string, pointsToAdd: number) => {
        const DonorModel = mongoose.model('Donor');
        const donor = await DonorModel.findOne({ _id: donorId });
        if (!donor) {
          throw new Error('Donor not found');
        }

        donor.totalPoints = (donor.totalPoints || 0) + pointsToAdd;
        return await donor.save();
      };

      const result = await updateDonorPoints('donor123', 100);

      expect(mockFindOne).toHaveBeenCalledWith({ _id: 'donor123' });
      expect(result.totalPoints).toBe(200);
    });

    test('should track donation history for rewards', async () => {
      const mockDonations = [
        {
          _id: 'donation1',
          donorId: 'donor123',
          date: new Date('2023-01-01'),
          bloodType: 'O+',
          points: 100
        },
        {
          _id: 'donation2',
          donorId: 'donor123',
          date: new Date('2023-04-01'),
          bloodType: 'O+',
          points: 100
        }
      ];

      const mockFind = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnThis();
      const mockExec = jest.fn().mockResolvedValue(mockDonations);

      mongoose.model = jest.fn().mockReturnValue({
        find: mockFind,
        sort: mockSort,
        exec: mockExec
      });

      const getDonationHistory = async (donorId: string) => {
        const DonationModel = mongoose.model('Donation');
        return await DonationModel.find({ donorId })
          .sort({ date: -1 })
          .exec();
      };

      const donations = await getDonationHistory('donor123');

      expect(mockFind).toHaveBeenCalledWith({ donorId: 'donor123' });
      expect(mockSort).toHaveBeenCalledWith({ date: -1 });
      expect(donations).toHaveLength(2);
      expect(donations[0]._id).toBe('donation1');
      expect(donations[1]._id).toBe('donation2');
    });

    test('should handle special rewards for rare blood types', () => {
      const calculateSpecialRewards = (bloodType: string, points: number): string[] => {
        const rewards: string[] = [];
        const rareTypes = ['AB-', 'B-', 'O-'];

        if (rareTypes.includes(bloodType) && points >= 500) {
          rewards.push('Special Recognition Badge');
          rewards.push('Priority Donor Status');
        }

        return rewards;
      };

      expect(calculateSpecialRewards('AB-', 600)).toEqual(['Special Recognition Badge', 'Priority Donor Status']);
      expect(calculateSpecialRewards('A+', 600)).toEqual([]);
      expect(calculateSpecialRewards('O-', 400)).toEqual([]);
    });
  });
}); 