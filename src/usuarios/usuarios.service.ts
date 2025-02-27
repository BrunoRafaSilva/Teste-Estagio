import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}
  
  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  //filtros, ordenação e paginação
  async findAll(
    filtro: { name?: string; email?: string } = {}, 
    orderBy: { field: string; direction: 'ASC' | 'DESC' } = { field: 'name', direction: 'ASC' }, 
    page: number = 1, // Página de resultados
    limit: number = 10, //resultados por página
  ) {
    const queryBuilder = this.usuariosRepository.createQueryBuilder('usuario');

    
    if (filtro.name) {
      queryBuilder.andWhere('usuario.name ILIKE :name', { name: `%${filtro.name}%` });
    }

    if (filtro.email) {
      queryBuilder.andWhere('usuario.email ILIKE :email', { email: `%${filtro.email}%` });
    }

    // Ordenação
    queryBuilder.orderBy(`usuario.${orderBy.field}`, orderBy.direction);

    // Paginação
    queryBuilder.skip((page - 1) * limit).take(limit);

    return await queryBuilder.getMany();
  }

  async findOne(id: number) {
    return await this.usuariosRepository.findOne({ where: { id } });
  }
  async findOneByEmail(email: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({ 
      where: { email } });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException();
    }
    Object.assign(usuario, updateUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException();
    }
    return await this.usuariosRepository.remove(usuario);
  }
}