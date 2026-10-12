import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions/permissions.guard';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @Permissions('manage_roles')
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    @Permissions('manage_roles')
    findAll() {
        return this.roleService.findAll();
    }

    @Get(':id')
    @Permissions('manage_roles')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.roleService.findOne(id);
    }

    @Patch(':id')
    @Permissions('manage_roles')
    update(@Param('id', PositiveIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('manage_roles')
    remove(@Param('id', PositiveIntPipe) id: number) {
        return this.roleService.remove(id);
    }
}
