import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorRepository } from './repository/tutor.repository';
import { Tutor } from './entities/tutor.entity';
import { MateriaService } from '../materia/materia.service';
import { AuthService } from '../auth/auth.service';
import { TutorDto } from './dto/tutor-out.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

/**
 * Servicio de tutor
 */
@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: TutorRepository,
    private readonly materiaService: MateriaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Crea un perfil de tutor para un usuario
   * @param createTutorDto
   */
  async create(createTutorDto: CreateTutorDto) {
    const { usuarioId, materiasIds, descripcion, costoPorHora } =
      createTutorDto;
    try {
      const usuario = await this.authService.findUserById(usuarioId);
      usuario.roles.push(ValidRoles.TUTOR);
      const materias = await this.materiaService.findByIds(materiasIds);

      const tutor = new Tutor();
      tutor.usuario = usuario;

      tutor.materias = materias;
      tutor.descripcion = descripcion;
      tutor.costoPorHora = costoPorHora;
      await this.authService.updateUser(usuario);
      return this.tutorRepository.save(tutor);
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal Server Error ',
        error.message,
      );
    }
  }

  /**
   * Actualiza el perfil de un tutor
   * @param id
   * @param updateTutorDto
   */
  async update(updateTutorDto: UpdateTutorDto) {
    const { materias, descripcion, costo, id } = updateTutorDto;
    const tutor = await this.findById(id);
    tutor.materias = await this.materiaService.findByIds(
      materias.map((m) => m.id),
    );
    tutor.descripcion = descripcion;
    tutor.costoPorHora = costo;
    return this.tutorRepository.save(tutor);
  }

  /**
   * Consulta todos los tutores diferentes al usuario que realiza la consulta
   * @param searchString
   * @param idUsuario
   * @returns TutorDto[]
   */
  async findAll(searchString: string, idUsuario: string): Promise<TutorDto[]> {
    const tutors = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.materias', 'materia')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where(
        '(usuario.fullName LIKE :searchString OR materia.nombre LIKE :searchString OR CAST(materia.codigo AS TEXT) LIKE :searchString) AND usuario.id != :idUsuario',
        {
          searchString: `%${searchString}%`,
          idUsuario: idUsuario,
        },
      )
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
      calificacion: tutor.calificacion,
    }));
  }

  /**
   * Consulta un tutor por su id de usuario
   * @param id
   * @returns TutorDto
   */
  async findOne(id: string): Promise<TutorDto> {
    const tutor = await this.tutorRepository.findOne({
      where: { usuario: { id } },
      relations: ['materias', 'usuario'],
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor with user ID ${id} not found`);
    }
    return {
      id: tutor.id,
      nombre: tutor.usuario.fullName,
      descripcion: tutor.descripcion,
      materias: tutor.materias.map((materia) => ({
        id: materia.id,
        nombre: materia.nombre,
      })),
      costo: tutor.costoPorHora,
      calificacion: tutor.calificacion,
    };
  }

  /**
   * Consulta un tutor por su id
   * @param id
   * @returns Tutor
   */
  async findById(id: string): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${id} not found`);
    }
    return tutor;
  }

  remove(id: number) {
    return `This action removes a #${id} tutor`;
  }

  /**
   * Consulta un tutor por su id de usuario
   * @param idUsuario
   * @returns Tutor
   */
  async findByUsuarioId(idUsuario: string): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { usuario: { id: idUsuario } },
    });
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${idUsuario} not found`);
    }
    return tutor;
  }

  /**
   * Actualiza la calificacion de un tutor
   * @param id
   * @param calificacion
   */
  async updateCalificacion(id: string, calificacion: number) {
    const tutor = await this.findById(id);
    tutor.calificacion = calificacion;
    return this.tutorRepository.save(tutor);
  }
}
