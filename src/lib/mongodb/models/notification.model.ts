import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  donorId: mongoose.Types.ObjectId;
  clinicId: mongoose.Types.ObjectId;
  bloodRequestId?: mongoose.Types.ObjectId;
  status: 'pending' | 'sent' | 'failed';
  email: string;
  subject: string;
  message: string;
  sentAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    bloodRequestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification as mongoose.Model<INotification> ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
