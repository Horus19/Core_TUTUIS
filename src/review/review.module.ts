import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { TutorModule } from '../tutor/tutor.module';
import { AuthModule } from '../auth/auth.module';
import { MateriaModule } from '../materia/materia.module';
import { TutoriaModule } from '../tutoria/tutoria.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [
    TypeOrmModule.forFeature([Review]),
    TutorModule,
    AuthModule,
    MateriaModule,
    TutoriaModule,
  ],
})
export class ReviewModule {}
