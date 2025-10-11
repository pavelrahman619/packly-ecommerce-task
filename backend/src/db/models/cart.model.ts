"use strict";

import { ICart } from "../../types/cart.type";
import mongoose from "../index";

const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  product_id: {
    type: String,
    required: true,
    ref: 'Product'
  },
  variant_id: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const CartSchema = new Schema<ICart>({
  user_id: {
    type: String,
    required: false,
    ref: 'User'
  },
  session_id: {
    type: String,
    required: false
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;

