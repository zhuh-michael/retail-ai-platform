import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplenishmentPlan, ReplenishmentItem } from './entities/replenishment.entity';
import { ReplenishmentService } from './replenishment.service';
import { ReplenishmentController } from './replenishment.controller';
import { ForecastService } from './services/forecast.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReplenishmentPlan, ReplenishmentItem])],
  providers: [ReplenishmentService, ForecastService],
  controllers: [ReplenishmentController],
  exports: [ReplenishmentService, ForecastService],
})
export class ReplenishmentModule {}
