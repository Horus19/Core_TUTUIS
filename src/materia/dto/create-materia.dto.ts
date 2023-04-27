import { IsInt, IsString } from 'class-validator';

export class CreateMateriaDto {
  @IsInt()
  codigo: number;

  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;
}
