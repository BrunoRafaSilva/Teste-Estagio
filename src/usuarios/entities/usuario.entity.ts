import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class Usuario {
  password(password: string, password1: any) {
    throw new Error('Method not implemented.');
  }
	@PrimaryGeneratedColumn()
	id: number;

	@Column({nullable: false})
	name:string;

	@Column({unique:true})
	email: string;

	@Column({ type: 'boolean', default: true})
	active: boolean;

}