import mongoose, { Schema } from 'mongoose';
import { IPlayerCharacter, IBaseStats, IAbility, IGlobalAchievement } from '../types/index';

const baseStatsSchema = new Schema<IBaseStats>(
  {
    STR: { type: Number, required: true, default: 10 },
    DEX: { type: Number, required: true, default: 10 },
    CON: { type: Number, required: true, default: 10 },
    INT: { type: Number, required: true, default: 10 },
    WIS: { type: Number, required: true, default: 10 },
    CHA: { type: Number, required: true, default: 10 },
  },
  { _id: false }
);

const abilitySchema = new Schema<IAbility>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String },
    level: { type: Number },
  },
  { _id: false }
);

const globalAchievementSchema = new Schema<IGlobalAchievement>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    campaignDefId: { type: Schema.Types.ObjectId, ref: 'CampaignDefinition' },
    earnedAt: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const playerCharacterSchema = new Schema<IPlayerCharacter>(
  {
    ownerUserId: {
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
    race: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 20,
    },
    maxHp: {
      type: Number,
      required: true,
      min: 1,
    },
    baseStats: {
      type: baseStatsSchema,
      required: true,
    },
    abilities: {
      type: [abilitySchema],
      default: [],
    },
    background: {
      type: String,
      default: '',
    },
    biography: {
      type: String,
      default: '',
    },
    titles: {
      type: [String],
      default: [],
    },
    globalAchievements: {
      type: [globalAchievementSchema],
      default: [],
    },
    portraitUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's characters
playerCharacterSchema.index({ ownerUserId: 1, createdAt: -1 });

export const PlayerCharacter = mongoose.model<IPlayerCharacter>(
  'PlayerCharacter',
  playerCharacterSchema
);
