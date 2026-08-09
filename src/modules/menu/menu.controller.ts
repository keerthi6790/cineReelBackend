import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import { CreateMenuInput, UpdateMenuInput } from "./menu.schema";

const DEFAULT_MENUS = [
  {
    title: "Header Navigation Menu",
    handle: "header-menu",
    location: "HEADER",
    itemsJson: JSON.stringify([
      { id: "item-1", label: "Home", url: "/", target: "_self" },
      {
        id: "item-2",
        label: "Shop",
        url: "/products",
        target: "_self",
        isMegaMenu: true,
        megaMenuConfig: {
          bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
          headline: "New Summer Drop 2026",
          buttonLabel: "Shop All Apparel",
          buttonUrl: "/collections/summer-essentials",
        },
        children: [
          { id: "item-2-1", label: "Men", url: "/collections/men", target: "_self" },
          { id: "item-2-2", label: "Women", url: "/collections/women", target: "_self" },
          { id: "item-2-3", label: "Kids", url: "/collections/kids", target: "_self" },
        ],
      },
      { id: "item-3", label: "About", url: "/pages/about", target: "_self" },
      { id: "item-4", label: "Contact", url: "/pages/contact", target: "_self" },
    ]),
  },
  {
    title: "Footer Quick Links Menu",
    handle: "footer-menu",
    location: "FOOTER",
    itemsJson: JSON.stringify([
      { id: "f-item-1", label: "About Us", url: "/pages/about", target: "_self" },
      { id: "f-item-2", label: "Customer Support", url: "/pages/contact", target: "_self" },
      { id: "f-item-3", label: "FAQ", url: "/pages/faq", target: "_self" },
      { id: "f-item-4", label: "Privacy Policy", url: "/policies/privacy-policy", target: "_self" },
      { id: "f-item-5", label: "Terms & Conditions", url: "/policies/terms-and-conditions", target: "_self" },
      { id: "f-item-6", label: "Shipping Policy", url: "/policies/shipping-policy", target: "_self" },
      { id: "f-item-7", label: "Refund Policy", url: "/policies/refund-policy", target: "_self" },
    ]),
  },
];

export async function getMenusHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let menus = await prisma.menu.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (menus.length === 0) {
    for (const m of DEFAULT_MENUS) {
      await prisma.menu.create({ data: m });
    }
    menus = await prisma.menu.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return reply.status(200).send(menus);
}

export async function createMenuHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as CreateMenuInput;

  const existing = await prisma.menu.findUnique({
    where: { handle: body.handle },
  });

  if (existing) {
    return reply.status(400).send({ message: "A menu with this handle already exists." });
  }

  const menu = await prisma.menu.create({
    data: {
      ...body,
      location: body.location || "HEADER",
    },
  });

  return reply.status(201).send(menu);
}

export async function updateMenuHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const body = request.body as UpdateMenuInput;

  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) {
    return reply.status(404).send({ message: "Menu not found." });
  }

  const updated = await prisma.menu.update({
    where: { id },
    data: body,
  });

  return reply.status(200).send(updated);
}

export async function deleteMenuHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) {
    return reply.status(404).send({ message: "Menu not found." });
  }

  await prisma.menu.delete({ where: { id } });
  return reply.status(200).send({ message: "Menu deleted successfully." });
}
