import mongoose, { Schema } from 'mongoose';
import { IPurchase, AssetType } from '../types/index';

const purchaseSchema = new Schema<IPurchase>(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assetType: {
      type: String,
      enum: ['campaign', 'world', 'assetPack'] as AssetType[],
      required: true,
      index: true,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    pricePaid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    provider: {
      type: String,
      required: true,
    },
    providerChargeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index to check ownership
purchaseSchema.index({ buyerUserId: 1, assetType: 1, assetId: 1 });

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);
