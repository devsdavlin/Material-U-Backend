export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export const getPaginationParams = (
  query: {
    page?: unknown;
    limit?: unknown;
    limite?: unknown;
    size?: unknown;
  },
  defaultLimit = 20,
  maxLimit = 100,
): PaginationParams => {
  const rawPage = Number(query.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawLimit = Number(query.limit ?? query.limite ?? query.size);
  const parsedLimit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;
  const limit = Math.min(parsedLimit, maxLimit);

  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take,
  };
};

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> => {
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  return {
    items,
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
};

