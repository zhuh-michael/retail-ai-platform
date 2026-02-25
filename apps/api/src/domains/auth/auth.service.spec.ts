import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { TenantService } from '../tenant/tenant.service';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let passwordService: any;
  let tokenService: any;
  let tenantService: any;

  const mockUser: Partial<User> = {
    id: 'test-user-uuid',
    tenantId: 'test-tenant-uuid',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    passwordSalt: 'salt',
    status: UserStatus.ACTIVE,
    roles: ['user'],
  };

  const mockTenant = {
    id: 'test-tenant-uuid',
    name: 'Test Tenant',
    code: 'test-tenant',
    status: 'ACTIVE',
    branding: {},
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      validatePasswordStrength: jest.fn(),
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    tenantService = {
      findOneByCode: jest.fn(),
      checkQuota: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: TenantService,
          useValue: tenantService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('应该定义', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      userRepository.findOne.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(true);
      tokenService.generateAccessToken.mockReturnValue('access-token');
      tokenService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await service.login({
        tenantCode: 'test-tenant',
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('testuser');
    });

    it('应该拒绝不存在的租户', async () => {
      tenantService.findOneByCode.mockResolvedValue(null);

      await expect(
        service.login({
          tenantCode: 'non-existent',
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该拒绝错误的密码', async () => {
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      userRepository.findOne.mockResolvedValue(mockUser);
      passwordService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login({
          tenantCode: 'test-tenant',
          username: 'testuser',
          password: 'wrong-password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('应该拒绝停用的用户', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      userRepository.findOne.mockResolvedValue(suspendedUser);

      await expect(
        service.login({
          tenantCode: 'test-tenant',
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('应该成功注册', async () => {
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      tenantService.checkQuota.mockResolvedValue(true);
      passwordService.validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
      userRepository.findOne.mockResolvedValue(null);
      passwordService.hashPassword.mockResolvedValue({ hash: 'hash', salt: 'salt' });
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.register({
        tenantCode: 'test-tenant',
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecureP@ss123',
      });

      expect(result).toHaveProperty('id');
      expect(result.requiresVerification).toBe(true);
    });

    it('应该拒绝弱密码', async () => {
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      passwordService.validatePasswordStrength.mockReturnValue({
        valid: false,
        errors: ['密码至少 8 个字符', '必须包含大写字母'],
      });

      await expect(
        service.register({
          tenantCode: 'test-tenant',
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'weak',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('应该拒绝已存在的用户名', async () => {
      tenantService.findOneByCode.mockResolvedValue(mockTenant);
      passwordService.validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          tenantCode: 'test-tenant',
          username: 'testuser',
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('应该刷新 Token', async () => {
      tokenService.refreshToken.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await service.refreshToken('old-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('应该拒绝无效的 Refresh Token', async () => {
      tokenService.refreshToken.mockImplementation(() => {
        throw new UnauthorizedException('Token 无效或已过期');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
