import {
  AfterInsert,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('materia')
export class Materia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', {
    unique: true,
    nullable: true,
  })
  codigo: number;

  @Column('text', {
    unique: false,
    nullable: true,
  })
  nombre: string;
  @Column('text', {
    unique: false,
  })
  descripcion: string;

  @Column('bool', { nullable: true })
  activo: boolean;

  @BeforeInsert()
  setActivo() {
    this.activo = true;
  }

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }
}
