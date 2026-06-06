import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "../../config/database";
import { config } from "../../config/env";
import { Provider, Role } from "@prisma/client";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

interface OAuthUserData {
  email: string;
  name: string;
  provider: Provider;
}

const SALT_ROUNDS = 10;

function isRole(value: string): value is Role {
  return ["ADMIN", "PRODUTOR", "CLIENTE", "EMPRESA"].includes(value);
}

export class AuthService {
  private generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  private async createProfileForRole(userId: string, role: Role, name: string) {
    if (role === "PRODUTOR") {
      await prisma.producer.create({ data: { userId, farmName: name } });
    }

    if (role === "CLIENTE") {
      await prisma.client.create({ data: { userId } });
    }

    if (role === "EMPRESA") {
      await prisma.company.create({ data: { userId, companyName: name } });
    }
  }

  async register(data: RegisterInput) {
    if (!isRole(data.role)) {
      throw new Error("Tipo de usuário inválido");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          provider: "LOCAL",
          role: data.role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (data.role === "PRODUTOR") {
        await tx.producer.create({ data: { userId: createdUser.id, farmName: data.name } });
      }

      if (data.role === "CLIENTE") {
        await tx.client.create({ data: { userId: createdUser.id } });
      }

      if (data.role === "EMPRESA") {
        await tx.company.create({ data: { userId: createdUser.id, companyName: data.name } });
      }

      return createdUser;
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new Error("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async findOrCreateOAuthUser(data: OAuthUserData) {
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          provider: data.provider,
          role: "CLIENTE",
        },
      });

      await this.createProfileForRole(user.id, "CLIENTE", user.name);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  getGoogleAuthUrl(): string {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: config.google.callbackUrl,
      client_id: config.google.clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleGoogleCallback(code: string) {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl,
        grant_type: "authorization_code",
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { email, name } = userResponse.data;

    return this.findOrCreateOAuthUser({
      email,
      name,
      provider: "GOOGLE",
    });
  }

  getGitHubAuthUrl(): string {
    const rootUrl = "https://github.com/login/oauth/authorize";
    const options = {
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: "user:email read:user",
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleGitHubCallback(code: string) {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const emailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const primaryEmail = emailsResponse.data.find(
      (emailInfo: { primary: boolean; email: string }) => emailInfo.primary
    )?.email;

    const email = primaryEmail || userResponse.data.email;
    const name = userResponse.data.name || userResponse.data.login;

    return this.findOrCreateOAuthUser({
      email,
      name,
      provider: "GITHUB",
    });
  }
}

export const authService = new AuthService();
