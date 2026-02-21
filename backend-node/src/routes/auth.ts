import { Router, Request, Response } from 'express';
import { User, hashPassword } from '../models/index';
import { requireAuth, generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { registerSchema, loginSchema, googleAuthSchema } from '../schemas/index';

const router = Router();

/**
 * POST /auth/register
 * Register a new user with email/password
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      plan: 'free',
      aiUsageThisPeriod: 0,
      aiUsagePeriodStart: new Date(),
    });

    // Generate token
    const token = generateToken(user.toObject());
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          plan: user.plan,
        },
        token,
      },
    });
  })
);

/**
 * POST /auth/login
 * Login with email/password
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user with password hash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.toObject());
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.displayName,
          plan: user.plan,
        },
        token,
      },
    });
  })
);

/**
 * POST /auth/logout
 * Clear session
 */
router.post(
  '/logout',
  asyncHandler(async (_req: Request, res: Response) => {
    clearAuthCookie(res);
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user!._id,
          email: req.user!.email,
          displayName: req.user!.displayName,
          plan: req.user!.plan,
          aiUsageThisPeriod: req.user!.aiUsageThisPeriod,
          createdAt: req.user!.createdAt,
        },
      },
    });
  })
);

/**
 * POST /auth/google
 * Google OAuth login (stub for future implementation)
 */
router.post(
  '/google',
  validate(googleAuthSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;

    // TODO: Implement Google OAuth verification
    // 1. Verify idToken with Google
    // 2. Extract email and googleId from token
    // 3. Find or create user
    // 4. Link googleId to user account
    // 5. Generate JWT and return

    res.status(501).json({
      success: false,
      error: 'Google OAuth not yet implemented',
      message: `Received token: ${idToken.substring(0, 20)}...`,
      todo: [
        'Verify idToken with Google OAuth',
        'Extract user info from token',
        'Find or create user by email',
        'Link googleId to user account',
        'Generate and return JWT',
      ],
    });
  })
);

export default router;
