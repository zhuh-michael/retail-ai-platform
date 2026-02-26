import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

class GenerateMatchesDto {
  @ApiProperty({ description: '基础商品 SKU' })
  baseProductId: string;

  @ApiProperty({ description: '风格偏好', required: false })
  stylePreferences?: string[];

  @ApiProperty({ description: '场合', required: false })
  occasion?: string;
}

@ApiTags('Products - 商品管理')
@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':skuCode')
  @ApiOperation({ summary: '获取商品详情' })
  async getProduct(@Param('skuCode') skuCode: string, @Query('tenantId') tenantId: string): Promise<Product> {
    return await this.productService.findBySkuCode(tenantId, skuCode);
  }

  @Post('matches')
  @ApiOperation({ summary: '生成搭配推荐' })
  async generateMatches(
    @Query('tenantId') tenantId: string,
    @Body() dto: GenerateMatchesDto,
  ) {
    return await this.productService.generateMatches(
      tenantId,
      dto.baseProductId,
      dto.stylePreferences,
      dto.occasion,
    );
  }
}
