import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/lib/mongodb/models/notification.model';
import Donor from '@/lib/mongodb/models/donor.model';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('donorlink_token');
    
    if (!tokenCookie) {
      return null;
    }
    
    const token = tokenCookie.value;
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      userType: 'donor' | 'clinic';
    };
    
    return decoded;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Extract the id from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // [id] is the second last part

    // Get authenticated user
    const user = await getAuthenticatedUser(request as NextRequest);
    if (!user || user.userType !== 'clinic') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the notification and update its status
    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification status
    notification.status = 'donated';
    await notification.save();

    // Calculate the date 4 months from now for eligibility
    const now = new Date();
    const fourMonthsFromNow = new Date(now);
    fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);

    // Ensure donorId is an ObjectId
    let donorObjectId = notification.donorId;
    if (!(donorObjectId instanceof mongoose.Types.ObjectId)) {
      donorObjectId = new mongoose.Types.ObjectId(donorObjectId);
    }
    console.log('Updating donor with _id:', donorObjectId);

    // Ensure totalDonations field exists and is a number
    await Donor.updateOne(
      { _id: donorObjectId, $or: [ { totalDonations: { $exists: false } }, { totalDonations: { $type: 'null' } } ] },
      { $set: { totalDonations: 0 } }
    );

    // Update donor's information
    const updatedDonor = await Donor.findOneAndUpdate(
      { _id: donorObjectId },
      {
        $set: {
          lastDonation: now,
          eligibleToDonateSince: fourMonthsFromNow
        },
        $inc: {
          points: 100,
          totalDonations: 1
        }
      },
      { new: true }
    );

    // Fetch donor again to verify
    const verifiedDonor = await Donor.findById(donorObjectId);
    console.log('Verified donor after donation:', verifiedDonor);

    if (!updatedDonor) {
      console.error(`Donor not found for ID: ${donorObjectId}`);
      return NextResponse.json(
        { error: 'Donor not found' },
        { status: 404 }
      );
    }
    console.log('Updated donor after donation:', updatedDonor);

    return NextResponse.json({
      message: 'Successfully marked as donated!',
      donor: {
        points: updatedDonor.points,
        lastDonation: updatedDonor.lastDonation,
        eligibleToDonateSince: updatedDonor.eligibleToDonateSince,
        totalDonations: updatedDonor.totalDonations
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error marking donation:', error);
    return NextResponse.json(
      { error: 'Failed to mark donation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // Use the same logic as POST
  return POST(request);
} 