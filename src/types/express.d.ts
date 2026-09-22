export interface AuthUser {
  id_user: number;
  email: string;
  rol: string;
  warehouse_id: number | null;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthUser;
    }
  }
}

export {};
