import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { DatabaseService } from './services/database.service';
import { ProducerIntervalsService } from './services/producer-intervals.service';

@Module({
  imports: [InfrastructureModule],
  providers: [ProducerIntervalsService, DatabaseService],
  exports: [ProducerIntervalsService, DatabaseService],
})
export class DomainModule {}
