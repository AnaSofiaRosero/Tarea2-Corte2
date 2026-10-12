import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    @MinLength(3, { message: 'El nombre de usuario debe contener al menos 3 caracteres' })
    username: string;

    @IsEmail({}, { message: 'Debe ingresar un correo electronico valido' })
    @IsNotEmpty({ message: 'El correo electronico es requerido' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'La contrasena debe tener minimo 8 caracteres' })
    passwordHash: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'La biografia no puede exceder 200 caracteres' })
    bio?: string;

    @IsInt()
    @IsPositive()
    @IsNotEmpty({ message: 'Debe especificar el id del rol del usuario' })
    roleId: number;
}
