import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { TutoriaService } from "./tutoria.service";
import { CreateTutoriaDto } from "./dto/create-tutoria.dto";
import { MotivoRechazoDto } from "./dto/motivo-rechazo.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { ValidRoles } from "../auth/interfaces/valid-roles";

@Controller('tutoria')
export class TutoriaController {
  constructor(private readonly tutoriaService: TutoriaService) {}

  @Post()
  create(@Body() createTutoriaDto: CreateTutoriaDto) {
    return this.tutoriaService.create(createTutoriaDto);
  }

  /**
   * Acepta una solicitud de tutoría
   */
  @Get('aceptar')
  AceptarTutoria(@Param('idTutoria') id: string) {
    return this.tutoriaService.acceptTutoria(id);
  }

  /**
   * Rechaza una solicitud de tutoría
   */
  @Post('rechazar')
  RechazarTutoria(@Body() motivoRechazoDto: MotivoRechazoDto) {
    return this.tutoriaService.rechazarTutoria(motivoRechazoDto);
  }

  /**
   * Obtiene todas las solicitudes de tutoría de un estudiante
   */
  @Get('estudiante/:idEstudiante/pendientes')
  findAllPendientesByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.tutoriaService.findAllTutoringRequestsByStudent(idEstudiante);
  }

  /**
   * Obtiene todas las solicitudes de tutoría de un tutor
   */
  @Get('tutor/:idTutor/pendientes')
  findAllPendientesByTutor(@Param('idTutor') idTutor: string) {
    return this.tutoriaService.findAllTutoringRequestsByTutor(idTutor);
  }

  /**
   * Obtiene todas las tutorias finalizadas de un estudiante
   */
  @Get('estudiante/:idEstudiante/finalizadas')
  findAllFinalizadasByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.tutoriaService.findAllCompletedTutoringByStudent(idEstudiante);
  }

  /**
   * Obtiene todas las tutorias finalizadas de un tutor
   */
  @Get('tutor/:idTutor/finalizadas')
  findAllFinalizadasByTutor(@Param('idTutor') idTutor: string) {
    return this.tutoriaService.findAllCompletedTutoringByTutor(idTutor);
  }

  /**
   * Obtiene todas las tutorias activas de un estudiante
   */
  @Get('estudiante/:idEstudiante/activas')
  findAllActivasByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.tutoriaService.findAllActiveTutoringByStudent(idEstudiante);
  }

  /**
   * Obtiene todas las tutorias activas de un tutor
   */
  @Get('tutor/:idTutor/activas')
  findAllActivasByTutor(@Param('idTutor') idTutor: string) {
    return this.tutoriaService.findAllActiveTutoringByTutor(idTutor);
  }

  /**
   * Finaliza una tutoria
   * @param idTutoria
   */
  @Get('finalizar/:idTutoria')
  @Auth(ValidRoles.TUTOR)
  finalizarTutoria(@Param('idTutoria') idTutoria: string) {
    return this.tutoriaService.finalizarTutoria(idTutoria);
  }
}
