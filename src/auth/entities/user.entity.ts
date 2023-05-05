import {
  AfterInsert,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ValidRoles } from '../interfaces/valid-roles';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;
  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: false,
  })
  isActivate: boolean;

  @Column('text', {
    array: true,
    default: [ValidRoles.ESTUDIANTE],
  })
  roles: string[];

  @Column('text', {
    nullable: true,
  })
  validationToken: string;

  // @OneToMany(() => Product, (product) => product.user)
  // products: Product[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseUpdate() {
    this.emailToLowerCase();
  }

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }
}
