import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Materia } from '../../materia/entities/materia.entity';

@Entity('tutor')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: User;

  @ManyToMany(() => Materia)
  @JoinTable()
  materias: Materia[];

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  costoPorHora: number;

  @Column('decimal', {
    precision: 2,
    scale: 1,
    default: 0,
  })
  calificacion: number;

  @Column('bool', { nullable: true, default: true })
  activo: boolean;
}
