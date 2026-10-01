import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.orm.public.User.create({
      email: createUserDto.email,
      username: createUserDto.username ?? null,
      name: createUserDto.name ?? null,
    });
  }

  async findAll() {
    return await this.prisma.orm.public.User.all();
  }

  async findOne(id: number) {
    const user = await this.prisma.orm.public.User.where({ id }).first();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.orm.public.User.where({ id }).first();

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const data: UpdateUserDto = {};

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }
    if (updateUserDto.username !== undefined) {
      data.username = updateUserDto.username ?? null;
    }
    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name ?? null;
    }

    return await this.prisma.orm.public.User.where({ id }).update(data);
  }

  async remove(id: number) {
    const user = await this.prisma.orm.public.User.where({ id }).first();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return await this.prisma.orm.public.User.where({ id }).delete();
  }
}
