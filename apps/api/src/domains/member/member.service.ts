import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 通过会员码查找会员
   */
  async findByMemberCode(tenantId: string, memberCode: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { tenantId, memberCode },
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    if (!member.active) {
      throw new BadRequestException('会员已停用');
    }

    return member;
  }

  /**
   * 通过手机号查找会员
   */
  async findByPhone(tenantId: string, phone: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { tenantId, phone },
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    if (!member.active) {
      throw new BadRequestException('会员已停用');
    }

    return member;
  }

  /**
   * 获取会员画像（包含推荐话术）
   */
  async getMemberProfile(memberId: string): Promise<{
    member: Member;
    talkSuggestions: string[];
    isBirthday: boolean;
  }> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    // 生成推荐话术
    const talkSuggestions: string[] = [];

    // 生日祝福
    if (member.isTodayBirthday()) {
      talkSuggestions.push(`${member.name}女士/先生，生日快乐！我们为您准备了生日专属优惠。`);
    } else if (member.isUpcomingBirthday(7)) {
      talkSuggestions.push(`${member.name}女士/先生，您的生日快到了，提前祝您生日快乐！`);
    }

    // 基于偏好推荐
    if (member.stylePreferences?.styles) {
      const styles = member.stylePreferences.styles.join('、');
      talkSuggestions.push(`您偏好的${styles}风格，最近到了不少新品，我给您介绍一下？`);
    }

    // 基于购买历史
    if (member.totalPurchases > 0) {
      talkSuggestions.push(`感谢您一直以来的支持，您是我们的${member.level}会员了。`);
    }

    return {
      member,
      talkSuggestions,
      isBirthday: member.isTodayBirthday(),
    };
  }

  /**
   * 记录会员到店访问
   */
  async recordVisit(memberId: string): Promise<void> {
    await this.memberRepository.update(memberId, {
      visitCount: () => 'visit_count + 1',
      lastVisitAt: new Date(),
    });
  }
}
