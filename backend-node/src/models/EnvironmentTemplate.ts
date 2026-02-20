import mongoose, { Schema } from 'mongoose';
import { IEnvironmentTemplate, IEnvironmentDefaultState, EnvironmentType } from '../types/index.js';

const environmentDefaultStateSchema = new Schema<IEnvironmentDefaultState>(
  {
    isDestroyed: { type: Boolean, default: false },
    ownerNpcTemplateId: { type: Schema.Types.ObjectId, ref: 'NpcTemplate' },
    isLocked: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    customFlags: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const environmentTemplateSchema = new Schema<IEnvironmentTemplate>(
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
    type: {
      type: String,
      enum: [
        'tavern',
        'shop',
        'dungeon',
        'landmark',
        'wilderness',
        'city',
        'village',
        'castle',
        'cave',
        'temple',
        'other',
      ] as EnvironmentType[],
      required: true,
      index: true,
    },
    defaultLocation: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    defaultState: {
      type: environmentDefaultStateSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const EnvironmentTemplate = mongoose.model<IEnvironmentTemplate>(
  'EnvironmentTemplate',
  environmentTemplateSchema
);
