import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { AuthModule } from './auth/auth.module';
import { LoggerFactory } from 'typeorm/logger/LoggerFactory';
import { ConfigModule } from '@nestjs/config';
import { MateriaModule } from './materia/materia.module';
import { TutorModule } from './tutor/tutor.module';
import { TutoriaModule } from './tutoria/tutoria.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    MateriaModule,
    TutorModule,
    TutoriaModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerFactory],
})
export class AppModule {}
