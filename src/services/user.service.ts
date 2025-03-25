import ApiError from "../config/error";
import User from "../model/user.model";

const createUser = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {
  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(409, "Email already registered")
  }
  return await new User({ email, password, name }).save();
};

const getUserById = async (id: string) => await User.findById(id);

export default {
  createUser,
  getUserById
};