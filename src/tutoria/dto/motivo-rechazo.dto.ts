import { IsOptional, IsString } from 'class-validator';

export class MotivoRechazoDto {
  @IsString()
  tutoriaId: string;

  @IsString()
  @IsOptional()
  descripcion: string;
}
