import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../auth/user/user.service';
import { Exercise } from '../exercises/entities/exercise.entity';

import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Routine } from './entities/routine.entity';

@Injectable()
export class RoutinesService {
    constructor(
        @InjectRepository(Routine)
        private readonly routineRepository: Repository<Routine>,
        @InjectRepository(RoutineExercise)
        private readonly routineExerciseRepository: Repository<RoutineExercise>,
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
        private readonly userService: UserService,
    ) {}

    async create(createRoutineDto: CreateRoutineDto): Promise<Routine> {
        const { exercises = [], userId, ...routineData } = createRoutineDto;
        const user = await this.userService.findOne(userId);
        // Validar todas las referencias ANTES de persistir (404 sin dejar datos parciales)
        const resolved = await Promise.all(
            exercises.map(async (item) => ({ item, exercise: await this.findExercise(item.exerciseId) })),
        );

        const routineId = await this.routineRepository.manager.transaction(async (manager) => {
            const savedRoutine = await manager.save(this.routineRepository.create({ ...routineData, user }));
            if (resolved.length > 0) {
                await manager.save(
                    resolved.map(({ item, exercise }) =>
                        this.routineExerciseRepository.create({ ...item, routine: savedRoutine, exercise }),
                    ),
                );
            }
            return savedRoutine.id;
        });

        return await this.findOne(routineId);
    }

    async findAll(): Promise<Routine[]> {
        return await this.routineRepository.find({
            relations: { user: true, routineExercises: { exercise: true } },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Routine> {
        const routine = await this.routineRepository.findOne({
            where: { id },
            relations: { user: true, routineExercises: { exercise: true } },
        });
        if (!routine) {
            throw new NotFoundException(`La rutina con identificador ${id} no fue encontrada.`);
        }
        return routine;
    }

    async update(id: number, updateRoutineDto: UpdateRoutineDto): Promise<Routine> {
        const { exercises, userId, ...routineData } = updateRoutineDto;
        const routine = await this.findOne(id);

        if (userId) {
            routine.user = await this.userService.findOne(userId);
        }
        // Validar todas las referencias ANTES de modificar nada
        const resolved = exercises
            ? await Promise.all(
                  exercises.map(async (item) => ({ item, exercise: await this.findExercise(item.exerciseId) })),
              )
            : undefined;

        this.routineRepository.merge(routine, routineData);
        routine.updatedAt = new Date();
        delete (routine as Partial<Routine>).routineExercises;

        await this.routineRepository.manager.transaction(async (manager) => {
            const savedRoutine = await manager.save(routine);
            if (resolved) {
                await manager.delete(RoutineExercise, { routine: { id } });
                await manager.save(
                    resolved.map(({ item, exercise }) =>
                        this.routineExerciseRepository.create({ ...item, routine: savedRoutine, exercise }),
                    ),
                );
            }
        });

        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const routine = await this.findOne(id);
        await this.routineRepository.remove(routine);
    }

    private async findExercise(id: number): Promise<Exercise> {
        const exercise = await this.exerciseRepository.findOne({ where: { id } });
        if (!exercise) {
            throw new NotFoundException(`El ejercicio con identificador ${id} no fue encontrado.`);
        }
        return exercise;
    }
}
