import jwt from 'jsonwebtoken';

export const token_Creation = (data: { name: string; email: string; rol: string }) => {
    const payload = {
        name: data.name,
        email: data.email,
        rol: data.rol,
    };
    const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
    return jwt.sign(payload, secretKey, { expiresIn: '8h' });
}