import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum MemberLevel {
  NORMAL = 'NORMAL',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum StylePreference {
  CASUAL = 'CASUAL',
  BUSINESS = 'BUSINESS',
  ELEGANT = 'ELEGANT',
  SPORTY = 'SPORTY',
  TRENDY = 'TRENDY',
}

@Entity('members')
@Index(['tenant', 'phone'])
@Index(['tenant', 'memberCode'], { unique: true })
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'member_code', type: 'varchar', length: 50 })
  memberCode: string;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: MemberLevel,
    default: MemberLevel.NORMAL,
  })
  level: MemberLevel;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'style_preferences', type: 'jsonb', nullable: true })
  stylePreferences: {
    styles: StylePreference[];
    colors: string[];
    sizes: {
      top?: string;
      bottom?: string;
      shoes?: string;
    };
    priceRange?: {
      min?: number;
      max?: number;
    };
  };

  @Column({ name: 'total_purchases', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPurchases: number;

  @Column({ name: 'visit_count', type: 'int', default: 0 })
  visitCount: number;

  @Column({ name: 'last_visit_at', type: 'timestamp', nullable: true })
  lastVisitAt: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 计算年龄
  getAge(): number | null {
    if (!this.birthday) return null;
    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // 检查是否是今日生日
  isTodayBirthday(): boolean {
    if (!this.birthday) return false;
    const today = new Date();
    const birthDate = new Date(this.birthday);
    return (
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() === birthDate.getDate()
    );
  }

  // 检查是否是近期生日（7 天内）
  isUpcomingBirthday(days: number = 7): boolean {
    if (!this.birthday) return false;
    const today = new Date();
    const birthDate = new Date(this.birthday);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const diffTime = thisYearBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= days;
  }
}
