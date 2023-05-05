import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTutoriaDto {
  @IsString()
  materiaId: string;

  @IsString()
  estudianteId: string;

  @IsString()
  tutorId: string;

  @Type(() => Date)
  @IsDate()
  fechaTutoria: Date;

  @IsString()
  descripcion: string;

  @IsNumber()
  valorOferta: number;
}
