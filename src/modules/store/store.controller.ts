import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../utils/prisma";
import {
  CreateStoreInput,
  UpdateStoreSetupInput,
  PublishTemplateInput,
  UpdateThemeConfigInput,
} from "./store.schema";

export async function createStoreHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;
  const { name, slug, description, currency, templateId, templateSlug, categoryId, categoryName } = request.body as CreateStoreInput;

  // Check if store slug is unique
  const existingStore = await prisma.store.findUnique({
    where: { slug },
  });

  if (existingStore) {
    return reply.status(400).send({
      message: "Store URL/slug is already taken. Please choose another one.",
    });
  }

  let assignedTemplateId = templateId;
  if (!assignedTemplateId && templateSlug) {
    const tmpl = await prisma.template.findUnique({ where: { slug: templateSlug } });
    if (tmpl) assignedTemplateId = tmpl.id;
  }

  let assignedCategoryId = categoryId;
  if (!assignedCategoryId && categoryName) {
    const cat = await prisma.category.findFirst({
      where: {
        OR: [{ name: categoryName }, { slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }],
      },
    });
    if (cat) assignedCategoryId = cat.id;
  }

  const store = await prisma.store.create({
    data: {
      name,
      slug,
      description,
      currency: currency || "USD",
      ownerId: currentUser.id,
      templateId: assignedTemplateId,
      activeTemplateSlug: templateSlug || "nova-tech",
      categoryId: assignedCategoryId,
    },
    include: {
      template: true,
      category: true,
    },
  });

  return reply.status(201).send(store);
}

export async function getMerchantStoresHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;

  const stores = await prisma.store.findMany({
    where: { ownerId: currentUser.id },
    orderBy: { createdAt: "desc" },
  });

  return reply.status(200).send(stores);
}

export async function getStoreSetupHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;

  let store = await prisma.store.findFirst({
    where: { ownerId: currentUser.id },
    orderBy: { createdAt: "asc" },
  });

  if (!store) {
    // If no store exists for user yet, create a default store for the merchant
    const defaultSlug = `store-${currentUser.id.substring(0, 8)}`;
    store = await prisma.store.create({
      data: {
        name: `${currentUser.name || "Merchant"}'s Store`,
        slug: defaultSlug,
        description: "Official online storefront",
        ownerId: currentUser.id,
        contactEmail: currentUser.email,
      },
    });
  }

  return reply.status(200).send(store);
}

export async function updateStoreSetupHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;
  const updateData = request.body as UpdateStoreSetupInput;

  let store = await prisma.store.findFirst({
    where: { ownerId: currentUser.id },
  });

  if (!store) {
    const slug = updateData.slug || `store-${Date.now()}`;
    store = await prisma.store.create({
      data: {
        name: updateData.name || "My Store",
        slug,
        ownerId: currentUser.id,
        ...updateData,
      },
    });
    return reply.status(200).send(store);
  }

  if (updateData.slug && updateData.slug !== store.slug) {
    const existingSlug = await prisma.store.findUnique({
      where: { slug: updateData.slug },
    });
    if (existingSlug && existingSlug.id !== store.id) {
      return reply.status(400).send({ message: "Store slug is already taken." });
    }
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: {
      ...updateData,
    },
  });

  return reply.status(200).send(updatedStore);
}

export async function getStoreThemeHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;

  let store = await prisma.store.findFirst({
    where: { ownerId: currentUser.id },
  });

  if (!store) {
    const defaultSlug = `store-${currentUser.id.substring(0, 8)}`;
    store = await prisma.store.create({
      data: {
        name: `${currentUser.name || "Merchant"}'s Store`,
        slug: defaultSlug,
        ownerId: currentUser.id,
      },
    });
  }

  return reply.status(200).send(store);
}

export async function updateStoreThemeHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;
  const themeData = request.body as UpdateThemeConfigInput;

  let store = await prisma.store.findFirst({
    where: { ownerId: currentUser.id },
  });

  if (!store) {
    const defaultSlug = `store-${currentUser.id.substring(0, 8)}`;
    store = await prisma.store.create({
      data: {
        name: `${currentUser.name || "Merchant"}'s Store`,
        slug: defaultSlug,
        ownerId: currentUser.id,
        ...themeData,
      },
    });
    return reply.status(200).send(store);
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: {
      ...themeData,
    },
  });

  return reply.status(200).send(updatedStore);
}

export async function publishTemplateHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const currentUser = request.user;
  const { templateSlug } = request.body as PublishTemplateInput;

  let store = await prisma.store.findFirst({
    where: { ownerId: currentUser.id },
  });

  if (!store) {
    const defaultSlug = `store-${currentUser.id.substring(0, 8)}`;
    store = await prisma.store.create({
      data: {
        name: `${currentUser.name || "Merchant"}'s Store`,
        slug: defaultSlug,
        ownerId: currentUser.id,
        activeTemplateSlug: templateSlug,
      },
    });
    return reply.status(200).send(store);
  }

  // Link template if template exists
  const tmpl = await prisma.template.findUnique({
    where: { slug: templateSlug },
  });

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: {
      activeTemplateSlug: templateSlug,
      templateId: tmpl ? tmpl.id : store.templateId,
    },
  });

  return reply.status(200).send(updatedStore);
}

export async function getStoreByIdOrSlugHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { idOrSlug } = request.params as { idOrSlug: string };

  const store = await prisma.store.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!store) {
    return reply.status(404).send({ message: "Store not found." });
  }

  return reply.status(200).send(store);
}


