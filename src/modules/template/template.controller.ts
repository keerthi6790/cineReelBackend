import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { CreateTemplateInput } from "./template.schema";

const DEFAULT_TEMPLATES = [
  {
    slug: "nova-tech",
    name: "Nova Tech & Minimal",
    tagline: "High-tech, sleek contrast interface",
    description: "Engineered for modern electronics, SaaS merch, and gadgets with crisp grid layouts and dark-mode accents.",
    previewImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    accentColor: "#3B82F6",
    badge: "Bestseller",
    features: JSON.stringify(["Dark Mode Adaptive", "High-Res Specs Table", "Express Drawer Checkout", "Interactive Sticky Header"]),
  },
  {
    slug: "velvet-luxury",
    name: "Velvet Haute Couture",
    tagline: "Elegant editorial layouts with serif typography",
    description: "Designed for high-end fashion, luxury accessories, and premium apparel with immersive Lookbook showcases.",
    previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    accentColor: "#EC4899",
    badge: "Luxury",
    features: JSON.stringify(["Editorial Lookbook", "Size & Color Variant Selector", "Full-screen Video Banner", "VIP Customer Tier Badges"]),
  },
  {
    slug: "artisan-craft",
    name: "Artisan Craft & Studio",
    tagline: "Warm organic tones for handcrafted goods",
    description: "Perfect for handcrafted ceramics, coffee beans, home living decor, and sustainable artisan products.",
    previewImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    accentColor: "#F59E0B",
    badge: "Trending",
    features: JSON.stringify(["Maker Story Section", "Subscription & Auto-Ship", "Eco-Impact Score Badge", "Customer Photo Gallery"]),
  },
  {
    slug: "pulse-streetwear",
    name: "Pulse Urban Streetwear",
    tagline: "Bold typography, neon accents & fast drops",
    description: "Tailored for drop-model apparel, sneakers, streetwear brands, and vibrant high-energy modern retail.",
    previewImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    accentColor: "#8B5CF6",
    badge: "New",
    features: JSON.stringify(["Limited Drop Countdown Timer", "Insta-Story Reels Carousel", "Sticky Quick Buy Bar", "Social Proof Toast Alerts"]),
  },
  {
    slug: "botanica-wellness",
    name: "Botanica Pure Skincare",
    tagline: "Clean pastel aesthetics for wellness & cosmetics",
    description: "Soothing layout crafted for organic skincare, cosmetics, supplements, and holistic wellness remedies.",
    previewImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    accentColor: "#10B981",
    badge: "Popular",
    features: JSON.stringify(["Skin Routine Quiz", "Clean Label Ingredients Guide", "Auto-Replenish Subscribe", "Before & After Slider"]),
  },
];

export async function getTemplatesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let templates = await prisma.template.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (templates.length === 0) {
    // Seed default templates
    for (const tmpl of DEFAULT_TEMPLATES) {
      await prisma.template.create({ data: tmpl });
    }
    templates = await prisma.template.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return reply.status(200).send(templates);
}

export async function createTemplateHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CreateTemplateInput;

  const existing = await prisma.template.findUnique({
    where: { slug: body.slug },
  });

  if (existing) {
    return reply.status(400).send({ message: "Template with this slug already exists." });
  }

  const template = await prisma.template.create({
    data: body,
  });

  return reply.status(201).send(template);
}

export async function getTemplateByIdOrSlugHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { idOrSlug } = request.params as { idOrSlug: string };

  const template = await prisma.template.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  if (!template) {
    return reply.status(404).send({ message: "Template not found." });
  }

  return reply.status(200).send(template);
}
