import { IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateRoutineExerciseDto {
    @IsInt()
    @IsPositive()
    exerciseId: number;

    @IsInt()
    @Min(0)
    orderIndex: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    targetSets?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    targetReps?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    targetWeightKg?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    targetDurationMin?: number;
}
