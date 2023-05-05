import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TutoriaService } from './tutoria.service';
import { CreateTutoriaDto } from './dto/create-tutoria.dto';
import { UpdateTutoriaDto } from './dto/update-tutoria.dto';
import { MotivoRechazoDto } from './dto/motivo-rechazo.dto';

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
   * Obtiene todas las solicitudes de tutoría de un tutor
   */
  @Get('tutor/:idTutor')
  findAllByTutor(@Param('idTutor') idTutor: string) {
    return this.tutoriaService.findAllTutoringRequestsByTutor(idTutor);
  }

  /**
   * Obtiene todas las solicitudes de tutoría de un estudiante
   */
  @Get('estudiante/:idEstudiante')
  findAllByEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.tutoriaService.findAllTutoringRequestsByStudent(idEstudiante);
  }

  @Get()
  findAll() {
    return this.tutoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutoriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutoriaDto: UpdateTutoriaDto) {
    return this.tutoriaService.update(+id, updateTutoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tutoriaService.remove(+id);
  }
}
