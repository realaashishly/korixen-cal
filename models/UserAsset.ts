import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define the interface for TypeScript
export interface IUserAsset extends Document {
  userId: mongoose.Types.ObjectId;
  resources: any[]; // You can define a stricter type if needed
  departments: string[];
  eventTypes: string[];
  resourceCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the Default Values
const defaultDepartments = ["Design", "Engineering", "Product", "Marketing", "General"];
const defaultEventTypes = ["meeting", "task", "birthday", "reminder"];
const defaultResourceCategories = ["Document", "Spreadsheet", "Youtube", "Google Drive", "Dropbox", "Notion", "Design", "Link"];

// 3. Create the Schema
const UserAssetSchema: Schema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true // Ensures one asset document per user
    },
    resources: { 
      type: [Schema.Types.Mixed], 
      default: [] 
    },
    departments: { 
      type: [String], 
      default: defaultDepartments 
    },
    eventTypes: { 
      type: [String], 
      default: defaultEventTypes 
    },
    resourceCategories: { 
      type: [String], 
      default: defaultResourceCategories 
    },
  },
  { timestamps: true }
);

// 4. Export the Model
const UserAsset: Model<IUserAsset> = mongoose.models.UserAsset || mongoose.model<IUserAsset>('UserAsset', UserAssetSchema);

export default UserAsset;