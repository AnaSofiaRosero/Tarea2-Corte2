import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../auth/user/user.module';
import { Exercise } from '../exercises/entities/exercise.entity';

import { RoutineExercise } from './entities/routine-exercise.entity';
import { Routine } from './entities/routine.entity';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';

@Module({
    imports: [TypeOrmModule.forFeature([Routine, RoutineExercise, Exercise]), UserModule],
    controllers: [RoutinesController],
    providers: [RoutinesService],
    exports: [RoutinesService],
})
export class RoutinesModule {}
