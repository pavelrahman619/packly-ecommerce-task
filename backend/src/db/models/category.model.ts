"use strict";

import { ICategory } from "../../types/category.type";
import mongoose from "../index";

const Schema = mongoose.Schema;

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image_url: {
    type: String,
    required: false
  },
  parent_id: {
    type: String,
    required: false,
    ref: 'Category'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;

