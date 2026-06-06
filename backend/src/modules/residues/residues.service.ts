import prisma from "../../config/database";
import { ResidueStatus } from "@prisma/client";

interface CreateResidueInput {
  type: string;
  quantity: number;
  unit: string;
  description?: string;
}

export class ResiduesService {
  // Resíduos do próprio produtor (escopado por producerId)
  async findByProducer(producerId: string) {
    return prisma.residue.findMany({
      where: { producerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(producerId: string, data: CreateResidueInput) {
    return prisma.residue.create({
      data: {
        producerId,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        description: data.description,
      },
    });
  }

  async deleteOwn(producerId: string, id: string) {
    const residue = await prisma.residue.findUnique({ where: { id } });
    if (!residue || residue.producerId !== producerId) {
      throw new Error("Resíduo não encontrado");
    }
    await prisma.residue.delete({ where: { id } });
    return { message: "Resíduo removido com sucesso" };
  }

  // Admin: todos os resíduos com dados do produtor
  async findAll() {
    return prisma.residue.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        producer: {
          select: { id: true, name: true, propertyName: true, city: true, state: true },
        },
      },
    });
  }

  async updateStatus(id: string, status: ResidueStatus) {
    const residue = await prisma.residue.findUnique({ where: { id } });
    if (!residue) {
      throw new Error("Resíduo não encontrado");
    }
    return prisma.residue.update({
      where: { id },
      data: { status },
    });
  }
}

export const residuesService = new ResiduesService();
