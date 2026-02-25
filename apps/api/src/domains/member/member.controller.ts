import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { Member } from './entities/member.entity';

class IdentifyMemberDto {
  @ApiProperty({ description: '租户 ID' })
  tenantId: string;

  @ApiProperty({ description: '会员码或手机号', required: false })
  memberCode?: string;

  @ApiProperty({ description: '手机号', required: false })
  phone?: string;
}

@ApiTags('Members - 会员管理')
@Controller('api/v1/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('identify')
  @ApiOperation({ summary: '识别会员（扫码/手机号）' })
  async identify(@Body() dto: IdentifyMemberDto): Promise<Member> {
    if (dto.memberCode) {
      return await this.memberService.findByMemberCode(dto.tenantId, dto.memberCode);
    } else if (dto.phone) {
      return await this.memberService.findByPhone(dto.tenantId, dto.phone);
    } else {
      throw new Error('请提供会员码或手机号');
    }
  }

  @Get(':id/profile')
  @ApiOperation({ summary: '获取会员画像' })
  async getProfile(@Param('id') id: string) {
    return await this.memberService.getMemberProfile(id);
  }

  @Post(':id/visit')
  @ApiOperation({ summary: '记录会员到店' })
  async recordVisit(@Param('id') id: string) {
    await this.memberService.recordVisit(id);
    return { success: true };
  }
}
