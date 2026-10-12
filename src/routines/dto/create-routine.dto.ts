import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, IsString, MaxLength, ValidateNested } from 'class-validator';

import { CreateRoutineExerciseDto } from './create-routine-exercise.dto';

export class CreateRoutineDto {
    @IsInt()
    @IsPositive()
    userId: number;

    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRoutineExerciseDto)
    exercises?: CreateRoutineExerciseDto[];
}
