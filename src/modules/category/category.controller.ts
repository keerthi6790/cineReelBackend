import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { CreateCategoryInput } from "./category.schema";

const DEFAULT_CATEGORIES = [
  { name: "Fashion & Apparel", slug: "fashion-apparel", icon: "👗", description: "Clothing, luxury garments, footwear and lifestyle apparel." },
  { name: "Tech & Electronics", slug: "tech-electronics", icon: "💻", description: "Smartphones, gadgets, software merch and modern electronics." },
  { name: "Home Decor & Living", slug: "home-living", icon: "🏠", description: "Furniture, handcrafted ceramics, lighting and living space decor." },
  { name: "Beauty & Skincare", slug: "beauty-skincare", icon: "✨", description: "Organic cosmetics, wellness remedies and body care products." },
  { name: "Artisanal & Gourmet Food", slug: "gourmet-food", icon: "☕", description: "Specialty coffee beans, artisanal chocolates and organic treats." },
  { name: "Fitness & Outdoor", slug: "fitness-outdoor", icon: "🏋️", description: "Gym equipment, sportswear, supplements and adventure gear." },
  { name: "Books & Stationery", slug: "books-stationery", icon: "📚", description: "Publications, notebooks, journals and creative supplies." },
];

export async function getCategoriesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (categories.length === 0) {
    // Seed default categories
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.create({ data: cat });
    }
    categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return reply.status(200).send(categories);
}

export async function createCategoryHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CreateCategoryInput;

  const existing = await prisma.category.findUnique({
    where: { slug: body.slug },
  });

  if (existing) {
    return reply.status(400).send({ message: "Category with this slug already exists." });
  }

  const category = await prisma.category.create({
    data: body,
  });

  return reply.status(201).send(category);
}
