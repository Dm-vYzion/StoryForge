import { Router, Request, Response } from 'express';
import { Purchase, CampaignDefinition, World, AssetPack } from '../models/index';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { checkoutSchema } from '../schemas/index';

const router = Router();

/**
 * POST /purchases/checkout
 * Stub endpoint to record a purchase (no real payment integration)
 */
router.post(
  '/checkout',
  requireAuth,
  validate(checkoutSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { assetType, assetId } = req.body;

    // Validate asset exists and get price
    let asset;
    let price = 0;

    switch (assetType) {
      case 'campaign':
        asset = await CampaignDefinition.findById(assetId);
        if (!asset) throw new ApiError(404, 'Campaign not found');
        if (!asset.isPaid) throw new ApiError(400, 'This campaign is free');
        price = asset.price;
        break;
      case 'world':
        asset = await World.findById(assetId);
        if (!asset) throw new ApiError(404, 'World not found');
        if (asset.licenseMode !== 'paid') throw new ApiError(400, 'This world does not require purchase');
        price = asset.licensePrice;
        break;
      case 'assetPack':
        asset = await AssetPack.findById(assetId);
        if (!asset) throw new ApiError(404, 'Asset pack not found');
        if (!asset.isPaid) throw new ApiError(400, 'This asset pack is free');
        price = asset.price;
        break;
      default:
        throw new ApiError(400, 'Invalid asset type');
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      buyerUserId: req.user!._id,
      assetType,
      assetId: asset._id,
    });

    if (existingPurchase) {
      throw new ApiError(409, 'You already own this asset');
    }

    // Create purchase record (stub - no real payment)
    const purchase = await Purchase.create({
      buyerUserId: req.user!._id,
      assetType,
      assetId: asset._id,
      pricePaid: price,
      currency: 'USD',
      provider: 'stub',
      providerChargeId: `stub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    });

    res.status(201).json({
      success: true,
      data: {
        purchase,
        message: 'Purchase recorded successfully (stub - no real payment)',
        note: 'In production, this would integrate with Stripe or another payment provider',
      },
    });
  })
);

/**
 * GET /purchases/my-assets
 * List assets the user owns
 */
router.get(
  '/my-assets',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const purchases = await Purchase.find({ buyerUserId: req.user!._id })
      .sort({ createdAt: -1 });

    // Group by asset type
    const campaignIds = purchases.filter(p => p.assetType === 'campaign').map(p => p.assetId);
    const worldIds = purchases.filter(p => p.assetType === 'world').map(p => p.assetId);
    const assetPackIds = purchases.filter(p => p.assetType === 'assetPack').map(p => p.assetId);

    const [campaigns, worlds, assetPacks] = await Promise.all([
      CampaignDefinition.find({ _id: { $in: campaignIds } })
        .select('title shortDescription tags'),
      World.find({ _id: { $in: worldIds } })
        .select('name slug description'),
      AssetPack.find({ _id: { $in: assetPackIds } })
        .select('name description type'),
    ]);

    res.json({
      success: true,
      data: {
        campaigns,
        worlds,
        assetPacks,
        purchaseHistory: purchases,
      },
    });
  })
);

/**
 * GET /purchases/check/:assetType/:assetId
 * Check if user owns a specific asset
 */
router.get(
  '/check/:assetType/:assetId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { assetType, assetId } = req.params;

    const purchase = await Purchase.findOne({
      buyerUserId: req.user!._id,
      assetType,
      assetId,
    });

    res.json({
      success: true,
      data: {
        owned: !!purchase,
        purchase: purchase || null,
      },
    });
  })
);

export default router;
