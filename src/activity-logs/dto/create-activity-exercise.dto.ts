import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateActivityExerciseDto {
    @IsInt()
    @IsPositive()
    routineExerciseId: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    actualSets?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    actualReps?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    actualWeightKg?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    actualDurationMin?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    caloriesBurned?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    distanceCoveredKm?: number;

    @IsOptional()
    @IsDateString()
    startedAt?: string;

    @IsOptional()
    @IsDateString()
    completedAt?: string;
}
