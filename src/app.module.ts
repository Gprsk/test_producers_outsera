import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainModule } from './domain/domain.module';
import { validateEnvironment } from './infrastructure/config/env.validation';
import { buildTypeOrmOptions } from './infrastructure/database/typeorm.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //validate: validateEnvironment
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(),
    }),
    InfrastructureModule,
    DomainModule,
    PresentationModule,
  ],
})
export class AppModule {}
