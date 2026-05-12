import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
class TokenService {
  constructor() {
    this.prisma = prisma;
  }
  generateTokens(payload) {
    const accessSecret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      "JWT_ACCESS_SECRET";
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      "JWT_REFRESH_SECRET";

    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: "30d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async saveToken(userId, refreshToken) {
    // const tokenData = await tokenModel.findOne({ user: userId });
    console.log("Saving token for user:", userId);
    if (!userId || !refreshToken) {
      throw new Error("User ID and refresh token are required");
    }
    const tokenData = await this.prisma.token.findUnique({
      // тут скорее всего ошибка
      where: { userId },
    });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return this.prisma.token.update({
        where: { userId },
        data: { refreshToken },
      });
    }
    const token = await this.prisma.token.create({
      data: { userId, refreshToken },
    });
    return token;
  }
}
export const tokenService = new TokenService();
