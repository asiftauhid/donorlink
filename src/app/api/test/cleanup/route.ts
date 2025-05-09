import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Clinic from '@/lib/mongodb/models/clinic.model';
import Donor from '@/lib/mongodb/models/donor.model';
import BloodRequest from '@/lib/mongodb/models/bloodRequest.model';
import Notification from '@/lib/mongodb/models/notification.model';

const allowCleanup = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export async function POST(req: NextRequest) {
  if (!allowCleanup) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();
    const { email, userType, cleanupRequests = false } = await req.json();

    if (!email || !userType) {
      return NextResponse.json({ error: 'Missing email or userType' }, { status: 400 });
    }

    let entityId = null;

    if (userType === 'clinic') {
      const clinic = await Clinic.findOne({ email });
      if (clinic) {
        entityId = clinic._id;

        if (cleanupRequests) {
          await BloodRequest.deleteMany({ clinicId: entityId });
          await Notification.deleteMany({ clinicId: entityId });
        }

        await Clinic.deleteOne({ email });
      }
    } else if (userType === 'donor') {
      const donor = await Donor.findOne({ email });
      if (donor) {
        entityId = donor._id;

        // This clears all notifications involving this donor
        await Notification.deleteMany({ donorId: entityId });
        await Donor.deleteOne({ email });
      }
      // ✅ ADD THIS LINE
    await Notification.deleteMany({ email });
    } else {
      return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });
    }

    return NextResponse.json({
      deleted: 1,
      relatedDataCleaned: !!entityId,
    }, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
