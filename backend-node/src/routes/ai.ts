import { Router, Request, Response } from 'express';
import { User } from '../models/index';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { aiGenerateSchema } from '../schemas/index';
import { config } from '../config/index';

const router = Router();

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  free: config.planLimits.free,
  pro: config.planLimits.pro,
  lifetime: config.planLimits.lifetime,
  admin: Infinity,
};

// 30 days in milliseconds
const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Check and reset AI usage period if needed
 */
async function checkAndResetUsagePeriod(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const periodStart = new Date(user.aiUsagePeriodStart);
  const elapsed = now.getTime() - periodStart.getTime();

  if (elapsed > PERIOD_MS) {
    // Reset period
    await User.findByIdAndUpdate(userId, {
      aiUsageThisPeriod: 0,
      aiUsagePeriodStart: now,
    });
  }
}

/**
 * POST /ai/generate
 * AI generation gateway with quota enforcement
 */
router.post(
  '/generate',
  requireAuth,
  validate(aiGenerateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { prompt, context, maxTokens = 500 } = req.body;

    // Check and reset usage period if needed
    await checkAndResetUsagePeriod(req.user!._id.toString());

    // Get fresh user data
    const user = await User.findById(req.user!._id).select('+aiApiKey');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const plan = user.plan;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const currentUsage = user.aiUsageThisPeriod;

    // Check if user has their own API key
    const hasOwnKey = !!user.aiApiKey;
    const serverHasKey = !!config.ai.providerApiKey;

    // Determine which key to use
    let apiKeyToUse: string | null = null;
    let usingOwnKey = false;

    if (hasOwnKey) {
      apiKeyToUse = user.aiApiKey!;
      usingOwnKey = true;
    } else if (serverHasKey) {
      // Check quota for server key
      if (currentUsage >= limit) {
        throw new ApiError(429, `AI quota exceeded. You have used ${currentUsage}/${limit} calls this period. Upgrade your plan or add your own API key.`, true);
      }
      apiKeyToUse = config.ai.providerApiKey;
    } else {
      throw new ApiError(503, 'No AI provider configured. Please add your own API key in settings.');
    }

    // Mock AI call (in production, this would call OpenAI/Anthropic/etc.)
    // For now, we return a stub response
    const mockResponse = {
      text: `[AI Response Stub]\n\nPrompt received: "${prompt.substring(0, 100)}..."\n\nIn production, this would call the AI provider with:\n- Max tokens: ${maxTokens}\n- Context keys: ${context ? Object.keys(context).join(', ') : 'none'}\n\nThis is a placeholder response for development.`,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: 150,
        totalTokens: Math.ceil(prompt.length / 4) + 150,
      },
    };

    // Increment usage if using server key
    if (!usingOwnKey) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { aiUsageThisPeriod: 1 },
      });
    }

    res.json({
      success: true,
      data: {
        response: mockResponse.text,
        usage: mockResponse.usage,
        meta: {
          usingOwnKey,
          quotaRemaining: usingOwnKey ? 'unlimited' : limit - currentUsage - 1,
          plan,
        },
      },
    });
  })
);

/**
 * GET /ai/usage
 * Get current AI usage stats
 */
router.get(
  '/usage',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // Check and reset if needed
    await checkAndResetUsagePeriod(req.user!._id.toString());

    const user = await User.findById(req.user!._id).select('+aiApiKey');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    const plan = user.plan;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const periodStart = new Date(user.aiUsagePeriodStart);
    const periodEnd = new Date(periodStart.getTime() + PERIOD_MS);

    res.json({
      success: true,
      data: {
        plan,
        currentUsage: user.aiUsageThisPeriod,
        limit,
        remaining: Math.max(0, limit - user.aiUsageThisPeriod),
        periodStart,
        periodEnd,
        hasOwnKey: !!user.aiApiKey,
      },
    });
  })
);

/**
 * PUT /ai/api-key
 * Set user's own AI API key (BYO key)
 */
router.put(
  '/api-key',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new ApiError(400, 'API key is required');
    }

    // In production, validate the key format and optionally test it
    // For now, just store it

    await User.findByIdAndUpdate(req.user!._id, {
      aiApiKey: apiKey,
    });

    res.json({
      success: true,
      message: 'API key saved successfully',
    });
  })
);

/**
 * DELETE /ai/api-key
 * Remove user's own AI API key
 */
router.delete(
  '/api-key',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await User.findByIdAndUpdate(req.user!._id, {
      $unset: { aiApiKey: 1 },
    });

    res.json({
      success: true,
      message: 'API key removed',
    });
  })
);

export default router;
