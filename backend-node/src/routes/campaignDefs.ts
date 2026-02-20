import { Router, Request, Response } from 'express';
import { CampaignDefinition, World, Purchase } from '../models/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { createCampaignDefSchema, updateCampaignDefSchema, campaignDefQuerySchema } from '../schemas/index.js';
import { Types } from 'mongoose';

const router = Router();

/**
 * POST /campaign-defs
 * Create a new campaign definition
 */
router.post(
  '/',
  requireAuth,
  validate(createCampaignDefSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { worldId } = req.body;

    // If worldId is provided, validate access
    if (worldId) {
      const world = await World.findById(worldId);
      if (!world) {
        throw new ApiError(404, 'World not found');
      }

      // Check if world requires a license
      if (world.licenseMode === 'paid') {
        const isAuthor = world.authorUserId.toString() === req.user!._id.toString();
        
        if (!isAuthor) {
          const purchase = await Purchase.findOne({
            buyerUserId: req.user!._id,
            assetType: 'world',
            assetId: world._id,
          });

          if (!purchase) {
            throw new ApiError(403, 'You need to purchase a license for this world');
          }
        }
      }
    }

    const campaignDef = await CampaignDefinition.create({
      ...req.body,
      authorUserId: req.user!._id,
      worldId: worldId ? new Types.ObjectId(worldId) : undefined,
    });

    res.status(201).json({
      success: true,
      data: campaignDef,
    });
  })
);

/**
 * GET /campaign-defs/public
 * List public/marketplace campaign definitions
 */
router.get(
  '/public',
  validateQuery(campaignDefQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { tags, worldId, minLevel, maxLevel, page = 1, limit = 20 } = req.query as {
      tags?: string;
      worldId?: string;
      minLevel?: number;
      maxLevel?: number;
      page?: number;
      limit?: number;
    };

    const query: Record<string, unknown> = {
      visibility: { $in: ['public', 'marketplace'] },
    };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (worldId) {
      query.worldId = new Types.ObjectId(worldId);
    }
    if (minLevel !== undefined) {
      query['recommendedLevel.min'] = { $gte: minLevel };
    }
    if (maxLevel !== undefined) {
      query['recommendedLevel.max'] = { $lte: maxLevel };
    }

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      CampaignDefinition.find(query)
        .select('title shortDescription tags recommendedLevel visibility isPaid price currency authorUserId worldId createdAt')
        .populate('worldId', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      CampaignDefinition.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * GET /campaign-defs/mine
 * List user's own campaign definitions
 */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const campaigns = await CampaignDefinition.find({ authorUserId: req.user!._id })
      .select('title shortDescription tags recommendedLevel visibility isPaid price currency worldId createdAt updatedAt')
      .populate('worldId', 'name slug')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: campaigns,
    });
  })
);

/**
 * GET /campaign-defs/:id
 * Get a specific campaign definition
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const campaignDef = await CampaignDefinition.findById(req.params.id)
      .populate('worldId', 'name slug baseTruths');

    if (!campaignDef) {
      throw new ApiError(404, 'Campaign definition not found');
    }

    // Check visibility
    if (campaignDef.visibility === 'private') {
      if (!req.user || campaignDef.authorUserId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'This campaign is private');
      }
    }

    // Check if paid campaign requires purchase
    if (campaignDef.isPaid && req.user) {
      const isAuthor = campaignDef.authorUserId.toString() === req.user._id.toString();
      
      if (!isAuthor) {
        const purchase = await Purchase.findOne({
          buyerUserId: req.user._id,
          assetType: 'campaign',
          assetId: campaignDef._id,
        });

        if (!purchase) {
          // Return limited info for unpurchased campaigns
          res.json({
            success: true,
            data: {
              _id: campaignDef._id,
              title: campaignDef.title,
              shortDescription: campaignDef.shortDescription,
              tags: campaignDef.tags,
              recommendedLevel: campaignDef.recommendedLevel,
              isPaid: true,
              price: campaignDef.price,
              currency: campaignDef.currency,
              requiresPurchase: true,
            },
          });
          return;
        }
      }
    }

    res.json({
      success: true,
      data: campaignDef,
    });
  })
);

/**
 * PATCH /campaign-defs/:id
 * Update a campaign definition (author only)
 */
router.patch(
  '/:id',
  requireAuth,
  validate(updateCampaignDefSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const campaignDef = await CampaignDefinition.findById(req.params.id);

    if (!campaignDef) {
      throw new ApiError(404, 'Campaign definition not found');
    }

    // Verify ownership
    if (campaignDef.authorUserId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only edit your own campaigns');
    }

    // Update fields
    const updatedCampaign = await CampaignDefinition.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCampaign,
    });
  })
);

export default router;
