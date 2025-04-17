// src/lib/mongodb/models/clinic.model.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  latitude: number;
  longitude: number;
  email: string;
  phone: string;
  licenseNumber: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Use a different pattern to check for existing models that works in server components
const Clinic = models.Clinic || model<IClinic>('Clinic', ClinicSchema);

export default Clinic;