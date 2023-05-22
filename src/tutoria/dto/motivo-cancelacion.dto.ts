import { IsOptional, IsString } from 'class-validator';

export class MotivoCancelacionDto {
  @IsString()
  tutoriaId: string;

  @IsString()
  @IsOptional()
  descripcion: string;
}
