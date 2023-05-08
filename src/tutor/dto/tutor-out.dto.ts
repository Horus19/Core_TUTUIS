import { MateriaDto } from '../../materia/dto/materia.dto';

export class TutorDto {
  id: string;

  nombre: string;

  descripcion: string;

  materias: MateriaDto[];

  costo: number;

  calificacion: number;
}
