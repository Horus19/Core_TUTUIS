import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { TutorService } from "./tutor.service";
import { CreateTutorDto } from "./dto/create-tutor.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../auth/entities/user.entity";
import { TutorDto } from "./dto/tutor-out.dto";
import { UpdateTutorDto } from "./dto/update-tutor.dto";
import { ValidRoles } from "../auth/interfaces/valid-roles";

@Controller('tutor')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  /**
   * Crear un perfil de tutor
   * @param createTutorDto
   */
  @Post()
  create(@Body() createTutorDto: CreateTutorDto) {
    return this.tutorService.create(createTutorDto);
  }

  /**
   * Obtener todos los tutores a excepción del usuario que hace la petición
   * @param searchString
   * @param user
   */
  @Get()
  @Auth()
  findAll(@Query('searchString') searchString: string, @GetUser() user: User) {
    return this.tutorService.findAll(searchString, user.id);
  }

  /**
   * Obtener un tutor por su id de usuario
   * @param id
   * @returns TutorDto
   */
  @Get('usuario/:id')
  findOne(@Param('id') id: string) {
    return this.tutorService.findOne(id);
  }

  @Patch()
  update(@Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorService.update(updateTutorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tutorService.remove(+id);
  }

  /**
   * Obtener un tutor por su id de usuario
   */
  @Get('usuario/:id')
  findByUsuarioId(@Param('id') id: string) {
    return this.tutorService.findByUsuarioId(id);
  }

  /**
   * Obtener un usuario por su id de tutor
   */
  @Get('userByTutorID/:id')
  findById(@Param('id') id: string) {
    return this.tutorService.findUsuarioByTutorId(id);
  }

  /**
   * Obtener listado de tutores por parte del administrador
   * @param searchString
   */
  @Get('findByAdmin')
  findAllAdmin(@Query('searchString') searchString: string) {
    return this.tutorService.search(searchString);
  }
}
