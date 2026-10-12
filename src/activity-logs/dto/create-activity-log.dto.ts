import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';

import { CreateActivityExerciseDto } from './create-activity-exercise.dto';

export class CreateActivityLogDto {
    @IsInt()
    @IsPositive()
    userId: number;

    @IsInt()
    @IsPositive()
    routineId: number;

    @IsDateString()
    startedAt: string;

    @IsOptional()
    @IsDateString()
    completedAt?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateActivityExerciseDto)
    activityExercises?: CreateActivityExerciseDto[];
}
