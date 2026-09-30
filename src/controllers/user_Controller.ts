import { type Request, type Response, type NextFunction } from 'express';
import { loginUser, createUser, list_user, setUserActivo, updateUser } from '../services/user_Service.js';
import { BadRequestError } from '../utils/errors.js';

// POST /api/users/login -> entrar (público, con límite de intentos).
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

// GET /api/users -> listar usuarios (solo Administrador).
// Sin claves: el service nunca devuelve password_hash.
export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await list_user();
    return res.status(200).json({ ok: true, users });
  } catch (error) {
    next(error);
  }
};

// POST /api/users -> crear usuario (solo Administrador).
// El Almacenista siempre necesita warehouse_id; el Administrador no.
// No devuelve token: el usuario nuevo entra con su propio login.
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = await createUser(req.body);
    return res.status(201).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};

const parseId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// PATCH /api/users/:id/desactivar -> apagar acceso (solo Administrador).
// No borra: conserva el historial de movimientos. Nadie puede apagarse solo.
export const deactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new BadRequestError('ID de usuario inválido');
    }
    if (req.user?.id_user === id) {
      throw new BadRequestError('No puedes desactivar tu propia cuenta');
    }
    const user = await setUserActivo(id, false);
    return res.status(200).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/reactivar -> prender acceso (solo Administrador).
export const reactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new BadRequestError('ID de usuario inválido');
    }
    const user = await setUserActivo(id, true);
    return res.status(200).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id -> editar nombre, correo, contraseña o sede (solo Administrador).
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new BadRequestError('ID de usuario inválido');
    }
    const user = await updateUser(id, req.body);
    return res.status(200).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};
