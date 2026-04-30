export type book = {
  id: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  stock: number;
  category: categoryResponse | null;
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

export type user = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
};

export type userResponse = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export type registerPayload = {
  username: string;
  email: string;
  password: string;
  role?: string;
};

export type loginPayload = {
  email: string;
  password: string;
};

export type apiResponse<T> = {
  data: T;
  status: string | null;
  total?: number;
  pagination?: {
    page: number | null;
    limit: number | null;
  };
};

export type loginResponse = apiResponse<userResponse>;

export type registerResponse = apiResponse<userResponse>;
