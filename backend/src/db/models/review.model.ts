"use strict";

import { IReview } from "../../types/review.type";
import mongoose from "../index";

const Schema = mongoose.Schema;

const ReviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    product_id: {
      type: String,
      required: true,
      ref: "Product",
    },
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    verified_purchase: {
      type: Boolean,
      default: false,
    },
    helpful_votes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
