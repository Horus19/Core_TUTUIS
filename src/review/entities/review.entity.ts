import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tutoria } from '../../tutoria/entities/tutoria.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  calificacion: number;

  @Column()
  comentario: string;

  @ManyToOne(() => Tutoria, (tutoria) => tutoria.reviews)
  tutoria: Tutoria;

  @ManyToOne(() => User, (estudiante) => estudiante.reviews)
  estudiante: User;
}
