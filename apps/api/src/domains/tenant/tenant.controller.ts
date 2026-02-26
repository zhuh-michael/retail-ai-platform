import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { Tenant, PlanType } from './entities/tenant.entity';

class CreateTenantDto {
  @ApiProperty({ example: 'XX 零售企业', minLength: 2, maxLength: 100 })
  name: string;

  @ApiProperty({ example: 'retail-cn', minLength: 2 })
  code: string;

  @ApiProperty()
  contactInfo: {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    legalPerson: string;
  };

  @ApiProperty()
  subscription: {
    plan: PlanType;
    startDate: Date;
    endDate: Date;
    autoRenew?: boolean;
  };

  @ApiProperty({ required: false })
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
  };
}

@ApiTags('Tenants - 租户管理')
@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: '创建新租户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '租户编码已存在' })
  async create(@Body() dto: CreateTenantDto): Promise<Tenant> {
    return await this.tenantService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取租户详情' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return await this.tenantService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新租户信息' })
  async update(
    @Param('id') id: string,
    @Body() updates: Partial<Tenant>,
  ): Promise<Tenant> {
    return await this.tenantService.update(id, updates);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '停用租户' })
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<void> {
    await this.tenantService.suspend(id, reason);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: '续订订阅' })
  async renew(
    @Param('id') id: string,
    @Body('plan') plan: PlanType,
    @Body('endDate') endDate: Date,
  ): Promise<Tenant> {
    return await this.tenantService.renewSubscription(id, plan, endDate);
  }
}
