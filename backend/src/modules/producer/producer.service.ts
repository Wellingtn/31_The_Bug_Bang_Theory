import prisma from "../../config/database";

interface ListingInput {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
}

export class ProducerService {
  private async getProducerByUserId(userId: string) {
    const producer = await prisma.producer.findUnique({ where: { userId } });

    if (!producer) {
      throw new Error("Perfil de produtor não encontrado");
    }

    return producer;
  }

  async listProducts(userId: string) {
    const producer = await this.getProducerByUserId(userId);
    return prisma.product.findMany({
      where: { producerId: producer.id },
      orderBy: { createdAt: "desc" },
    });
  }

  async createProduct(userId: string, data: ListingInput) {
    const producer = await this.getProducerByUserId(userId);
    return prisma.product.create({
      data: {
        producerId: producer.id,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
      },
    });
  }

  async listResidues(userId: string) {
    const producer = await this.getProducerByUserId(userId);
    return prisma.residue.findMany({
      where: { producerId: producer.id },
      orderBy: { createdAt: "desc" },
    });
  }

  async createResidue(userId: string, data: ListingInput) {
    const producer = await this.getProducerByUserId(userId);
    return prisma.residue.create({
      data: {
        producerId: producer.id,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
      },
    });
  }

  async listSolicitations(userId: string) {
    const producer = await this.getProducerByUserId(userId);
    return prisma.solicitation.findMany({
      where: { producerId: producer.id },
      include: {
        order: { include: { requester: { select: { id: true, name: true, email: true, role: true } } } },
        product: true,
        residue: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async respondSolicitation(userId: string, solicitationId: string, status: "ACEITA" | "RECUSADA", responseMessage?: string) {
    const producer = await this.getProducerByUserId(userId);

    const solicitation = await prisma.solicitation.findFirst({
      where: { id: solicitationId, producerId: producer.id },
      include: { order: true, product: true, residue: true },
    });

    if (!solicitation) {
      throw new Error("Solicitação não encontrada");
    }

    if (solicitation.status !== "ENVIADA") {
      throw new Error("Esta solicitação já foi respondida");
    }

    if (status === "RECUSADA") {
      return prisma.solicitation.update({
        where: { id: solicitationId },
        data: { status: "RECUSADA", responseMessage },
      });
    }

    return prisma.$transaction(async (tx) => {
      if (solicitation.productId) {
        const product = await tx.product.findUnique({ where: { id: solicitation.productId } });
        if (!product || product.quantity < solicitation.quantity) {
          throw new Error("Estoque insuficiente para aceitar a solicitação");
        }

        const nextQuantity = product.quantity - solicitation.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            quantity: nextQuantity,
            status: nextQuantity <= 0 ? "VENDIDO" : "EM_NEGOCIACAO",
          },
        });
      }

      if (solicitation.residueId) {
        const residue = await tx.residue.findUnique({ where: { id: solicitation.residueId } });
        if (!residue || residue.quantity < solicitation.quantity) {
          throw new Error("Estoque insuficiente para aceitar a solicitação");
        }

        const nextQuantity = residue.quantity - solicitation.quantity;
        await tx.residue.update({
          where: { id: residue.id },
          data: {
            quantity: nextQuantity,
            status: nextQuantity <= 0 ? "VENDIDO" : "EM_NEGOCIACAO",
          },
        });
      }

      const updatedSolicitation = await tx.solicitation.update({
        where: { id: solicitationId },
        data: { status: "ACEITA", responseMessage },
      });

      await tx.order.update({
        where: { id: solicitation.orderId },
        data: {
          status: "PROCESSANDO",
          assignedProducerId: producer.id,
          assignedProductId: solicitation.productId,
          assignedResidueId: solicitation.residueId,
        },
      });

      await tx.solicitation.updateMany({
        where: { orderId: solicitation.orderId, id: { not: solicitationId }, status: "ENVIADA" },
        data: { status: "RECUSADA", responseMessage: "Outro produtor aceitou esta demanda." },
      });

      return updatedSolicitation;
    });
  }
}

export const producerService = new ProducerService();
