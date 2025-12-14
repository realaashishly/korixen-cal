import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  startTime: Date;
  endTime?: Date;
  type: string;
  department: string;
  status: string;
  description?: string;
  meetLink?: string;
  recurrence: string;
  order: number;
  location?: string;
  resources?: Array<{
    id: string;
    type: string;
    title: string;
    url: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    type: { type: String, default: 'meeting' },
    department: { type: String, default: 'General' },
    status: { type: String, default: 'todo' },
    description: { type: String },
    meetLink: { type: String },
    recurrence: { type: String, default: 'none' },
    order: { type: Number, default: 0 },
    location: { type: String },
    resources: [
      {
        id: String,
        type: String,
        title: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

// Index for fetching a user's events
EventSchema.index({ userId: 1, startTime: 1 });
// Index for sorting or simple lookups
EventSchema.index({ userId: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
