import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: string;
  location?: string;
  theme: 'light' | 'dark';
  isOnboardingComplete: boolean;
  trialStartDate?: Date;
  isUpgraded: boolean;
  couponRedeemed: boolean;
  resources: Array<{
    id: string;
    type: string;
    title: string;
    url: string;
  }>;
  departments: string[];
  eventTypes: string[];
  resourceCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema(
  {
    id: { type: String },
    type: { type: String },
    title: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Other' },
    location: { type: String },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    isOnboardingComplete: { type: Boolean, default: false },
    trialStartDate: { type: Date },
    isUpgraded: { type: Boolean, default: false },
    couponRedeemed: { type: Boolean, default: false },
    resources: { type: [ResourceSchema], default: [] },
    departments: { type: [String], default: [] },
    eventTypes: { type: [String], default: [] },
    resourceCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'user');

export default User;
