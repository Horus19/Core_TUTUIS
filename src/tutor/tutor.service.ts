import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorRepository } from './repository/tutor.repository';
import { Tutor } from './entities/tutor.entity';
import { MateriaService } from '../materia/materia.service';
import { AuthService } from '../auth/auth.service';
import { TutorDto } from './dto/tutor-out.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: TutorRepository,
    private readonly materiaService: MateriaService,
    private readonly authService: AuthService,
  ) {}
  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    const { usuarioId, materiasIds, descripcion, costoPorHora } =
      createTutorDto;

    const usuario = await this.authService.findUserById(usuarioId);
    usuario.roles.push(ValidRoles.TUTOR);

    const materias = await this.materiaService.findByIds(materiasIds);

    const tutor = new Tutor();
    tutor.usuario = usuario;

    tutor.materias = materias;
    tutor.descripcion = descripcion;
    tutor.costoPorHora = costoPorHora;

    return this.tutorRepository.save(tutor);
  }

  async findAll(searchString: string) {
    const tutors = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.materias', 'materia')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where('usuario.fullName LIKE :searchString', {
        searchString: `%${searchString}%`,
      })
      .orWhere('materia.nombre LIKE :searchString', {
        searchString: `%${searchString}%`,
      })
      .orWhere('materia.codigo LIKE :searchString', {
        searchString: `%${searchString}%`,
      })
      .getMany();

    return tutors.map((tutor) => ({
      id: tutor.id,
      nombre: tutor.usuario.fullName,
      descripcion: tutor.descripcion,
      materias: tutor.materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
      })),
      costo: tutor.costoPorHora,
    }));
  }

  async findOne(id: string): Promise<TutorDto> {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
      relations: ['materias', 'usuario'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${id} not found`);
    }

    console.log(tutor);
    return {
      id: tutor.id,
      nombre: tutor.usuario.fullName,
      descripcion: tutor.descripcion,
      materias: tutor.materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
      })),
      costo: tutor.costoPorHora,
    };
  }

  // Metodo para encontar una entidad de tutor por su id
  async findById(id: string): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${id} not found`);
    }
    return tutor;
  }

  update(id: number, updateTutorDto: UpdateTutorDto) {
    return `This action updates a #${id} tutor`;
  }

  remove(id: number) {
    return `This action removes a #${id} tutor`;
  }
}
