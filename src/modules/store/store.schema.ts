import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createStoreSchema = z.object({
  name: z.string({ required_error: "Store name is required" }).min(2, "Store name must be at least 2 characters"),
  slug: z
    .string({ required_error: "Store slug is required" })
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  templateId: z.string().optional(),
  templateSlug: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
});

const storeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  currency: z.string(),
  status: z.string(),
  ownerId: z.string(),
  templateId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

const updateStoreSetupSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional().or(z.literal("")),
  contactPhone: z.string().nullable().optional(),
  addressStreet: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressState: z.string().nullable().optional(),
  addressZip: z.string().nullable().optional(),
  addressCountry: z.string().nullable().optional(),
  socialFacebook: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialTwitter: z.string().nullable().optional(),
  socialLinkedin: z.string().nullable().optional(),
  socialYoutube: z.string().nullable().optional(),
  socialTiktok: z.string().nullable().optional(),
  socialPinterest: z.string().nullable().optional(),
  customDomain: z.string().nullable().optional(),
  domainStatus: z.string().nullable().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

const storeSetupResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  addressStreet: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressState: z.string().nullable().optional(),
  addressZip: z.string().nullable().optional(),
  addressCountry: z.string().nullable().optional(),
  socialFacebook: z.string().nullable().optional(),
  socialInstagram: z.string().nullable().optional(),
  socialTwitter: z.string().nullable().optional(),
  socialLinkedin: z.string().nullable().optional(),
  socialYoutube: z.string().nullable().optional(),
  socialTiktok: z.string().nullable().optional(),
  socialPinterest: z.string().nullable().optional(),
  customDomain: z.string().nullable().optional(),
  domainStatus: z.string().nullable().optional(),
  currency: z.string(),
  language: z.string(),
  timezone: z.string(),
  status: z.string(),
  ownerId: z.string(),
});

const publishTemplateSchema = z.object({
  templateSlug: z.string({ required_error: "Template slug is required" }),
});

const updateThemeConfigSchema = z.object({
  activeTemplateSlug: z.string().optional(),
  themePrimaryColor: z.string().optional(),
  themeSecondaryColor: z.string().optional(),
  themeBackgroundColor: z.string().optional(),
  themeTextColor: z.string().optional(),
  themeAccentColor: z.string().optional(),
  themeHeadingFont: z.string().optional(),
  themeBodyFont: z.string().optional(),
  themeFontSize: z.string().optional(),
  themeBorderRadius: z.string().optional(),
  themeButtonStyle: z.string().optional(),
  themeLayoutWidth: z.string().optional(),
  headerStyle: z.string().optional(),
  headerSticky: z.boolean().optional(),
  headerAnnouncement: z.string().optional(),
  headerShowSearch: z.boolean().optional(),
  headerShowCurrency: z.boolean().optional(),
  footerStyle: z.string().optional(),
  footerCopyright: z.string().optional(),
  footerShowSocial: z.boolean().optional(),
  footerShowNewsletter: z.boolean().optional(),
  footerShowPaymentBadges: z.boolean().optional(),
});

const storeThemeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  activeTemplateSlug: z.string().nullable().optional(),
  themePrimaryColor: z.string().nullable().optional(),
  themeSecondaryColor: z.string().nullable().optional(),
  themeBackgroundColor: z.string().nullable().optional(),
  themeTextColor: z.string().nullable().optional(),
  themeAccentColor: z.string().nullable().optional(),
  themeHeadingFont: z.string().nullable().optional(),
  themeBodyFont: z.string().nullable().optional(),
  themeFontSize: z.string().nullable().optional(),
  themeBorderRadius: z.string().nullable().optional(),
  themeButtonStyle: z.string().nullable().optional(),
  themeLayoutWidth: z.string().nullable().optional(),
  headerStyle: z.string().nullable().optional(),
  headerSticky: z.boolean().nullable().optional(),
  headerAnnouncement: z.string().nullable().optional(),
  headerShowSearch: z.boolean().nullable().optional(),
  headerShowCurrency: z.boolean().nullable().optional(),
  footerStyle: z.string().nullable().optional(),
  footerCopyright: z.string().nullable().optional(),
  footerShowSocial: z.boolean().nullable().optional(),
  footerShowNewsletter: z.boolean().nullable().optional(),
  footerShowPaymentBadges: z.boolean().nullable().optional(),
});

const storesListResponseSchema = z.array(storeResponseSchema);

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreSetupInput = z.infer<typeof updateStoreSetupSchema>;
export type PublishTemplateInput = z.infer<typeof publishTemplateSchema>;
export type UpdateThemeConfigInput = z.infer<typeof updateThemeConfigSchema>;

export const { schemas: storeSchemas, $ref } = buildJsonSchemas(
  {
    createStoreSchema,
    updateStoreSetupSchema,
    publishTemplateSchema,
    updateThemeConfigSchema,
    storeResponseSchema,
    storeSetupResponseSchema,
    storeThemeResponseSchema,
    storesListResponseSchema,
  },
  { $id: "storeSchemas" }
);
