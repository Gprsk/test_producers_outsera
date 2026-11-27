import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { DatabaseController } from './http/controllers/database.controller';
import { ProducersController } from './http/controllers/producers.controller';

@Module({
  imports: [DomainModule],
  controllers: [ProducersController, DatabaseController],
})
export class PresentationModule {}
