import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Materia } from './entities/materia.entity';
import { MateriaRepository } from './repository/materia.repository';
import { MateriaResponseDto } from './dto/materia-out.dto';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: MateriaRepository,
  ) {}
  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    const materia = this.materiaRepository.create(createMateriaDto);
    return await this.materiaRepository.save(materia);
  }

  async findAll(): Promise<MateriaResponseDto[]> {
    const materias = await this.materiaRepository.find();

    return materias.map((subject) => {
      return {
        id: subject.id,
        codigo: subject.codigo,
        nombre: subject.nombre,
        descripcion: subject.descripcion,
        activo: subject.activo,
        codigoNombre: `${subject.codigo} - ${subject.nombre}`,
      };
    });
  }

  async findOne(id: string): Promise<Materia> {
    return await this.materiaRepository.findOne({ where: { id } });
  }

  async findOneByNombre(nombre: string): Promise<Materia> {
    return await this.materiaRepository.findOne({ where: { nombre } });
  }

  async update(id: string, updateMateriaDto: UpdateMateriaDto) {
    const materia = await this.materiaRepository.findOne({ where: { id } });
    if (!materia) {
      throw new NotFoundException(`Materia con id ${id} no encontrada`);
    }
    const updatedMateria = Object.assign(materia, updateMateriaDto);
    return this.materiaRepository.save(updatedMateria);
  }

  async remove(id: string) {
    return await this.materiaRepository.delete({ id });
  }

  async findByIds(ids: string[]): Promise<Materia[]> {
    return await this.materiaRepository.findByIds(ids);
  }
}
