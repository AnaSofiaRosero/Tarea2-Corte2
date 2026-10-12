import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateExerciseDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    description: string;

    @IsString()
    @MaxLength(50)
    type: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedCalories?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedDistanceKm?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    estimatedDurationMin?: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    icon?: string;
}
