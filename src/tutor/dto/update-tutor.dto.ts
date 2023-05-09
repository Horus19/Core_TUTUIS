import { MateriaDto } from '../../materia/dto/materia.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdateTutorDto {
  @IsString()
  id: string;

  @IsString()
  descripcion: string;

  @IsArray()
  materias: MateriaDto[];

  @IsString()
  costo: number;
}
