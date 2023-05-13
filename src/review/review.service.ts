import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { TutorService } from '../tutor/tutor.service';
import { MateriaService } from '../materia/materia.service';
import { AuthService } from '../auth/auth.service';
import { TutoriaService } from '../tutoria/tutoria.service';
import { TutoriaEstado } from '../tutoria/interfaces/estado-tutoria';
import { ReviewDTO } from "./dto/review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly tutorService: TutorService,
    private readonly materiaService: MateriaService,
    private readonly tutoriaService: TutoriaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Crea una nueva review sobre una tutoría
   * @param createReviewDto
   */

  async create(createReviewDto: CreateReviewDto) {
    const tutoria = await this.tutoriaService.findOne(createReviewDto.tutoria);
    if (!tutoria) throw new Error('Tutoria no encontrada');

    if (tutoria.estado !== TutoriaEstado.COMPLETADA)
      throw new Error('La tutoría no ha sido completada');

    const estudiante = await this.authService.findUserById(
      createReviewDto.estudiante,
    );
    if (!estudiante) throw new Error('Estudiante no encontrado');
    const review = this.reviewRepository.create({
      ...createReviewDto,
      estudiante,
      tutoria,
    });
    await this.reviewRepository.save(review);
    ///Calcular el promedio de las reviews y actualizar calificacion en el perfil del tutor
    const reviews = await this.findAllByTutorId(tutoria.tutor.id);
    /// Suma las calificaciones de las reviews y las divide por la cantidad de reviews
    const promedio =
      reviews.map((review) => review.calificacion).reduce((a, b) => a + b) /
      reviews.length;
    return await this.tutorService.updateCalificacion(
      tutoria.tutor.id,
      promedio,
    );
  }

  /**
   * Obtiene todas las reviews por id de tutor
   * @param tutorId
   * @returns ReviewDTO[]
   */
  async findAllByTutorId(tutorId: string) {
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.tutoria', 'tutoria')
      .leftJoinAndSelect('review.estudiante', 'estudiante')
      .where('tutoria.tutor = :tutorId', { tutorId })
      .getMany();
    /// Retorna un arreglo de ReviewDTO
    return this.reviewsToReviewsDTO(reviews);
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }

  /**
   * Convierte un arreglo de Review a ReviewDTO
   * @param reviews Review[]
   * @returns ReviewDTO[]
   */
  reviewsToReviewsDTO(reviews: Review[]) {
    return reviews.map((review) => {
      const { id, calificacion, comentario, tutoria, estudiante } = review;
      const reviewDTO = new ReviewDTO();
      reviewDTO.id = id;
      reviewDTO.calificacion = calificacion;
      reviewDTO.comentario = comentario;
      reviewDTO.tutoria = tutoria.id;
      reviewDTO.estudiante = estudiante.fullName;
      return reviewDTO;
    });
  }
}
