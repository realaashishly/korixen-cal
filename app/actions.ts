"use server";

import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import Event, { IEvent } from "@/models/Event";
import Subscription, { ISubscription } from "@/models/Subscription";
import { CalendarEvent, Subscription as SubType, UserRole } from "@/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import mongoose from "mongoose";
import UserAsset from "@/models/UserAsset";

// --- Helper ---

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.email) return null;
  return session.user;
}

// --- User Actions ---

// export async function updateUser(data: Partial<IUser>) {
//   const sessionUser = await getSessionUser();
//   if (!sessionUser) return null;

//   await dbConnect();
//   const user = await User.findOneAndUpdate({ email: sessionUser.email }, data, { new: true }).lean();
//   if (user) {
//     return {
//       ...user,
//       _id: user._id.toString(),
//       createdAt: user.createdAt?.toISOString(),
//       updatedAt: user.updatedAt?.toISOString(),
//       trialStartDate: user.trialStartDate?.toISOString(),
//     };
//   }
//   return null;
// }

async function getSessionUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // Adjust depending on if your session stores 'id' or '_id'
  return session?.user?.id || session?.user?.id || null;
}

/**
 * 1. INITIALIZE ASSETS
 * Call this function immediately after a new user registers in your system.
 */
export async function createDefaultUserAssets() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  await dbConnect();

  try {
    // We use create() here. Because we defined 'default' values in the Schema,
    // we only need to pass the userId. MongoDB handles the arrays automatically.
    const newAssets = await UserAsset.create({
      userId: userId,
    });

    return { success: true, id: newAssets._id.toString() };
  } catch (error) {
    console.error("Error creating user assets:", error);
    // If error code 11000, it means assets already exist for this user
    return { success: false };
  }
}

/**
 * 2. GET ASSETS
 * Call this in your frontend via useEffect to load the data.
 */
export async function getUserAssets() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  await dbConnect();

  const assets = await UserAsset.findOne({ userId }).lean();

  if (!assets) return null;

  // Convert to plain object for Next.js
  return {
    resources: assets.resources,
    departments: assets.departments,
    eventTypes: assets.eventTypes,
    resourceCategories: assets.resourceCategories,
    // We don't necessarily need to send back database timestamps
  };
}

/**
 * 3. UPDATE ASSETS
 * Call this when a user adds a new department, resource, etc.
 */
export async function updateUserAssets(data: {
  resources?: any[];
  departments?: string[];
  eventTypes?: string[];
  resourceCategories?: string[];
}) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");

  await dbConnect();

  const updateData: any = {};
  if (data.resources) updateData.resources = data.resources;
  if (data.departments) updateData.departments = data.departments;
  if (data.eventTypes) updateData.eventTypes = data.eventTypes;
  if (data.resourceCategories)
    updateData.resourceCategories = data.resourceCategories;

  if (Object.keys(updateData).length === 0) return;

  await UserAsset.findOneAndUpdate(
    { userId: userId },
    { $set: updateData },
    { new: true }
  );

  return { success: true };
}

export async function updateUserPreferences(data: {
  resources?: any[];
  departments?: string[];
  eventTypes?: string[];
  resourceCategories?: string[];
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();

  // Use native driver to bypass Mongoose model validation/hooks if needed
  // Note: mongoose.connection.db might be undefined if not connected, but dbConnect() ensures it.
  if (!mongoose.connection.db) {
    throw new Error("Database connection not established");
  }

  const collection = mongoose.connection.db.collection("users");

  const updateData: any = {};
  if (data.resources) updateData.resources = data.resources;
  if (data.departments) updateData.departments = data.departments;
  if (data.eventTypes) updateData.eventTypes = data.eventTypes;
  if (data.resourceCategories)
    updateData.resourceCategories = data.resourceCategories;

  if (Object.keys(updateData).length === 0) return;

  await collection.updateOne(
    { email: sessionUser.email },
    { $set: updateData }
  );

  return { success: true };
}

// --- Event Actions ---

export async function getEvents() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return [];

  await dbConnect();
  const user = await User.findOne({ email: sessionUser.email });
  if (!user) return [];

  const events = await Event.find({ userId: user._id }).lean();
  return events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    userId: event.userId.toString(),
    startTime: event.startTime.toISOString(),
    endTime: event.endTime?.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    id: event._id.toString(), // Map _id to id for frontend
  }));
}

export async function createEvent(eventData: Partial<CalendarEvent>) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findOne({ email: sessionUser.email });
  if (!user) throw new Error("User not found");

  const newEvent = await Event.create({
    userId: user._id,
    ...eventData,
    startTime: new Date(eventData.startTime!),
    endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
  });

  return {
    ...newEvent.toObject(),
    _id: newEvent._id.toString(),
    userId: newEvent.userId.toString(),
    startTime: newEvent.startTime.toISOString(),
    endTime: newEvent.endTime?.toISOString(),
    createdAt: newEvent.createdAt.toISOString(),
    updatedAt: newEvent.updatedAt.toISOString(),
    id: newEvent._id.toString(),
  };
}

export async function updateEvent(
  eventId: string,
  eventData: Partial<CalendarEvent>
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();

  // Prepare update data, converting dates if present
  const update: any = { ...eventData };
  if (update.startTime) update.startTime = new Date(update.startTime);
  if (update.endTime) update.endTime = new Date(update.endTime);
  delete update.id; // Don't update the id field if passed

  // Ensure the event belongs to the user (optional but good for security, though we trust the ID for now)
  // Ideally we should check if the event's userId matches the current user.

  const event = await Event.findByIdAndUpdate(eventId, update, {
    new: true,
  }).lean();
  if (!event) throw new Error("Event not found");

  return {
    ...event,
    _id: event._id.toString(),
    userId: event.userId.toString(),
    startTime: event.startTime.toISOString(),
    endTime: event.endTime?.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    id: event._id.toString(),
  };
}

export async function deleteEvent(eventId: string) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();
  await Event.findByIdAndDelete(eventId);
  return { success: true };
}

// --- Subscription Actions ---

export async function getSubscriptions() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return [];

  await dbConnect();
  const user = await User.findOne({ email: sessionUser.email });
  if (!user) return [];

  const subs = await Subscription.find({ userId: user._id }).lean();
  return subs.map((sub) => ({
    ...sub,
    _id: sub._id.toString(),
    userId: sub.userId.toString(),
    startDate: sub.startDate.toISOString(),
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    id: sub._id.toString(),
  }));
}

export async function createSubscription(subData: Partial<SubType>) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();
  const user = await User.findOne({ email: sessionUser.email });
  if (!user) throw new Error("User not found");

  const newSub = await Subscription.create({
    userId: user._id,
    ...subData,
    startDate: new Date(subData.startDate!),
  });

  return {
    ...newSub.toObject(),
    _id: newSub._id.toString(),
    userId: newSub.userId.toString(),
    startDate: newSub.startDate.toISOString(),
    createdAt: newSub.createdAt.toISOString(),
    updatedAt: newSub.updatedAt.toISOString(),
    id: newSub._id.toString(),
  };
}

export async function deleteSubscription(subId: string) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  await dbConnect();
  await Subscription.findByIdAndDelete(subId);
  return { success: true };
}
