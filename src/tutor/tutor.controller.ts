import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TutorService } from './tutor.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

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
   * Obtener un tutor por su id
   * @param id
   * @returns TutorDto
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tutorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTutorDto: UpdateTutorDto) {
    return this.tutorService.update(+id, updateTutorDto);
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
}
