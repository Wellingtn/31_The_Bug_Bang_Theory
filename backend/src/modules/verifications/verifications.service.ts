import prisma from "../../config/database";
import { VerificationStatus } from "@prisma/client";

export class VerificationsService {
  async findByProducer(producerId: string) {
    return prisma.organicVerification.findMany({
      where: { producerId },
      orderBy: { requestedAt: "desc" },
    });
  }

  async request(producerId: string, notes?: string) {
    return prisma.organicVerification.create({
      data: { producerId, notes },
    });
  }

  async findAll() {
    return prisma.organicVerification.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        producer: {
          select: { id: true, name: true, propertyName: true, city: true, state: true },
        },
      },
    });
  }

  async review(id: string, status: VerificationStatus, notes?: string) {
    const verification = await prisma.organicVerification.findUnique({ where: { id } });
    if (!verification) {
      throw new Error("Verificação não encontrada");
    }
    return prisma.organicVerification.update({
      where: { id },
      data: {
        status,
        notes: notes ?? verification.notes,
        reviewedAt: new Date(),
      },
    });
  }
}

export const verificationsService = new VerificationsService();
