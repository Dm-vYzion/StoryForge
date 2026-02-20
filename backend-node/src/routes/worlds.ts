import { Router, Request, Response } from 'express';
import { World, Purchase } from '../models/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { createWorldSchema, worldQuerySchema } from '../schemas/index.js';

const router = Router();

/**
 * POST /worlds
 * Create a new world
 */
router.post(
  '/',
  requireAuth,
  validate(createWorldSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.body;

    // Check if slug is unique
    const existingWorld = await World.findOne({ slug });
    if (existingWorld) {
      throw new ApiError(409, 'A world with this slug already exists');
    }

    const world = await World.create({
      ...req.body,
      authorUserId: req.user!._id,
    });

    res.status(201).json({
      success: true,
      data: world,
    });
  })
);

/**
 * GET /worlds/public
 * List public worlds with pagination and filters
 */
router.get(
  '/public',
  validateQuery(worldQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { tags, licenseMode, page = 1, limit = 20 } = req.query as {
      tags?: string;
      licenseMode?: string;
      page?: number;
      limit?: number;
    };

    const query: Record<string, unknown> = {};

    if (tags) {
      query.defaultTags = { $in: tags.split(',') };
    }
    if (licenseMode) {
      query.licenseMode = licenseMode;
    }

    const skip = (page - 1) * limit;

    const [worlds, total] = await Promise.all([
      World.find(query)
        .select('name slug description defaultTags licenseMode licensePrice authorUserId createdAt')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      World.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        worlds,
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
 * GET /worlds/:id
 * Get world details including linked asset IDs
 */
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const world = await World.findById(req.params.id);

    if (!world) {
      throw new ApiError(404, 'World not found');
    }

    res.json({
      success: true,
      data: world,
    });
  })
);

/**
 * POST /worlds/:id/license
 * License a world (stub - creates purchase record without real payment)
 */
router.post(
  '/:id/license',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const world = await World.findById(req.params.id);

    if (!world) {
      throw new ApiError(404, 'World not found');
    }

    // Check if already licensed
    const existingPurchase = await Purchase.findOne({
      buyerUserId: req.user!._id,
      assetType: 'world',
      assetId: world._id,
    });

    if (existingPurchase) {
      throw new ApiError(409, 'You already have a license for this world');
    }

    // Check if world requires payment
    if (world.licenseMode === 'paid' && world.licensePrice > 0) {
      // In a real implementation, this would integrate with Stripe/payment provider
      // For now, we create a stub purchase record
    }

    // Create purchase record
    const purchase = await Purchase.create({
      buyerUserId: req.user!._id,
      assetType: 'world',
      assetId: world._id,
      pricePaid: world.licensePrice || 0,
      currency: 'USD',
      provider: 'manual',
      providerChargeId: `stub_${Date.now()}`,
    });

    res.status(201).json({
      success: true,
      data: {
        purchase,
        message: 'World license acquired successfully',
      },
    });
  })
);

export default router;
