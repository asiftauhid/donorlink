// app/api/sendNotification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Notification from '@/lib/mongodb/models/notification.model';
import Donor from '@/lib/mongodb/models/donor.model';
import dbConnect from '@/lib/mongodb';
import { transporter } from '@/lib/utils/mailer';
import Clinic from '@/lib/mongodb/models/clinic.model';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { donorIds, subject, message, clinicId, bloodRequestId } = body;

    await dbConnect();

    // Fetch clinic name
    let clinicName = '';
    if (clinicId) {
      const clinic = await Clinic.findById(clinicId);
      if (clinic) clinicName = clinic.name;
    }

    const donors = await Donor.find({ _id: { $in: donorIds } });

    for (const donor of donors) {
      // Inject clinic name into the message
      let personalizedMessage = message.replace('Dear donor,', `Dear ${donor.fullName},`);
      if (clinicName) {
        personalizedMessage = personalizedMessage.replace('[[CLINIC_NAME]]', clinicName);
      }
      const notificationData = {
        donorId: donor._id,
        clinicId,
        bloodRequestId,
        email: donor.email,
        subject,
        message: personalizedMessage,
        sentAt: new Date(),
      };

      try {
        await transporter.sendMail({
          from: `"DonorLink UAE" <${process.env.GMAIL_USER}>`,
          to: donor.email,
          subject,
          text: notificationData.message,
        });

        await Notification.create({ ...notificationData, status: 'sent'});

      } catch (error) {
        console.error('Failed to send to', donor.email, error);
        await Notification.create({ ...notificationData, status: 'failed'});
      }
    }

    return NextResponse.json({ message: 'Emails sent (or logged)' }, { status: 200 });
  } catch (err) {
    console.error('Notification error:', err);
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}