import prisma from "../../config/database";
import { ItemKind } from "@prisma/client";

export class AdminService {
  async listOrders() {
    return prisma.order.findMany({
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        assignedProducer: { include: { user: { select: { id: true, name: true, email: true } } } },
        assignedProduct: true,
        assignedResidue: true,
        solicitations: {
          include: {
            producer: { include: { user: { select: { id: true, name: true, email: true } } } },
            product: true,
            residue: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMatches(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    const baseWhere = {
      quantity: { gte: order.quantity },
      status: "DISPONIVEL" as const,
      name: { contains: order.itemName, mode: "insensitive" as const },
    };

    if (order.itemKind === "PRODUTO") {
      const products = await prisma.product.findMany({
        where: baseWhere,
        include: { producer: { include: { user: { select: { id: true, name: true, email: true } } } } },
        orderBy: { price: "asc" },
      });

      return products.map((product) => ({
        listingId: product.id,
        itemKind: "PRODUTO" as ItemKind,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price,
        producerId: product.producerId,
        producerName: product.producer.user.name,
        producerEmail: product.producer.user.email,
      }));
    }

    const residues = await prisma.residue.findMany({
      where: baseWhere,
      include: { producer: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { price: "asc" },
    });

    return residues.map((residue) => ({
      listingId: residue.id,
      itemKind: "RESIDUO" as ItemKind,
      name: residue.name,
      category: residue.category,
      quantity: residue.quantity,
      unit: residue.unit,
      price: residue.price,
      producerId: residue.producerId,
      producerName: residue.producer.user.name,
      producerEmail: residue.producer.user.email,
    }));
  }

  async sendSolicitation(orderId: string, producerId: string, itemKind: ItemKind, listingId: string, message?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.status !== "PENDENTE") {
      throw new Error("Somente pedidos pendentes podem receber solicitação");
    }

    if (itemKind !== order.itemKind) {
      throw new Error("O tipo do item selecionado não corresponde ao pedido");
    }

    const data = {
      orderId,
      producerId,
      quantity: order.quantity,
      message,
      productId: itemKind === "PRODUTO" ? listingId : undefined,
      residueId: itemKind === "RESIDUO" ? listingId : undefined,
    };

    if (itemKind === "PRODUTO") {
      const product = await prisma.product.findFirst({
        where: { id: listingId, producerId, quantity: { gte: order.quantity }, status: "DISPONIVEL" },
      });

      if (!product) {
        throw new Error("Produto indisponível ou com estoque insuficiente");
      }
    }

    if (itemKind === "RESIDUO") {
      const residue = await prisma.residue.findFirst({
        where: { id: listingId, producerId, quantity: { gte: order.quantity }, status: "DISPONIVEL" },
      });

      if (!residue) {
        throw new Error("Resíduo indisponível ou com estoque insuficiente");
      }
    }

    return prisma.solicitation.create({
      data,
      include: {
        producer: { include: { user: { select: { id: true, name: true, email: true } } } },
        order: true,
        product: true,
        residue: true,
      },
    });
  }

  async completeOrder(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.status !== "PROCESSANDO") {
      throw new Error("Somente pedidos em processamento podem ser concluídos");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: "CONCLUIDO" },
      include: { requester: { select: { id: true, name: true, email: true, role: true } } },
    });
  }
}

export const adminService = new AdminService();
