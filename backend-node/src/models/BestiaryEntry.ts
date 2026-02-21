import mongoose, { Schema } from 'mongoose';
import { IBestiaryEntry, IBestiaryStatBlock, ILevelRange } from '../types/index';

const bestiaryStatBlockSchema = new Schema<IBestiaryStatBlock>(
  {
    hp: { type: Number, required: true },
    ac: { type: Number, required: true },
    speed: { type: String },
    attacks: {
      type: [
        {
          name: { type: String, required: true },
          bonus: { type: Number, required: true },
          damage: { type: String, required: true },
          type: { type: String, required: true },
        },
      ],
      default: [],
    },
    abilities: { type: [String], default: [] },
    resistances: { type: [String], default: [] },
    vulnerabilities: { type: [String], default: [] },
    immunities: { type: [String], default: [] },
  },
  { _id: false }
);

const levelRangeSchema = new Schema<ILevelRange>(
  {
    min: { type: Number, required: true, default: 1 },
    max: { type: Number, required: true, default: 5 },
  },
  { _id: false }
);

const bestiaryEntrySchema = new Schema<IBestiaryEntry>(
  {
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    challengeRating: {
      type: Schema.Types.Mixed,
      required: true,
    },
    recommendedLevelRange: {
      type: levelRangeSchema,
      default: { min: 1, max: 5 },
    },
    statBlock: {
      type: bestiaryStatBlockSchema,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    lore: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const BestiaryEntry = mongoose.model<IBestiaryEntry>('BestiaryEntry', bestiaryEntrySchema);
