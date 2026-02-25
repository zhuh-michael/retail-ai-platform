import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { TenantService } from '../tenant/tenant.service';

interface LoginInput {
  tenantCode: string;
  username: string;
  password: string;
}

interface RegisterInput {
  tenantCode: string;
  username: string;
  email: string;
  password: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    roles: string[];
  };
  tenant: {
    id: string;
    name: string;
    branding: any;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private tenantService: TenantService,
  ) {}

  /**
   * 用户登录
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // 获取租户
    const tenant = await this.tenantService.findOneByCode(input.tenantCode);

    // 检查租户状态
    if (tenant.status !== 'ACTIVE') {
      throw new UnauthorizedException('租户已停用或过期');
    }

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { tenantId: tenant.id, username: input.username },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const passwordValid = await this.passwordService.verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查用户状态
    if (!user.canLogin()) {
      throw new UnauthorizedException('账户已停用');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 生成 Token
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      tenantId: user.tenantId,
      username: user.username,
      roles: user.roles || [],
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
      tenantId: user.tenantId,
      username: user.username,
      roles: user.roles || [],
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 7200, // 2 小时
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        roles: user.roles || [],
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        branding: tenant.branding,
      },
    };
  }

  /**
   * 用户注册
   */
  async register(input: RegisterInput): Promise<{ id: string; requiresVerification: boolean }> {
    // 获取租户
    const tenant = await this.tenantService.findOneByCode(input.tenantCode);

    // 检查租户是否可以创建新用户
    const canCreate = await this.tenantService.checkQuota(tenant.id, 'users');
    if (!canCreate) {
      throw new ConflictException('租户用户数已达上限');
    }

    // 验证密码强度
    const passwordValidation = this.passwordService.validatePasswordStrength(
      input.password,
    );
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors);
    }

    // 检查用户名是否已存在
    const existing = await this.userRepository.findOne({
      where: { tenantId: tenant.id, username: input.username },
    });

    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 哈希密码
    const { hash, salt } = await this.passwordService.hashPassword(input.password);

    // 创建用户
    const user = this.userRepository.create({
      tenantId: tenant.id,
      username: input.username,
      email: input.email,
      passwordHash: hash,
      passwordSalt: salt,
      status: UserStatus.ACTIVE,
      roles: ['user'], // 默认角色
    });

    // 验证
    user.validate();

    const saved = await this.userRepository.save(user);

    return {
      id: saved.id,
      requiresVerification: !!input.email, // 有邮箱需要验证
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const tokens = this.tokenService.refreshToken(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 7200,
    };
  }
}
