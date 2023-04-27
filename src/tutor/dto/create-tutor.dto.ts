import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateTutorDto {
  @IsString()
  usuarioId: string;

  @IsArray()
  materiasIds: string[];

  @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  costoPorHora: number;
}
