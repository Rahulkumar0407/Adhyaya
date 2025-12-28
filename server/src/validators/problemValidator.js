import { z } from 'zod';

export const problemValidator = {
    // Validation for creating a problem
    create: z.object({
        body: z.object({
            title: z.string().min(5, 'Title must be at least 5 characters'),
            description: z.string().optional(),
            companyTags: z.array(z.string()).optional(),
            difficulty: z.enum(['Easy', 'Medium', 'Hard']),
            topics: z.array(z.string()).optional(),
            estimatedTime: z.number().positive().optional(),
            solution: z.string().optional(),
            hints: z.array(z.string()).optional()
        })
    }),

    // Validation for updating a problem (partial)
    update: z.object({
        params: z.object({
            id: z.string().uuid().or(z.string().regex(/^[0-9a-fA-F]{24}$/))
        }),
        body: z.object({
            title: z.string().min(5).optional(),
            description: z.string().optional(),
            companyTags: z.array(z.string()).optional(),
            difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
            topics: z.array(z.string()).optional(),
            estimatedTime: z.number().positive().optional(),
            solution: z.string().optional(),
            hints: z.array(z.string()).optional()
        })
    })
};
