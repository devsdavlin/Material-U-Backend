import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id_user: number;
}

const getSecret = (): string => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  return secretKey;
};

export const token_Creation = (data: { id_user: number }): string => {
  return jwt.sign({ id_user: data.id_user }, getSecret(), { expiresIn: '8h' });
};

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== 'object' || decoded === null || !('id_user' in decoded)) {
    throw new Error('Token inválido');
  }
  const id_user = (decoded as { id_user: unknown }).id_user;
  if (typeof id_user !== 'number') {
    throw new Error('Token inválido');
  }
  return { id_user };
};
