import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ example: 'retail-cn' })
  tenantCode: string;

  @ApiProperty({ example: 'zhangsan' })
  username: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  password: string;
}

class RegisterDto {
  @ApiProperty({ example: 'retail-cn' })
  tenantCode: string;

  @ApiProperty({ example: 'zhangsan' })
  username: string;

  @ApiProperty({ example: 'zhangsan@example.com' })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  password: string;
}

class RefreshTokenDto {
  @ApiProperty()
  refreshToken: string;
}

@ApiTags('Auth - 认证')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新 Token' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: 'Refresh Token 无效' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto.refreshToken);
  }
}
