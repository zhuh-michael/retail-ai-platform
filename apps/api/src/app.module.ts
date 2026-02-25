import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './domains/tenant/tenant.module';
import { AuthModule } from './domains/auth/auth.module';
import { ReplenishmentModule } from './domains/replenishment/replenishment.module';
import { MemberModule } from './domains/member/member.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'retail_ai',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
    }),

    // 领域模块
    TenantModule,
    AuthModule,
    ReplenishmentModule,
    MemberModule,
  ],
})
export class AppModule {}
