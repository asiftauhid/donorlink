// src/app/api/clinics/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import Clinic from '@/lib/mongodb/models/clinic.model';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();
    const body = await request.json();
    
    // Rest of your code...
    const { name, latitude, longitude, email, phone, licenseNumber, password } = body;
    
    // Your validation logic...
    
    // Create new clinic
    const clinic = await Clinic.create({
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      email,
      phone,
      licenseNumber,
      password: await bcrypt.hash(password, 10),
    });
    
    return NextResponse.json({ 
      success: true,
      message: `Congratulations! ${name} is successfully registered to DonorLink`,
      clinic: {
        id: clinic._id,
        name: clinic.name,
        email: clinic.email
      }
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Error handling...
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}