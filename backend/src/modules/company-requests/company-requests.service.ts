import prisma from "../../config/database";
import { CompanyRequestStatus } from "@prisma/client";

interface CreateCompanyRequestInput {
  companyName: string;
  cnpj: string;
  responsibleName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country?: string;
  desiredMaterial: string;
  monthlyQuantity: string;
  purchaseFrequency: string;
  notes?: string;
}

export class CompanyRequestsService {
  async create(data: CreateCompanyRequestInput) {
    return prisma.companyRequest.create({ data });
  }

  async findAll() {
    return prisma.companyRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: CompanyRequestStatus) {
    const request = await prisma.companyRequest.findUnique({ where: { id } });
    if (!request) {
      throw new Error("Solicitação não encontrada");
    }
    return prisma.companyRequest.update({
      where: { id },
      data: { status },
    });
  }
}

export const companyRequestsService = new CompanyRequestsService();
