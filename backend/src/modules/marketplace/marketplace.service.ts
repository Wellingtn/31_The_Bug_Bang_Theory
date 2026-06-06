import prisma from "../../config/database";

export class MarketplaceService {
  async listProducts() {
    return prisma.product.findMany({
      where: { status: { in: ["DISPONIVEL", "EM_NEGOCIACAO"] }, quantity: { gt: 0 } },
      include: { producer: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listResidues() {
    return prisma.residue.findMany({
      where: { status: { in: ["DISPONIVEL", "EM_NEGOCIACAO"] }, quantity: { gt: 0 } },
      include: { producer: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const marketplaceService = new MarketplaceService();
