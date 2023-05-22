import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Materia } from '../../materia/entities/materia.entity';
import { User } from '../../auth/entities/user.entity';
import { Tutor } from '../../tutor/entities/tutor.entity';
import { TutoriaEstado } from '../interfaces/estado-tutoria';
import { Review } from '../../review/entities/review.entity';

@Entity('tutorias')
export class Tutoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Materia, { eager: true })
  @JoinColumn()
  materia: Materia;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  estudiante: User;

  @ManyToOne(() => Tutor, { eager: true })
  @JoinColumn()
  tutor: Tutor;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column('timestamp', { nullable: true })
  fechaTutoria: Date;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  valorOferta: number;

  @Column('text', { default: TutoriaEstado.PENDIENTE })
  estado: string;

  @Column('text', { nullable: true })
  motivoRechazo: string;

  @Column('text', { nullable: true })
  motivoCancelacion: string;

  @OneToMany(() => Review, (review) => review.tutoria)
  reviews: Review[];
}
