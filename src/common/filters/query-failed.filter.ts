import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Traduce errores de integridad de PostgreSQL a respuestas HTTP adecuadas
 * en lugar de un 500 generico.
 *  - 23503 foreign_key_violation -> 409 (registro en uso / referencia inexistente)
 *  - 23505 unique_violation      -> 409 (registro duplicado)
 */
@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();
        const code = (exception.driverError as { code?: string } | undefined)?.code;

        if (code === '23503') {
            response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                error: 'Conflict',
                message: 'Operacion rechazada: el registro esta referenciado por otros datos o referencia uno inexistente.',
            });
            return;
        }

        if (code === '23505') {
            response.status(HttpStatus.CONFLICT).json({
                statusCode: HttpStatus.CONFLICT,
                error: 'Conflict',
                message: 'Ya existe un registro con esos datos unicos.',
            });
            return;
        }

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'Error inesperado en la base de datos.',
        });
    }
}
