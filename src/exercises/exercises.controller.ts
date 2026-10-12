import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions/permissions.guard';
import { PositiveIntPipe } from '../common/pipes/positive-int-pipe';

import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) {}

    @Post()
    @Permissions('manage_exercises')
    create(@Body() createExerciseDto: CreateExerciseDto) {
        return this.exercisesService.create(createExerciseDto);
    }

    @Get()
    @Permissions('read_exercise')
    findAll() {
        return this.exercisesService.findAll();
    }

    @Get(':id')
    @Permissions('read_exercise')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.exercisesService.findOne(id);
    }

    @Patch(':id')
    @Permissions('manage_exercises')
    update(@Param('id', PositiveIntPipe) id: number, @Body() updateExerciseDto: UpdateExerciseDto) {
        return this.exercisesService.update(id, updateExerciseDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('manage_exercises')
    remove(@Param('id', PositiveIntPipe) id: number) {
        return this.exercisesService.remove(id);
    }
}
