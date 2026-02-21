import { Router, Request, Response } from 'express';
import { PlayerCharacter } from '../models/index';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { createPlayerCharacterSchema, updatePlayerCharacterSchema } from '../schemas/index';

const router = Router();

/**
 * POST /player-characters
 * Create a new player character (Hall of Warriors)
 */
router.post(
  '/',
  requireAuth,
  validate(createPlayerCharacterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const character = await PlayerCharacter.create({
      ...req.body,
      ownerUserId: req.user!._id,
    });

    res.status(201).json({
      success: true,
      data: character,
    });
  })
);

/**
 * GET /player-characters/mine
 * List user's player characters
 */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const characters = await PlayerCharacter.find({ ownerUserId: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: characters,
    });
  })
);

/**
 * GET /player-characters/:id
 * Get a specific player character (owner only)
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const character = await PlayerCharacter.findById(req.params.id);

    if (!character) {
      throw new ApiError(404, 'Player character not found');
    }

    // Verify ownership
    if (character.ownerUserId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only view your own characters');
    }

    res.json({
      success: true,
      data: character,
    });
  })
);

/**
 * PATCH /player-characters/:id
 * Update a player character (biography, titles, portrait)
 */
router.patch(
  '/:id',
  requireAuth,
  validate(updatePlayerCharacterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const character = await PlayerCharacter.findById(req.params.id);

    if (!character) {
      throw new ApiError(404, 'Player character not found');
    }

    // Verify ownership
    if (character.ownerUserId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only edit your own characters');
    }

    const updatedCharacter = await PlayerCharacter.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCharacter,
    });
  })
);

/**
 * DELETE /player-characters/:id
 * Delete a player character
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const character = await PlayerCharacter.findById(req.params.id);

    if (!character) {
      throw new ApiError(404, 'Player character not found');
    }

    // Verify ownership
    if (character.ownerUserId.toString() !== req.user!._id.toString()) {
      throw new ApiError(403, 'You can only delete your own characters');
    }

    await PlayerCharacter.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Character deleted successfully',
    });
  })
);

export default router;
