import bcrypt from 'bcrypt';
import { type CreateUserType } from '../Validations/createUser_schema.js';
import { type LoginType } from '../Validations/login_schema.js';
import { prisma } from '../config/db.js';
import { token_Creation } from '../utils/tokens.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { getPrismaCode } from './movement_common.js';

// Crea un usuario nuevo en la base de datos
export const createUser = async (userData: CreateUserType) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                name: userData.username,
                email: userData.email,
                password_hash: await bcrypt.hash(userData.password, 10),
                rol: userData.rol,
                // Solo se envía warehouse_id si existe (rol Almacenista)
                ...(userData.warehouse_id !== undefined && { warehouse_id: userData.warehouse_id }),
            },
            omit: { password_hash: true },
        });

        const token = token_Creation({
            id_user: newUser.id_user,
        });
        return { user: newUser, token };
    } catch (error) {
        if (getPrismaCode(error) === 'P2002') {
            throw new ConflictError('El correo electrónico ya está registrado');
        }
        throw error;
    }
};

// Login de usuario
export const loginUser = async (loginData: LoginType) => {
    const user = await prisma.user.findUnique({
        where: { email: loginData.email },
    });
    if (!user || !user.activo) {
        throw new UnauthorizedError('Credenciales inválidas');
    }
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Credenciales inválidas');
    }
    const { password_hash: _excluded, ...safeUser } = user;

    const token = token_Creation({
        id_user: user.id_user,
    });
    return {
        message: 'Login exitoso',
        user: safeUser,
        token,
    };
};
