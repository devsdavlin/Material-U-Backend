import { type Request, type Response, type NextFunction } from 'express';
import { createMaterial, updateMaterial, searchMaterials, setMaterialActivo } from '../services/material_Service.js';
import { BadRequestError } from '../utils/errors.js';
import { getPaginationParams } from '../utils/pagination.js';

const parseId = (value: unknown): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError('ID de material inválido');
  }
  return id;
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const material = await createMaterial(req.body);
    return res.status(201).json({ ok: true, material });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const material = await updateMaterial(id, req.body);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    next(error);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const paginationParams = getPaginationParams(req.query, 10);
    const result = await searchMaterials(q, paginationParams);
    
    res.setHeader('X-Total-Count', result.pagination.total.toString());
    return res.status(200).json({
      ok: true,
      materials: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const material = await setMaterialActivo(id, false);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    next(error);
  }
};

export const reactivate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    const material = await setMaterialActivo(id, true);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    next(error);
  }
};
