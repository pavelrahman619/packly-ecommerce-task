export interface ICartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
}

export interface ICart {
  _id?: string;
  user_id?: string;
  session_id?: string;
  items: ICartItem[];
  total: number;
  created_at?: Date;
  updated_at?: Date;
}

