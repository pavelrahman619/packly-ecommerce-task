"use strict";

import { IUser } from "../../types/user.type";
import mongoose from "../index";

const Schema = mongoose.Schema;

const UserSchema = new Schema<IUser>({
  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: false,
  },

  phone_number: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },

  sex: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  profile_picture: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["admin", "regular", "agent", "super_admin"],
  },
  password: {
    type: String,
    required: false,
  },
  date_of_birth: {
    type: Date,
    required: false,
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
