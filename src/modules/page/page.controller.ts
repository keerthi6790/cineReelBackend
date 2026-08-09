import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { CreatePageInput, UpdatePageInput } from "./page.schema";

const DEFAULT_PAGES = [
  {
    title: "Home",
    slug: "/",
    content: "<h1>Welcome to OmniStore</h1><p>Discover our curated collection of premium goods.</p>",
    pageType: "SYSTEM",
    metaTitle: "OmniStore | Official Flagship Online Store",
    metaDescription: "Shop high quality products with express shipping and secure checkout.",
    status: "PUBLISHED",
  },
  {
    title: "Products Catalog",
    slug: "/products",
    content: "<h1>Product Catalog</h1><p>Browse all available products with filters and search.</p>",
    pageType: "SYSTEM",
    metaTitle: "All Products | OmniStore",
    metaDescription: "Browse our complete catalog of electronics, apparel, and home decor.",
    status: "PUBLISHED",
  },
  {
    title: "Collections",
    slug: "/collections",
    content: "<h1>Featured Collections</h1><p>Explore curated product groupings.</p>",
    pageType: "SYSTEM",
    metaTitle: "Product Collections | OmniStore",
    metaDescription: "Explore curated collections designed for modern lifestyle.",
    status: "PUBLISHED",
  },
  {
    title: "Product Details Showcase",
    slug: "/product/[id]",
    content: "<h1>Product Details</h1><p>High-resolution gallery, specifications, and customer reviews.</p>",
    pageType: "SYSTEM",
    metaTitle: "Product Specs & Reviews | OmniStore",
    metaDescription: "Detailed product specifications and buyer reviews.",
    status: "PUBLISHED",
  },
  {
    title: "Shopping Cart",
    slug: "/cart",
    content: "<h1>Your Shopping Cart</h1><p>Review items before checking out.</p>",
    pageType: "SYSTEM",
    metaTitle: "Shopping Cart | OmniStore",
    metaDescription: "View items in your shopping bag and proceed to checkout.",
    status: "PUBLISHED",
  },
  {
    title: "Checkout",
    slug: "/checkout",
    content: "<h1>Secure Checkout</h1><p>Enter shipping details and payment information.</p>",
    pageType: "SYSTEM",
    metaTitle: "Checkout | OmniStore",
    metaDescription: "Complete your order with end-to-end SSL encryption.",
    status: "PUBLISHED",
  },
  {
    title: "Page Not Found (404)",
    slug: "/404",
    content: "<h1>404 - Page Not Found</h1><p>The requested page could not be located.</p>",
    pageType: "SYSTEM",
    metaTitle: "404 Page Not Found | OmniStore",
    metaDescription: "The page you are looking for has been moved or removed.",
    status: "PUBLISHED",
  },
  {
    title: "About Us",
    slug: "/pages/about",
    content: "<h2>Our Brand Story</h2><p>OmniStore was founded with a mission to deliver sustainable, premium quality merchandise directly to customers worldwide.</p>",
    pageType: "BRAND",
    metaTitle: "About Us & Our Mission | OmniStore",
    metaDescription: "Learn about the mission, values, and craft behind OmniStore.",
    status: "PUBLISHED",
  },
  {
    title: "Contact Us",
    slug: "/pages/contact",
    content: "<h2>Get in Touch</h2><p>Email our support team at support@omnistore.com or call +1 (555) 019-2834.</p>",
    pageType: "BRAND",
    metaTitle: "Contact Support | OmniStore",
    metaDescription: "Contact customer support for inquiries, orders, and returns.",
    status: "PUBLISHED",
  },
  {
    title: "Frequently Asked Questions (FAQ)",
    slug: "/pages/faq",
    content: "<h2>Frequently Asked Questions</h2><p>Find quick answers to common questions regarding shipping, returns, and order tracking.</p>",
    pageType: "BRAND",
    metaTitle: "FAQ & Help Center | OmniStore",
    metaDescription: "Get fast answers regarding shipping times, returns, and payments.",
    status: "PUBLISHED",
  },
  {
    title: "Privacy Policy",
    slug: "/policies/privacy-policy",
    content: "<h2>Privacy Policy</h2><p>We respect your privacy and protect personal information collected during store visits.</p>",
    pageType: "POLICY",
    metaTitle: "Privacy Policy | OmniStore",
    metaDescription: "Official data privacy policy and cookie usage guidelines.",
    status: "PUBLISHED",
  },
  {
    title: "Terms & Conditions",
    slug: "/policies/terms-and-conditions",
    content: "<h2>Terms of Service</h2><p>By using this website, you agree to abide by our terms and conditions.</p>",
    pageType: "POLICY",
    metaTitle: "Terms & Conditions | OmniStore",
    metaDescription: "Terms of service and store rules for customers.",
    status: "PUBLISHED",
  },
  {
    title: "Shipping Policy",
    slug: "/policies/shipping-policy",
    content: "<h2>Shipping & Delivery Policy</h2><p>Orders are dispatched within 24-48 business hours with tracking numbers provided.</p>",
    pageType: "POLICY",
    metaTitle: "Shipping & Delivery Information | OmniStore",
    metaDescription: "Delivery timelines, international rates, and order fulfillment policies.",
    status: "PUBLISHED",
  },
  {
    title: "Refund Policy",
    slug: "/policies/refund-policy",
    content: "<h2>Return & Refund Policy</h2><p>We offer a 30-day money back guarantee on all unused products in original packaging.</p>",
    pageType: "POLICY",
    metaTitle: "Returns & Refund Policy | OmniStore",
    metaDescription: "30-day return policy and money-back guarantee terms.",
    status: "PUBLISHED",
  },
  {
    title: "Summer Lookbook 2026",
    slug: "/pages/summer-lookbook-2026",
    content: "<h2>Exclusive Summer Lookbook</h2><p>Explore our seasonal apparel arrivals designed for warm weather elegance.</p>",
    pageType: "CUSTOM",
    metaTitle: "Summer 2026 Apparel Lookbook | OmniStore",
    metaDescription: "Discover seasonal apparel drops and limited collection outfits.",
    status: "PUBLISHED",
  },
];

export async function getPagesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (pages.length === 0) {
    for (const pg of DEFAULT_PAGES) {
      await prisma.page.create({ data: pg });
    }
    pages = await prisma.page.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return reply.status(200).send(pages);
}

export async function createPageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CreatePageInput;

  const existing = await prisma.page.findUnique({
    where: { slug: body.slug },
  });

  if (existing) {
    return reply.status(400).send({ message: "A page with this URL slug already exists." });
  }

  const page = await prisma.page.create({
    data: {
      ...body,
      pageType: body.pageType || "CUSTOM",
    },
  });

  return reply.status(201).send(page);
}

export async function updatePageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const body = request.body as UpdatePageInput;

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) {
    return reply.status(404).send({ message: "Page not found." });
  }

  if (body.slug && body.slug !== page.slug) {
    const existingSlug = await prisma.page.findUnique({ where: { slug: body.slug } });
    if (existingSlug && existingSlug.id !== id) {
      return reply.status(400).send({ message: "Slug is already taken by another page." });
    }
  }

  const updatedPage = await prisma.page.update({
    where: { id },
    data: body,
  });

  return reply.status(200).send(updatedPage);
}

export async function deletePageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) {
    return reply.status(404).send({ message: "Page not found." });
  }

  await prisma.page.delete({ where: { id } });
  return reply.status(200).send({ message: "Page deleted successfully." });
}

export async function getPageBySlugHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { slug } = request.params as { slug: string };

  const page = await prisma.page.findFirst({
    where: {
      OR: [{ id: slug }, { slug: slug }, { slug: `/${slug}` }, { slug: `/pages/${slug}` }],
    },
  });

  if (!page) {
    return reply.status(404).send({ message: "Page not found." });
  }

  return reply.status(200).send(page);
}
