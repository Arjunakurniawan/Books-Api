type book = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  categoryId: number;
};

type category = {
  id: string;
  name: string;
};

type bookResponse = {
  name: string;
  description: string;
  image: string;
  price: number;
  category: number;
};

type categoryResponse = {
  name: string;
};
