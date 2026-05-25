import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      if (!user.isActive) throw new UnauthorizedException('Аккаунт заблокирован');
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES'),
    });

    // Hash refresh token for DB storage
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    await this.prisma.log.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: { role: user.role },
      }
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async refreshSession(oldRefreshToken: string) {
    if (!oldRefreshToken) throw new UnauthorizedException('Refresh token missing');

    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const userTokens = await this.prisma.refreshToken.findMany({
        where: { userId: payload.sub },
      });

      let matchedTokenRecord = null;
      for (const tokenRecord of userTokens) {
        if (await bcrypt.compare(oldRefreshToken, tokenRecord.token)) {
          matchedTokenRecord = tokenRecord;
          break;
        }
      }

      if (!matchedTokenRecord) throw new UnauthorizedException('Invalid refresh token');

      if (matchedTokenRecord.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({ where: { id: matchedTokenRecord.id } });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Token rotation: delete old token, generate new pair
      await this.prisma.refreshToken.delete({ where: { id: matchedTokenRecord.id } });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    
    // We try to find and delete the exact token. Since it's hashed, we fetch all for a user? 
    // To make it simpler, we just delete all refresh tokens for the user, or decode it to find userId.
    try {
      const payload = this.jwtService.decode(refreshToken) as any;
      if (payload && payload.sub) {
        await this.prisma.refreshToken.deleteMany({
          where: { userId: payload.sub },
        });

        await this.prisma.log.create({
          data: {
            userId: payload.sub,
            action: 'LOGOUT',
            details: {},
          }
        });
      }
    } catch (e) {
      // Ignore errors on logout
    }
  }
}
