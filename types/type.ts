export type book = {
  id: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  stock: number;
  categoryId: string;
};

export type category = {
  id: string;
  name: string;
};

export type bookResponse = {
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  categoryId: string;
};

export type categoryResponse = {
  name: string;
};

export type apiResponse<T> = {
  data: T;
  status: string | null;
};
