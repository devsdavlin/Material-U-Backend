import { type Request, type Response } from 'express';
import { createMaterial, updateMaterial, searchMaterials, setMaterialActivo } from '../services/material_Service.js';

const mapError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.message === 'Código interno duplicado') {
      return res.status(409).json({ ok: false, message: error.message });
    }
    if (error.message === 'Material no encontrado') {
      return res.status(404).json({ ok: false, message: error.message });
    }
    if (error.message === 'Sin cambios para actualizar') {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }
  console.error(fallback, error);
  return res.status(500).json({ ok: false, message: fallback });
};

const parseId = (value: unknown): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const create = async (req: Request, res: Response) => {
  try {
    const material = await createMaterial(req.body);
    return res.status(201).json({ ok: true, material });
  } catch (error) {
    return mapError(res, error, 'Error al crear el material');
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ ok: false, message: 'ID de material inválido' });
    }
    const material = await updateMaterial(id, req.body);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    return mapError(res, error, 'Error al actualizar el material');
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const limite = req.query.limite !== undefined ? Number(req.query.limite) : 10;
    const materials = await searchMaterials(q, Number.isNaN(limite) ? 10 : limite);
    return res.status(200).json({ ok: true, materials });
  } catch (error) {
    return mapError(res, error, 'Error al buscar materiales');
  }
};

export const deactivate = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ ok: false, message: 'ID de material inválido' });
    }
    const material = await setMaterialActivo(id, false);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    return mapError(res, error, 'Error al desactivar el material');
  }
};

export const reactivate = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ ok: false, message: 'ID de material inválido' });
    }
    const material = await setMaterialActivo(id, true);
    return res.status(200).json({ ok: true, material });
  } catch (error) {
    return mapError(res, error, 'Error al reactivar el material');
  }
};
