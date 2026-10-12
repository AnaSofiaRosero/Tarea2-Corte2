import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { User } from '../../entities/user.entity';

interface AuthenticatedRequest extends Request {
    user?: User;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Fail-closed: una ruta protegida por este guard debe declarar sus permisos.
        if (!requiredPermissions || requiredPermissions.length === 0) {
            throw new ForbiddenException('Acceso denegado: la ruta no declara permisos requeridos');
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado en la solicitud');
        }

        const userPermissions = user.role?.rolePermissions?.map((rp) => rp.permission?.name).filter(Boolean) ?? [];
        const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasAllRequiredPermissions) {
            throw new ForbiddenException('Acceso denegado: No cuentas con los permisos suficientes para esta accion');
        }

        return true;
    }
}