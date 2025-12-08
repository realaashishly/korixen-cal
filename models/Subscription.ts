import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  startDate: Date;
  endDate?: Date;
  type: string;
  isActive: boolean;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: '$' },
    billingCycle: { type: String, default: 'monthly' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    type: { type: String, default: 'other' },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: '#000000' },
    icon: { type: String, default: 'CreditCard' },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
