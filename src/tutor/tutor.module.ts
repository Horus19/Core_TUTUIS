import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutor } from './entities/tutor.entity';
import { MateriaModule } from '../materia/materia.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TutorController],
  imports: [TypeOrmModule.forFeature([Tutor]), MateriaModule, AuthModule],
  providers: [TutorService],
})
export class TutorModule {}
