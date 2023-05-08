import { Injectable } from '@nestjs/common';
import { CreateTutoriaDto } from './dto/create-tutoria.dto';
import { UpdateTutoriaDto } from './dto/update-tutoria.dto';
import { TutoriaRepository } from './repository/tutoria.repository';
import { Tutoria } from './entities/tutoria.entity';
import { MateriaService } from '../materia/materia.service';
import { AuthService } from '../auth/auth.service';
import { Materia } from '../materia/entities/materia.entity';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorService } from '../tutor/tutor.service';
import { Tutor } from '../tutor/entities/tutor.entity';
import { TutoriaEstado } from './interfaces/estado-tutoria';
import { MotivoRechazoDto } from './dto/motivo-rechazo.dto';

@Injectable()
export class TutoriaService {
  constructor(
    @InjectRepository(Tutoria)
    private readonly tutoriaRepository: TutoriaRepository,
    private readonly tutorService: TutorService,
    private readonly materiaService: MateriaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Crea una solicitud de tutoria
   * @param createTutoriaDto
   * @returns Tutoria
   */
  async create(createTutoriaDto: CreateTutoriaDto) {
    const {
      materiaId,
      estudianteId,
      tutorId,
      fechaTutoria,
      descripcion,
      valorOferta,
    } = createTutoriaDto;

    const materia: Materia = await this.materiaService.findOne(materiaId);

    const usuario: User = await this.authService.findUserById(estudianteId);

    const tutor: Tutor = await this.tutorService.findById(tutorId);

    const tutoria = new Tutoria();
    tutoria.materia = materia;
    tutoria.estudiante = usuario;
    tutoria.tutor = tutor;
    tutoria.fechaTutoria = fechaTutoria;
    tutoria.descripcion = descripcion;
    tutoria.valorOferta = valorOferta;
    return this.tutoriaRepository.save(tutoria);
  }

  /**
   * Acepta una solicitud de tutoria
   * @param tutoriaId
   * @returns Tutoria
   */
  async acceptTutoria(tutoriaId: string) {
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id: tutoriaId },
    });
    tutoria.estado = TutoriaEstado.ACEPTADA;
    //TODO: Agregar logica para notificar al estudiante
    return this.tutoriaRepository.save(tutoria);
  }

  /**
   * Rechaza una solicitud de tutoria
   * @param MotivoRechazoDto
   * @returns Tutoria
   */
  async rechazarTutoria(motivoRechazoDto: MotivoRechazoDto) {
    const { tutoriaId, descripcion } = motivoRechazoDto;
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id: tutoriaId },
    });
    tutoria.estado = TutoriaEstado.RECHAZADA;
    tutoria.motivoRechazo = descripcion;
    //TODO: Agregar logica para notificar al estudiante
    return this.tutoriaRepository.save(tutoria);
  }

  /**
   * Metodo para obtener todas las solicitudes de tutoria como tutor
   * @param tutorId
   * @returns Tutoria[]
   */
  async findAllTutoringRequestsByTutor(tutorId: string) {
    return this.tutoriaRepository.find({
      where: {
        tutor: { id: tutorId },
        estado: TutoriaEstado.PENDIENTE,
      },
    });
  }

  /**
   * Metodo para obtener todas las solicitudes de tutoria como estudiante
   * @param studentId
   * @returns Tutoria[]
   */
  async findAllTutoringRequestsByStudent(studentId: string) {
    return this.tutoriaRepository.find({
      where: {
        estudiante: { id: studentId },
        estado: TutoriaEstado.PENDIENTE,
      },
    });
  }

  /**
   * Metodo para obtener todas las tutorias completadas como tutor
   * @param tutorId
   * @returns Tutoria[]
   */
  async findAllCompletedTutoringByTutor(tutorId: string) {
    return this.tutoriaRepository.find({
      where: {
        tutor: { id: tutorId },
        estado: TutoriaEstado.COMPLETADA,
      },
    });
  }

  /**
   * Metodo para obtener todas las tutorias activas como tutor
   * @param tutorId
   * @returns Tutoria[]
   */
  async findAllActiveTutoringByTutor(tutorId: string) {
    return this.tutoriaRepository.find({
      where: {
        tutor: { id: tutorId },
        estado: TutoriaEstado.ACEPTADA,
      },
    });
  }

  /**
   * Metodo para obtener todas las tutorias activas como estudiante
   * @param studentId
   * @returns Tutoria[]
   */
  async findAllActiveTutoringByStudent(studentId: string) {
    return this.tutoriaRepository.find({
      where: {
        estudiante: { id: studentId },
        estado: TutoriaEstado.ACEPTADA,
      },
    });
  }

  /**
   * Metodo para obtener todas las tutorias completadas como estudiante
   * @param studentId
   * @returns Tutoria[]
   */
  async findAllCompletedTutoringByStudent(studentId: string) {
    return this.tutoriaRepository.find({
      where: {
        estudiante: { id: studentId },
        estado: TutoriaEstado.COMPLETADA,
      },
    });
  }

  findAll() {
    return `This action returns all tutoria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tutoria`;
  }

  update(id: number, updateTutoriaDto: UpdateTutoriaDto) {
    return `This action updates a #${id} tutoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} tutoria`;
  }
}
