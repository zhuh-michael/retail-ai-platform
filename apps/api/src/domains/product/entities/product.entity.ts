import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum MatchOccasion {
  CASUAL = 'CASUAL',
  BUSINESS = 'BUSINESS',
  PARTY = 'PARTY',
  SPORT = 'SPORT',
  DAILY = 'DAILY',
}

@Entity('products')
@Index(['tenant', 'skuCode'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'sku_code', type: 'varchar', length: 50 })
  skuCode: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // 上衣/下装/鞋子/配饰

  @Column({ type: 'varchar', length: 50 })
  subCategory: string; // 衬衫/裤子/连衣裙等

  @Column({ name: 'style_tags', type: 'jsonb' })
  styleTags: {
    styles: string[]; // 优雅/商务/休闲
    colors: string[];
    patterns: string[]; // 纯色/条纹/格子
    seasons: string[]; // 春/夏/秋/冬
    occasions: MatchOccasion[];
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ name: 'image_urls', type: 'jsonb', nullable: true })
  imageUrls: string[];

  @Column({ type: 'jsonb', nullable: true })
  sizes: {
    available: string[];
    sizeChart?: any;
  };

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 检查是否有库存
  hasStock(): boolean {
    return this.stockQuantity > 0;
  }
}
