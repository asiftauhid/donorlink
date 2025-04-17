import mongoose, { Schema, Document } from 'mongoose';

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

// Prevent Mongoose from creating the model multiple times during hot reloads
export default mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema);