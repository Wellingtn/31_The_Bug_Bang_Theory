import prisma from "../../config/database";
import bcrypt from "bcrypt";

interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role?: "USER" | "ADMIN";
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "USER" | "ADMIN";
}

const SALT_ROUNDS = 10;

export class UsersService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async create(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, SALT_ROUNDS)
      : null;

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await prisma.user.delete({ where: { id } });

    return { message: "Usuário removido com sucesso" };
  }
}

export const usersService = new UsersService();
