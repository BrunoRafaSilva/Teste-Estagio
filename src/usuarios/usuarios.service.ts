import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto) {
    createUsuarioDto.password = bcrypt.hashSync(createUsuarioDto.password, 10);
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  async login(LoginUsuarioDto: LoginUsuarioDto) {
    const { email, password } = LoginUsuarioDto;
    const user = await this.findOneByEmail(email);

    if (user && typeof user.password === 'string' && bcrypt.compareSync(password, user.password as unknown as string)) {
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload)
      };
    }

    throw new UnauthorizedException();
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
      where: { email }
    });
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