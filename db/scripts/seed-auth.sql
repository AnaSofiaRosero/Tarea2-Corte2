-- Seed idempotente de permisos, asociaciones rol-permiso y usuarios de prueba.
-- Se puede ejecutar varias veces: no duplica registros ni borra datos.
-- Usa los roles existentes por nombre ('Admin' y 'User'), sin suponer IDs.
-- No requiere extensiones: el hash bcrypt de la contrasena de prueba 'password'
-- se genero con el paquete bcrypt del proyecto (bcrypt.hashSync('password', 10)).

BEGIN;

-- 1. Permisos (exactamente los que exigen los controladores)
INSERT INTO permissions (name, description) VALUES
('create_routine',   'Create new workout routines'),
('read_routine',     'Read workout routines'),
('update_routine',   'Update existing workout routines'),
('delete_routine',   'Delete workout routines'),
('manage_users',     'Manage user accounts'),
('manage_roles',     'Manage roles and permissions'),
('manage_exercises', 'Manage exercise catalog'),
('read_exercise',    'Read exercise catalog'),
('create_activity',  'Create activity logs'),
('read_activity',    'Read activity logs'),
('update_activity',  'Update activity logs'),
('delete_activity',  'Delete activity logs')
ON CONFLICT (name) DO NOTHING;

-- 2. Admin: todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE lower(r.name) = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 3. User: rutinas, actividad y lectura de ejercicios (sin manage_*)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r JOIN permissions p ON p.name IN (
    'create_routine', 'read_routine', 'update_routine', 'delete_routine',
    'read_exercise',
    'create_activity', 'read_activity', 'update_activity', 'delete_activity'
)
WHERE lower(r.name) = 'user'
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 4. Usuarios de prueba (contrasena: password). Hash bcrypt fijo de coste 10.
INSERT INTO users (username, email, password_hash, bio, role_id)
SELECT 'admin_user', 'admin@gym.com', '$2b$10$Q9Zb7SqhdBmiMDhaoXAAPu.sCnPf5dpROWvOV24KXV3VpNgf.15/u', 'System administrator', r.id
FROM roles r WHERE lower(r.name) = 'admin'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'admin@gym.com' OR u.username = 'admin_user');

INSERT INTO users (username, email, password_hash, bio, role_id)
SELECT 'juan_perez', 'juan@example.com', '$2b$10$Q9Zb7SqhdBmiMDhaoXAAPu.sCnPf5dpROWvOV24KXV3VpNgf.15/u', 'Fitness enthusiast', r.id
FROM roles r WHERE lower(r.name) = 'user'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'juan@example.com' OR u.username = 'juan_perez');

COMMIT;

-- Verificacion
SELECT r.name AS role, count(rp.id) AS permisos
FROM roles r LEFT JOIN role_permissions rp ON rp.role_id = r.id
GROUP BY r.name ORDER BY r.name;
SELECT u.email, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id;
