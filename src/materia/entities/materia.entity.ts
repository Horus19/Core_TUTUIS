import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('bool', { nullable: true, default: true })
  activo: boolean;

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }
}
