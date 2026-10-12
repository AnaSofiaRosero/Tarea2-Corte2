import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
    @MaxLength(50, { message: 'El nombre del rol no puede exceder 50 caracteres' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripcion del rol es obligatoria' })
    @MaxLength(255, { message: 'La descripcion no puede exceder 255 caracteres' })
    description: string;
}
