import { z } from 'zod';

// Register validation
export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        name: z.string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters'),
        confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    })
});

// Login validation
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required')
    })
});

// Google auth validation
export const googleAuthSchema = z.object({
    body: z.object({
        idToken: z.string().min(1, 'Google ID token is required')
    })
});

// Refresh token validation
export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required')
    })
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address')
    })
});

// Reset password validation
export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    })
});

// Update profile validation
export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().url().optional()
    })
});

// Change password validation
export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmNewPassword: z.string()
    }).refine(data => data.newPassword === data.confirmNewPassword, {
        message: "Passwords don't match",
        path: ['confirmNewPassword']
    })
});
