import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async';
import { ApiError } from '../utils/errors';
import User from '../models/user.model';
import Organization from '../models/organization.model';
import { redisClient } from '../config/redis';
import { logger, logAudit, logSecurity } from '../utils/logger';
import { sendEmail } from '../utils/email';
import { generateTOTP, verifyTOTP } from '../utils/totp';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthController {
  /**
   * @desc    Register user
   * @route   POST /api/auth/register
   * @access  Public
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, organizationId } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, 'Organization not found');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      organizationId,
      role: 'member'
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        template: 'emailVerification',
        data: {
          name: user.firstName,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
        }
      });
    } catch (error) {
      user.emailVerificationToken = undefined;
      await user.save();
      throw new ApiError(500, 'Email could not be sent');
    }

    // Log audit
    logAudit('USER_REGISTERED', user._id, {
      organizationId: user.organizationId
    });

    sendTokenResponse(user, 201, res);
  });

  /**
   * @desc    Login user
   * @route   POST /api/auth/login
   * @access  Public
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, mfaToken } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.security.loginAttempts += 1;
      
      // Lock account if too many attempts
      if (user.security.loginAttempts >= 5) {
        user.security.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        
        logSecurity('ACCOUNT_LOCKED', {
          userId: user._id,
          reason: 'Too many failed login attempts'
        });
        
        throw new ApiError(401, 'Account locked. Please try again later');
      }
      
      await user.save();
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is locked
    if (user.security.lockUntil && user.security.lockUntil > new Date()) {
      throw new ApiError(401, 'Account locked. Please try again later');
    }

    // Check if MFA is enabled
    if (user.security.mfaEnabled) {
      if (!mfaToken) {
        // Generate and send MFA token
        const secret = user.security.mfaSecret || generateTOTP();
        if (!user.security.mfaSecret) {
          user.security.mfaSecret = secret;
          await user.save();
        }

        return res.status(200).json({
          success: true,
          mfaRequired: true,
          message: 'Please provide MFA token'
        });
      }

      // Verify MFA token
      const isValidToken = verifyTOTP(mfaToken, user.security.mfaSecret!);
      if (!isValidToken) {
        throw new ApiError(401, 'Invalid MFA token');
      }
    }

    // Reset login attempts
    user.security.loginAttempts = 0;
    user.security.lockUntil = undefined;
    
    // Update last login
    user.security.lastLogin = {
      date: new Date(),
      ip: req.ip,
      userAgent: req.get('user-agent') || ''
    };
    
    await user.save();

    // Log audit
    logAudit('USER_LOGIN', user._id, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendTokenResponse(user, 200, res);
  });

  /**
   * @desc    Logout user
   * @route   POST /api/auth/logout
   * @access  Private
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // Invalidate token in Redis
    if (req.user) {
      await redisClient.del(`token:${req.user._id}`);
      
      logAudit('USER_LOGOUT', req.user._id);
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  });

  /**
   * @desc    Get current logged in user
   * @route   GET /api/auth/me
   * @access  Private
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id).populate('organizationId');

    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * @desc    Update user details
   * @route   PUT /api/auth/updatedetails
   * @access  Private
   */
  updateDetails = asyncHandler(async (req: Request, res: Response) => {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    logAudit('USER_UPDATED', req.user.id, {
      updatedFields: Object.keys(fieldsToUpdate)
    });

    res.status(200).json({
      success: true,
      data: user
    });
  });

  /**
   * @desc    Update password
   * @route   PUT /api/auth/updatepassword
   * @access  Private
   */
  updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user!.matchPassword(req.body.currentPassword))) {
      throw new ApiError(401, 'Password is incorrect');
    }

    // Check password history
    const hashedNewPassword = await user!.hashPassword(req.body.newPassword);
    if (user!.security.passwordHistory.includes(hashedNewPassword)) {
      throw new ApiError(400, 'Cannot reuse recent passwords');
    }

    user!.password = req.body.newPassword;
    await user!.save();

    logAudit('PASSWORD_UPDATED', user!._id);
    logSecurity('PASSWORD_CHANGED', { userId: user!._id });

    sendTokenResponse(user!, 200, res);
  });

  /**
   * @desc    Forgot password
   * @route   POST /api/auth/forgotpassword
   * @access  Public
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw new ApiError(404, 'No user found with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        template: 'passwordReset',
        data: {
          name: user.firstName,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
        }
      });

      logSecurity('PASSWORD_RESET_REQUESTED', { userId: user._id });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      throw new ApiError(500, 'Email could not be sent');
    }
  });

  /**
   * @desc    Reset password
   * @route   PUT /api/auth/resetpassword/:resettoken
   * @access  Public
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logAudit('PASSWORD_RESET', user._id);
    logSecurity('PASSWORD_RESET_COMPLETED', { userId: user._id });

    sendTokenResponse(user, 200, res);
  });

  /**
   * @desc    Verify email
   * @route   GET /api/auth/verifyemail/:token
   * @access  Public
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ emailVerificationToken });

    if (!user) {
      throw new ApiError(400, 'Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    logAudit('EMAIL_VERIFIED', user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  });
}

/**
 * Helper function to get token from model, create cookie and send response
 */
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();

  // Store token version in Redis
  const tokenVersion = crypto.randomBytes(8).toString('hex');
  redisClient.set(`token:${user._id}`, tokenVersion);

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE!) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

export default new AuthController();
