import prisma from "../../config/database";

interface CreateOrganicProductInput {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
}

export class OrganicProductsService {
  async findByProducer(producerId: string) {
    return prisma.organicProduct.findMany({
      where: { producerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(producerId: string, data: CreateOrganicProductInput) {
    return prisma.organicProduct.create({
      data: {
        producerId,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
      },
    });
  }

  async deleteOwn(producerId: string, id: string) {
    const product = await prisma.organicProduct.findUnique({ where: { id } });
    if (!product || product.producerId !== producerId) {
      throw new Error("Produto não encontrado");
    }
    await prisma.organicProduct.delete({ where: { id } });
    return { message: "Produto removido com sucesso" };
  }

  async findAll() {
    return prisma.organicProduct.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        producer: {
          select: { id: true, name: true, propertyName: true, city: true, state: true },
        },
      },
    });
  }
}

export const organicProductsService = new OrganicProductsService();
