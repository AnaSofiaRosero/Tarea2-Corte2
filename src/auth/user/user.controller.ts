import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions/permissions.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('manage_users')
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permissions('manage_users')
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('manage_users')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @Permissions('manage_users')
    async update(@Param('id', PositiveIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        try {
            return await this.userService.update(id, updateUserDto);
        } catch (error) {
            if (error instanceof Error && 'status' in error) {
                throw error;
            }
            throw new InternalServerErrorException('Fallo al actualizar el usuario', {
                cause: error,
                description: 'Error inesperado al persistir los cambios en la base de datos.',
            });
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('manage_users')
    async remove(@Param('id', PositiveIntPipe) id: number) {
        await this.userService.remove(id);
    }
}
