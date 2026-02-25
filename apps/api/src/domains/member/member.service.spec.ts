import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member, MemberLevel } from './entities/member.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MemberService', () => {
  let service: MemberService;
  let repository: any;

  const mockMember: Partial<Member> = {
    id: 'member-001',
    tenantId: 'tenant-001',
    memberCode: 'MEMBER001',
    phone: '13800138000',
    name: '王小姐',
    level: MemberLevel.GOLD,
    points: 2580,
    birthday: new Date('1990-03-15'),
    stylePreferences: {
      styles: ['ELEGANT', 'BUSINESS'],
      colors: ['黑色', '白色'],
      sizes: { top: 'M', bottom: 'L' },
    },
    totalPurchases: 15800,
    visitCount: 28,
    active: true,
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('应该定义', () => {
    expect(service).toBeDefined();
  });

  describe('findByMemberCode', () => {
    it('应该成功找到会员', async () => {
      repository.findOne.mockResolvedValue(mockMember);

      const result = await service.findByMemberCode('tenant-001', 'MEMBER001');

      expect(result).toEqual(mockMember);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-001', memberCode: 'MEMBER001' },
      });
    });

    it('应该拒绝不存在的会员', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findByMemberCode('tenant-001', 'NON_EXISTENT')
      ).rejects.toThrow(NotFoundException);
    });

    it('应该拒绝停用的会员', async () => {
      const inactiveMember = { ...mockMember, active: false };
      repository.findOne.mockResolvedValue(inactiveMember);

      await expect(
        service.findByMemberCode('tenant-001', 'MEMBER001')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMemberProfile', () => {
    it('应该返回会员画像和话术', async () => {
      repository.findOne.mockResolvedValue(mockMember);

      const result = await service.getMemberProfile('member-001');

      expect(result).toHaveProperty('member');
      expect(result).toHaveProperty('talkSuggestions');
      expect(Array.isArray(result.talkSuggestions)).toBe(true);
    });

    it('应该检测今日生日', async () => {
      const birthdayMember = {
        ...mockMember,
        birthday: new Date(), // 今日生日
      };
      repository.findOne.mockResolvedValue(birthdayMember);

      const result = await service.getMemberProfile('member-001');

      expect(result.isBirthday).toBe(true);
      expect(result.talkSuggestions.some(t => t.includes('生日快乐'))).toBe(true);
    });
  });

  describe('recordVisit', () => {
    it('应该记录会员到店', async () => {
      repository.update.mockResolvedValue({ affected: 1 });

      await service.recordVisit('member-001');

      expect(repository.update).toHaveBeenCalledWith('member-001', {
        visitCount: expect.anything(),
        lastVisitAt: expect.any(Date),
      });
    });
  });
});
