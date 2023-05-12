import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTutoriaDto } from './dto/create-tutoria.dto';
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
import { SolicitudTutoriaDto } from './dto/solicitud-tutoria.dto';
import { Cron } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

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
   * @returns Tutoria
   * @param motivoRechazoDto
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
  async findAllTutoringRequestsByTutor(
    tutorId: string,
  ): Promise<SolicitudTutoriaDto[]> {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        tutor: { id: tutorId },
        estado: TutoriaEstado.PENDIENTE,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();

    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo para obtener todas las solicitudes de tutoria como estudiante
   * @param studentId
   * @returns SolicitudTutoriaDto[]
   */
  async findAllTutoringRequestsByStudent(studentId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        estudiante: { id: studentId },
        estado: TutoriaEstado.PENDIENTE,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();
    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo para obtener todas las tutorias completadas como tutor
   * @param tutorId
   * @returns Tutoria[]
   */
  async findAllCompletedTutoringByTutor(tutorId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        tutor: { id: tutorId },
        estado: TutoriaEstado.COMPLETADA,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();
    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo para obtener todas las tutorias activas como tutor
   * @param tutorId
   * @returns Tutoria[]
   */
  async findAllActiveTutoringByTutor(tutorId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        tutor: { id: tutorId },
        estado: TutoriaEstado.ACEPTADA,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();
    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo para obtener todas las tutorias activas como estudiante
   * @param studentId
   * @returns SolicitudTutoriaDto[]
   */
  async findAllActiveTutoringByStudent(studentId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        estudiante: { id: studentId },
        estado: TutoriaEstado.ACEPTADA,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();
    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo para obtener todas las tutorias completadas como estudiante
   * @param studentId
   * @returns Tutoria[]
   */
  async findAllCompletedTutoringByStudent(studentId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .leftJoinAndSelect('tutoria.materia', 'materia')
      .leftJoinAndSelect('tutoria.tutor', 'tutor')
      .leftJoinAndSelect('tutor.usuario', 'usuario')
      .where({
        estudiante: { id: studentId },
        estado: TutoriaEstado.COMPLETADA,
      })
      .orderBy('tutoria.fechaSolicitud', 'ASC')
      .getMany();
    return this.convertTutoriasToSolicitudTutoriaDto(tutorias);
  }

  /**
   * Metodo que convierte una lista de Tutoria a una lista de SolicitudTutoriaDto
   * @param tutorias
   * @returns SolicitudTutoriaDto[]
   * @private
   */
  private convertTutoriasToSolicitudTutoriaDto(tutorias: Tutoria[]) {
    return tutorias.map((tutoria) => {
      const solicitudTutoriaDto = new SolicitudTutoriaDto();

      solicitudTutoriaDto.id = tutoria.id;
      solicitudTutoriaDto.fechaSolicitud = tutoria.fechaSolicitud;
      solicitudTutoriaDto.fechaTutoria = tutoria.fechaTutoria;
      solicitudTutoriaDto.descripcion = tutoria.descripcion;
      solicitudTutoriaDto.valorOferta = tutoria.valorOferta;
      solicitudTutoriaDto.estudianteId = tutoria.estudiante.id;
      solicitudTutoriaDto.estudiantenombre = tutoria.estudiante.fullName;
      solicitudTutoriaDto.tutorId = tutoria.tutor.id;
      solicitudTutoriaDto.tutorNombre = tutoria.tutor.usuario.fullName;
      solicitudTutoriaDto.materiaId = tutoria.materia.id;
      solicitudTutoriaDto.materiaNombre = tutoria.materia.nombre;

      return solicitudTutoriaDto;
    });
  }

  /**
   * Tarea programada que se ejecuta todos los días a las 00:00 horas en la zona horaria de Bogotá.
   * La tarea busca tutorías que estén en estado "aceptada" y cuya fecha de tutoría haya pasado.
   * Luego, cambia el estado de estas tutorías a "completada".
   */
  @Cron('0 0 * * *', {
    timeZone: 'America/Bogota',
  }) // cada día a las 00:00 horas
  async finalizarTutoriasVencidas() {
    const tutoriasVencidas = await this.tutoriaRepository.find({
      where: {
        estado: TutoriaEstado.ACEPTADA,
        fechaTutoria: LessThan(new Date()), // buscar tutorías vencidas
      },
    });
    for (const tutoria of tutoriasVencidas) {
      tutoria.estado = TutoriaEstado.COMPLETADA; // cambiar estado de la tutoría
      await this.tutoriaRepository.save(tutoria);
    }
  }

  /**
   * Metodo para marcar una tutoria como finalizada
   * @param tutoriaId
   */
  async finalizarTutoria(tutoriaId: string) {
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id: tutoriaId },
    });
    // Valida que la fecha de la tutoria ya haya pasado y que la tutoria este en estado aceptada
    if (
      tutoria.fechaTutoria > new Date() ||
      tutoria.estado !== TutoriaEstado.ACEPTADA
    ) {
      throw new BadRequestException(
        'La tutoria no puede ser finalizada, ya que no ha pasado la fecha de la tutoria o la tutoria no esta en estado aceptada',
      );
    }
    tutoria.estado = TutoriaEstado.COMPLETADA;
    await this.tutoriaRepository.save(tutoria);
  }

  /**
   * Metodo para obtener una tutoria por id
   * @returns Tutoria
   * @param IdTutoria
   */
  async findOne(IdTutoria: string) {
    return await this.tutoriaRepository.findOne({
      where: { id: IdTutoria },
    });
  }
}
