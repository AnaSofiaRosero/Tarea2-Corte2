import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Between, ILike, IsNull, Not, Repository } from 'typeorm';

import { RoleNotFoundException, UserNotFoundException } from '../../common/exceptions';
import { User } from '../entities/user.entity';
import { RoleService } from '../role/role.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
        const { roleId, ...userData } = createUserDto;
        const role = await this.roleService.findOne(roleId);
        if (!role) {
            throw new RoleNotFoundException(roleId);
        }

        const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS') ?? '10', 10);
        const passwordHashed = await bcrypt.hash(userData.passwordHash, saltRounds);
        const user = this.userRepository.create({
            ...userData,
            passwordHash: passwordHashed,
            role,
        });

        const savedUser = await this.userRepository.save(user);
        return this.removePassword(savedUser);
    }

    async findAll(): Promise<Array<Omit<User, 'passwordHash'>>> {
        const users = await this.userRepository.find({
            relations: {
                role: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
        return users.map((user) => this.removePassword(user));
    }

    async findOne(id: number, relations: boolean = false): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: { role: relations ? { rolePermissions: { permission: true } } : true },
        });
        if (!user) {
            throw new UserNotFoundException(id);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
        const { roleId, passwordHash, ...userData } = updateUserDto;
        const user = await this.findOne(id);

        if (roleId) {
            const role = await this.roleService.findOne(roleId);
            if (!role) {
                throw new RoleNotFoundException(roleId);
            }
            user.role = role;
        }

        if (passwordHash) {
            const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS') ?? '10', 10);
            user.passwordHash = await bcrypt.hash(passwordHash, saltRounds);
        }

        this.userRepository.merge(user, userData);
        const savedUser = await this.userRepository.save(user);
        return this.removePassword(savedUser);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    async findByRole(roleName: string): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: { name: roleName } },
            relations: {
                role: true,
            },
            order: { username: 'ASC' },
        });
    }

    async count(): Promise<number> {
        return await this.userRepository.count();
    }

    async countByRole(roleName: string): Promise<number> {
        return await this.userRepository.count({
            where: { role: { name: roleName } },
        });
    }

    async findUsersCreatedBetween(startDate: Date, endDate: Date, limit = 10, offset = 0) {
        return await this.userRepository.findAndCount({
            where: {
                createdAt: Between(startDate, endDate),
            },
            relations: {
                role: true,
            },
            order: {
                createdAt: 'DESC',
            },
            take: limit,
            skip: offset,
        });
    }

    async searchUsersWithBio(term: string) {
        return await this.userRepository.find({
            where: [
                { username: ILike(`%${term}%`), bio: Not(IsNull()) },
                { email: ILike(`%${term}%`), bio: Not(IsNull()) },
            ],
            relations: {
                role: true,
            },
            order: {
                username: 'ASC',
            },
        });
    }

    async getUserWithPermissions(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
            },
        });

        if (!user) {
            return null;
        }

        const permissions = user.role?.rolePermissions?.map((rp) => rp.permission) || [];
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            createdAt: user.createdAt,
            role: {
                id: user.role.id,
                name: user.role.name,
                description: user.role.description,
            },
            permissions,
        };
    }

    private removePassword(user: User): Omit<User, 'passwordHash'> {
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
