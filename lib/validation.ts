import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Consent schemas
export const consentStatusSchema = z.enum(['granted', 'denied']);

export const updateConsentSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  status: consentStatusSchema,
});

export const bulkUpdateConsentsSchema = z.object({
  consents: z.array(
    z.object({
      categoryId: z.string().min(1),
      status: consentStatusSchema,
    })
  ),
});

// Preference schemas
export const notificationChannelSchema = z.enum(['email', 'sms', 'push']);
export const frequencySchema = z.enum(['none', 'low', 'normal', 'high']);

export const updatePreferenceSchema = z.object({
  channel: notificationChannelSchema,
  frequency: frequencySchema,
  metaJson: z.any().optional(),
});

export const bulkUpdatePreferencesSchema = z.object({
  preferences: z.array(updatePreferenceSchema),
});

// Category schemas
export const createCategorySchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateConsentInput = z.infer<typeof updateConsentSchema>;
export type BulkUpdateConsentsInput = z.infer<typeof bulkUpdateConsentsSchema>;
export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
export type BulkUpdatePreferencesInput = z.infer<typeof bulkUpdatePreferencesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
