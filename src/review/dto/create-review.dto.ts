import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  calificacion: number;

  @IsString()
  comentario: string;

  @IsString()
  tutoria: string;

  @IsString()
  estudiante: string;
}
