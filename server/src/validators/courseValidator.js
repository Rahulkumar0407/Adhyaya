import { z } from 'zod';

export const courseValidator = {
    create: z.object({
        body: z.object({
            title: z.string().min(5, 'Title must be at least 5 characters').max(200),
            description: z.string().min(20, 'Description must be at least 20 characters'),
            category: z.enum(['dsa', 'lld', 'system-design', 'ai-ml', 'web-dev', 'other']),
            difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
            pricing: z.object({
                type: z.enum(['free', 'paid', 'subscription']),
                amount: z.number().min(0).optional(),
                currency: z.string().default('INR')
            })
        })
    }),

    enroll: z.object({
        body: z.object({
            courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID')
        })
    })
};
