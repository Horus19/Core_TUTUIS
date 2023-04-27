import { Module } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from './entities/materia.entity';

@Module({
  controllers: [MateriaController],
  imports: [TypeOrmModule.forFeature([Materia])],
  providers: [MateriaService],
  exports: [MateriaService],
})
export class MateriaModule {}
