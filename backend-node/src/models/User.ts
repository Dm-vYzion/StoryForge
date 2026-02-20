import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import argon2 from 'argon2';
import { IUser, IUserMethods, PlanType } from '../types/index.js';

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // Don't include by default in queries
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'lifetime', 'admin'] as PlanType[],
      default: 'free',
    },
    aiUsageThisPeriod: {
      type: Number,
      default: 0,
    },
    aiUsagePeriodStart: {
      type: Date,
      default: () => new Date(),
    },
    aiApiKey: {
      type: String,
      select: false, // Sensitive - don't include by default
    },
  },
  {
    timestamps: true,
  }
);

// Index for Google OAuth lookups
userSchema.index({ googleId: 1 }, { sparse: true });

// Method to compare password
userSchema.methods.comparePassword = async function (
  this: HydratedDocument<IUser>,
  candidatePassword: string
): Promise<boolean> {
  if (!this.passwordHash) {
    return false;
  }
  try {
    return await argon2.verify(this.passwordHash, candidatePassword);
  } catch {
    return false;
  }
};

// Static method to hash password
userSchema.statics.hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);

// Helper function to hash password (used in routes)
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password);
};
