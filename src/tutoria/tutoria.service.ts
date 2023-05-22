import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
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
import { MotivoCancelacionDto } from './dto/motivo-cancelacion.dto';

@Injectable()
export class TutoriaService {
  private readonly logger = new Logger('TutoriaService');
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

    ///Valida que el estudiante no tenga una tutoria pendiente por calificar
    const calificable = await this.validarCalificacionEstudiante(estudianteId);

    if (!calificable)
      throw new InternalServerErrorException(
        'Internal Server Error ',
        'El estudiante tiene una tutoria pendiente por calificar',
      );

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
      .andWhere('tutoria.fechaTutoria > :now', { now: new Date() })
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
      .andWhere('tutoria.fechaTutoria > :now', { now: new Date() })
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

  /**
   * Metodo para cancelar una tutoria
   * @param motivoCancelacionDto
   */
  async cancelarTutoria(motivoCancelacionDto: MotivoCancelacionDto) {
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id: motivoCancelacionDto.tutoriaId },
    });
    // Valida que la fecha de la tutoria no haya pasado y que la tutoria este en estado aceptada
    if (
      tutoria.fechaTutoria < new Date() ||
      tutoria.estado !== TutoriaEstado.ACEPTADA
    ) {
      throw new BadRequestException(
        'La tutoria no puede ser cancelada, ya que la fecha de la tutoria ya paso o la tutoria no esta en estado aceptada',
      );
    }
    tutoria.estado = TutoriaEstado.CANCELADA;
    tutoria.motivoCancelacion = motivoCancelacionDto.descripcion;
    ///Notificacion de cancelacion de tutoria
    await this.tutoriaRepository.save(tutoria);
  }

  /**
   * Metodo para cancelar una solicitud de tutoria
   * @param tutoriaId
   */
  async cancelarSolicitudTutoria(tutoriaId: string) {
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id: tutoriaId },
    });
    // Valida que la fecha de la tutoria no haya pasado y que la tutoria este en estado pendiente
    if (
      tutoria.fechaTutoria < new Date() ||
      tutoria.estado !== TutoriaEstado.PENDIENTE
    ) {
      throw new BadRequestException(
        'La solicitud de tutoria no puede ser cancelada, ya que la fecha de la tutoria ya paso o la tutoria no esta en estado pendiente',
      );
    }
    tutoria.estado = TutoriaEstado.CANCELADA;
    await this.tutoriaRepository.save(tutoria);
  }

  /**
   * Metodo para validar si un estudiante ha calificado todas las tutorias que ha finalizado
   * @param estudianteId
   * @returns boolean
   */
  async validarCalificacionEstudiante(estudianteId: string) {
    const tutorias = await this.tutoriaRepository
      .createQueryBuilder('tutoria')
      .leftJoinAndSelect('tutoria.reviews', 'reviews')
      .leftJoinAndSelect('tutoria.estudiante', 'estudiante')
      .where('tutoria.estudianteId = :estudianteId', { estudianteId })
      .andWhere('tutoria.estado = :estado', {
        estado: TutoriaEstado.COMPLETADA,
      })
      .getMany();
    for (const tutoria of tutorias) {
      if (tutoria.reviews === null || tutoria.reviews.length === 0) {
        return false;
      }
    }
    return true;
  }

  private handleError(error: Error): never {
    this.logger.error(error.message, error.stack);
    throw new InternalServerErrorException(
      'Internal Server Error ',
      error.message,
    );
  }
}
