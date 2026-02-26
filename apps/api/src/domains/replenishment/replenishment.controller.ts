import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { ReplenishmentService } from './replenishment.service';
import { ReplenishmentPlan, PlanStatus } from './entities/replenishment.entity';

class GeneratePlanDto {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ example: '7d', enum: ['7d', '14d', '30d'] })
  period: string;

  @ApiProperty()
  items: Array<{
    skuId: string;
    productName: string;
    currentStock: number;
    historicalSales: number[];
    leadTimeDays: number;
  }>;
}

class AdjustQuantityDto {
  @ApiProperty()
  quantity: number;

  @ApiProperty({ required: false })
  reason?: string;
}

@ApiTags('Replenishments - 智能补货')
@Controller('api/v1/replenishments')
export class ReplenishmentController {
  constructor(private readonly replenishmentService: ReplenishmentService) {}

  @Post()
  @ApiOperation({ summary: '生成补货计划' })
  async generate(@Body() dto: GeneratePlanDto): Promise<ReplenishmentPlan> {
    return await this.replenishmentService.generatePlan(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取补货计划详情' })
  async findOne(@Param('id') id: string): Promise<ReplenishmentPlan> {
    return await this.replenishmentService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: '获取补货计划列表' })
  async findByStore(
    @Query('storeId') storeId: string,
    @Query('status') status?: PlanStatus,
  ): Promise<ReplenishmentPlan[]> {
    return await this.replenishmentService.findByStore(storeId, status);
  }

  @Put(':planId/items/:itemId/adjust')
  @ApiOperation({ summary: '调整补货量' })
  async adjust(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AdjustQuantityDto,
  ) {
    return await this.replenishmentService.adjustQuantity(
      itemId,
      dto.quantity,
      dto.reason || '',
    );
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认补货计划' })
  async confirm(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<ReplenishmentPlan> {
    return await this.replenishmentService.confirmPlan(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消补货计划' })
  async cancel(@Param('id') id: string): Promise<ReplenishmentPlan> {
    return await this.replenishmentService.cancelPlan(id);
  }
}
