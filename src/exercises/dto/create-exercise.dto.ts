import { IsNumber, IsOptional, IsString, IsNotEmpty, MaxLength, Min, Matches } from 'class-validator';

export class CreateExerciseDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/\S/, { message: 'name cannot be empty or contain only spaces' })
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
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
