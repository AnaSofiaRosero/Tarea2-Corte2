import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../auth/user/user.service';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import { RoutinesService } from '../routines/routines.service';

import { CreateActivityExerciseDto } from './dto/create-activity-exercise.dto';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityExercise } from './entities/activity-exercise.entity';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogsService {
    constructor(
        @InjectRepository(ActivityLog)
        private readonly activityLogRepository: Repository<ActivityLog>,
        @InjectRepository(ActivityExercise)
        private readonly activityExerciseRepository: Repository<ActivityExercise>,
        @InjectRepository(RoutineExercise)
        private readonly routineExerciseRepository: Repository<RoutineExercise>,
        private readonly userService: UserService,
        private readonly routinesService: RoutinesService,
    ) {}

    async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
        const { activityExercises = [], routineId, userId, ...logData } = createActivityLogDto;
        const user = await this.userService.findOne(userId);
        const routine = await this.routinesService.findOne(routineId);
        // Validar todas las referencias ANTES de persistir (404/400 sin dejar registros incompletos)
        const resolved = await Promise.all(
            activityExercises.map(async (item) => ({
                item,
                routineExercise: await this.findRoutineExercise(item.routineExerciseId, routine.id),
            })),
        );

        const logId = await this.activityLogRepository.manager.transaction(async (manager) => {
            const savedLog = await manager.save(
                this.activityLogRepository.create({
                    ...logData,
                    startedAt: new Date(logData.startedAt),
                    completedAt: logData.completedAt ? new Date(logData.completedAt) : undefined,
                    user,
                    routine,
                }),
            );
            if (resolved.length > 0) {
                await manager.save(
                    resolved.map(({ item, routineExercise }) =>
                        this.buildActivityExercise(item, savedLog, routineExercise),
                    ),
                );
            }
            return savedLog.id;
        });

        return await this.findOne(logId);
    }

    async findAll(): Promise<ActivityLog[]> {
        return await this.activityLogRepository.find({
            relations: {
                user: true,
                routine: true,
                activityExercises: { routineExercise: { exercise: true } },
            },
            order: { startedAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<ActivityLog> {
        const activityLog = await this.activityLogRepository.findOne({
            where: { id },
            relations: {
                user: true,
                routine: true,
                activityExercises: { routineExercise: { exercise: true } },
            },
        });
        if (!activityLog) {
            throw new NotFoundException(`El registro de actividad con identificador ${id} no fue encontrado.`);
        }
        return activityLog;
    }

    async update(id: number, updateActivityLogDto: UpdateActivityLogDto): Promise<ActivityLog> {
        const { activityExercises, routineId, userId, ...logData } = updateActivityLogDto;
        const activityLog = await this.findOne(id);

        if (userId) {
            activityLog.user = await this.userService.findOne(userId);
        }
        if (routineId) {
            activityLog.routine = await this.routinesService.findOne(routineId);
        }
        // Validar todas las referencias ANTES de modificar nada
        const resolved = activityExercises
            ? await Promise.all(
                  activityExercises.map(async (item) => ({
                      item,
                      routineExercise: await this.findRoutineExercise(item.routineExerciseId, activityLog.routine.id),
                  })),
              )
            : undefined;

        this.activityLogRepository.merge(activityLog, {
            ...logData,
            startedAt: logData.startedAt ? new Date(logData.startedAt) : activityLog.startedAt,
            completedAt: logData.completedAt ? new Date(logData.completedAt) : activityLog.completedAt,
        });
        delete (activityLog as Partial<ActivityLog>).activityExercises;

        await this.activityLogRepository.manager.transaction(async (manager) => {
            const savedLog = await manager.save(activityLog);
            if (resolved) {
                await manager.delete(ActivityExercise, { activityLog: { id } });
                await manager.save(
                    resolved.map(({ item, routineExercise }) =>
                        this.buildActivityExercise(item, savedLog, routineExercise),
                    ),
                );
            }
        });

        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const activityLog = await this.findOne(id);
        await this.activityLogRepository.remove(activityLog);
    }

    private buildActivityExercise(
        item: CreateActivityExerciseDto,
        activityLog: ActivityLog,
        routineExercise: RoutineExercise,
    ): ActivityExercise {
        return this.activityExerciseRepository.create({
            ...item,
            startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
            completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
            activityLog,
            routineExercise,
        });
    }

    private async findRoutineExercise(id: number, routineId: number): Promise<RoutineExercise> {
        const routineExercise = await this.routineExerciseRepository.findOne({
            where: { id },
            relations: { exercise: true, routine: true },
        });
        if (!routineExercise) {
            throw new NotFoundException(`El ejercicio de rutina con identificador ${id} no fue encontrado.`);
        }
        if (routineExercise.routine.id !== routineId) {
            throw new BadRequestException(
                `El ejercicio de rutina ${id} no pertenece a la rutina ${routineId} del registro de actividad.`,
            );
        }
        return routineExercise;
    }
}
