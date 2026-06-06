import prisma from "../../config/database";
import { ItemKind, Role } from "@prisma/client";

interface CreateOrderInput {
  requesterId: string;
  requesterType: Role;
  itemKind: ItemKind;
  itemName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export class OrdersService {
  async create(data: CreateOrderInput) {
    if (data.requesterType !== "CLIENTE" && data.requesterType !== "EMPRESA") {
      throw new Error("Apenas clientes e empresas podem criar pedidos");
    }

    return prisma.order.create({
      data: {
        requesterId: data.requesterId,
        requesterType: data.requesterType,
        itemKind: data.itemKind,
        itemName: data.itemName,
        quantity: data.quantity,
        unit: data.unit,
        notes: data.notes,
      },
      include: { requester: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async listMine(requesterId: string) {
    return prisma.order.findMany({
      where: { requesterId },
      include: {
        assignedProducer: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const ordersService = new OrdersService();
