import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions/permissions.guard';
import { PositiveIntPipe } from '../common/pipes/positive-int-pipe';

import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesService } from './routines.service';

@Controller('routines')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RoutinesController {
    constructor(private readonly routinesService: RoutinesService) {}

    @Post()
    @Permissions('create_routine')
    create(@Body() createRoutineDto: CreateRoutineDto) {
        return this.routinesService.create(createRoutineDto);
    }

    @Get()
    @Permissions('read_routine')
    findAll() {
        return this.routinesService.findAll();
    }

    @Get(':id')
    @Permissions('read_routine')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.routinesService.findOne(id);
    }

    @Patch(':id')
    @Permissions('update_routine')
    update(@Param('id', PositiveIntPipe) id: number, @Body() updateRoutineDto: UpdateRoutineDto) {
        return this.routinesService.update(id, updateRoutineDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_routine')
    remove(@Param('id', PositiveIntPipe) id: number) {
        return this.routinesService.remove(id);
    }
}
