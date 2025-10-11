enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

enum Role {
  admin = "admin",
  super_admin = "super_admin",
  agent = "agent",
  regular = "regular",
}
export type IUser = {
  _id?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  sex: Gender;
  profile_picture: string;
  role: Role;
  password: string;
  date_of_birth?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
};
