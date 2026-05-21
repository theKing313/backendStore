import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { mailService } from "./mail-service.js";
import { tokenService } from "./token-service.js";
import { prisma } from "../prisma.js";

const codes = new Map(); // временно (email → code)
const resetCodes = new Map(); // временно (email → reset code)

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class UserService {
  constructor() {
    this.prisma = prisma;
  }
  // 🟢 Отправка кода для регистрации
  async sendCode(email) {
    const code = generateCode();

    codes.set(email, code);

    console.log("[UserService] sendCode called", { email, code });

    try {
      const result = await mailService.sendCode(email, code);
      console.log("[UserService] mailService.sendCode result", result);
      return result;
    } catch (error) {
      console.error("[UserService] mailService.sendCode error", error);
      throw error;
    }
  }

  // 🟢 Проверка кода + регистрация
  async verifyCode({ email, code, username, password }) {
    if (!email || !code || !username || !password) {
      throw new Error("Email, code, username и password обязательны");
    }

    const savedCode = codes.get(email);

    if (!savedCode || savedCode !== code) {
      throw new Error("Неверный код");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email уже зарегистрирован");
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword,
        isVerified: true, // помечаем пользователя как верифицированного
      },
    });

    codes.delete(email);

    const tokens = tokenService.generateTokens({ ...user });
    await tokenService.saveToken(user.id, tokens.refreshToken);

    return {
      user,
      token: tokens,
      success: true,
      message: "Регистрация прошла успешно",
    };
  }

  async sendResetCode(email) {
    if (!email) {
      throw new Error("Email обязателен");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new Error("Пользователь с таким email не найден");
    }

    const code = generateCode();
    resetCodes.set(email, code);

    const result = await mailService.sendCode(email, code);
    return {
      ...result,
      message: `Код для восстановления пароля отправлен на email: ${email}`,
    };
  }

  async resetPassword({ email }) {
    //, code, password
    try {
      console.log("[UserService] resetPassword called", { email });
      if (!email) {
        //|| !code || !password
        throw new Error("Email, code и новый пароль обязательны");
      }
      const code = generateCode();

      // const savedCode = resetCodes.get(email);
      // if (!savedCode || savedCode !== code) {
      //   throw new Error("Неверный код для сброса пароля");
      // }

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Пользователь с таким email не найден");
      }
      const hashPassword = await bcrypt.hash(code, 3);
      await this.prisma.user.update({
        where: { email },
        data: { password: hashPassword },
      });

      resetCodes.delete(email);
      const result = await mailService.sendCode(email, code);
      return { message: "Пароль успешно обновлён", resend: result };
    } catch (error) {
      console.error("[UserService] resetPassword error", error);
      throw error;
    }
  }

  async registration(username, password, email) {
    if (!username || !password || !email) {
      throw new Error("Username, email and password are required");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword,
        isVerified: true,
      },
    });

    const tokens = tokenService.generateTokens({ ...user });
    await tokenService.saveToken(user.id, tokens.refreshToken);

    return {
      user,
      token: tokens,
      success: true,
      message: "Регистрация прошла успешно",
    };
  }
  async login(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
      throw new Error("Email/username and password are required");
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw new Error("Incorrect password");
    }
    const tokens = tokenService.generateTokens({ ...user });
    await tokenService.saveToken(user.id, tokens.refreshToken);
    return {
      user,
      token: tokens,
      success: true,
      message: "Login successful",
    };
  }
}

export const userService = new UserService();
export default userService;
