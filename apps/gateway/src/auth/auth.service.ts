// Created automatically by Cursor AI (2024-12-19)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    // TODO: Implement actual user validation against database
    // For now, using a mock user for development
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      role: 'owner',
    };

    // TODO: Replace with actual password validation
    if (loginDto.email !== mockUser.email || loginDto.password !== 'password123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: mockUser.id,
      email: mockUser.email,
      orgId: mockUser.orgId,
      role: mockUser.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        orgId: payload.orgId,
        role: payload.role,
      };

      const accessToken = await this.jwtService.signAsync(newPayload);

      return {
        accessToken,
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(user: any) {
    // TODO: Fetch user from database
    return {
      id: user.sub,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    };
  }

  async logout(user: any) {
    // TODO: Implement token blacklisting
    return {
      message: 'Logged out successfully',
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Implement actual user validation
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'admin@demo.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Demo Admin',
      orgId: '550e8400-e29b-41d4-a716-446655440000',
      role: 'owner',
    };

    if (email === mockUser.email) {
      const isPasswordValid = await bcrypt.compare(password, mockUser.password);
      if (isPasswordValid) {
        const { password, ...result } = mockUser;
        return result;
      }
    }
    return null;
  }
}
