import { Module } from '@nestjs/common';
import { TutoriaService } from './tutoria.service';
import { TutoriaController } from './tutoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutoria } from './entities/tutoria.entity';
import { TutorModule } from '../tutor/tutor.module';
import { AuthModule } from '../auth/auth.module';
import { MateriaModule } from '../materia/materia.module';

@Module({
  controllers: [TutoriaController],
  providers: [TutoriaService],
  imports: [
    TypeOrmModule.forFeature([Tutoria]),
    TutorModule,
    AuthModule,
    MateriaModule,
  ],
  exports: [TypeOrmModule, TutoriaService],
})
export class TutoriaModule {}
