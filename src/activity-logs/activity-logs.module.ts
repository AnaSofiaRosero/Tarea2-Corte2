import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../auth/user/user.module';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import { RoutinesModule } from '../routines/routines.module';

import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityExercise } from './entities/activity-exercise.entity';
import { ActivityLog } from './entities/activity-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityLog, ActivityExercise, RoutineExercise]), UserModule, RoutinesModule],
    controllers: [ActivityLogsController],
    providers: [ActivityLogsService],
})
export class ActivityLogsModule {}
