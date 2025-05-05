import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BloodRequest from '@/lib/mongodb/models/bloodRequest.model';
import Notification from '@/lib/mongodb/models/notification.model';
import { transporter } from '@/lib/utils/mailer';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

interface PopulatedDonor {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
}

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('donorlink_token');
    
    if (!tokenCookie) {
      return null;
    }
    
    const token = tokenCookie.value;
    
    // Verify token
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

export async function PATCH(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request);
    
    // Check if the user is authenticated and is a clinic
    if (!user || user.userType !== 'clinic') {
      return NextResponse.json(
        { message: 'Not authenticated or not a clinic' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Get the request ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const requestId = pathParts[pathParts.length - 1];

    // Parse the request body
    const body = await request.json();
    const { status } = body;

    // Validate the status
    if (status !== 'Cancelled') {
      return NextResponse.json(
        { message: 'Invalid status update' },
        { status: 400 }
      );
    }

    // Find and update the blood request
    const bloodRequest = await BloodRequest.findOneAndUpdate(
      {
        _id: requestId,
        clinicEmail: user.email // Ensure the clinic owns this request
      },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!bloodRequest) {
      return NextResponse.json(
        { message: 'Blood request not found or access denied' },
        { status: 404 }
      );
    }

    // Find all notifications for this blood request
    const notifications = await Notification.find({
      bloodRequestId: requestId,
      status: { $in: ['sent', 'interested'] } // Only notify donors who were sent a request or expressed interest
    }).populate('donorId', 'email fullName');

    // Send cancellation emails to all notified donors
    for (const notification of notifications) {
      const donor = notification.donorId as unknown as PopulatedDonor;
      if (donor && donor.email) {
        const subject = `Blood Request Cancelled - ${bloodRequest.bloodType}`;
        const message = `
Dear ${donor.fullName},

The blood request for ${bloodRequest.bloodType} blood that you were notified about has been cancelled.

We will notify you if there's a new request for you.

Best regards,
DonorLink Team
        `;

        try {
          await transporter.sendMail({
            from: `"DonorLink UAE" <${process.env.GMAIL_USER}>`,
            to: donor.email,
            subject,
            text: message,
          });

          // Update notification status to reflect cancellation
          notification.status = 'failed';
          await notification.save();
        } catch (error) {
          console.error('Failed to send cancellation email to', donor.email, error);
        }
      }
    }

    return NextResponse.json({
      message: 'Blood request cancelled successfully',
      request: bloodRequest
    });
  } catch (error) {
    console.error('Error cancelling blood request:', error);
    return NextResponse.json(
      { message: 'Failed to cancel blood request' },
      { status: 500 }
    );
  }
} 