import bcryptjs from "bcryptjs";
import ApiError from "../config/error";
import User from "../model/user.model";
import emailService from "./email.service";
import tokenService from "./token.service";

const loginEmailAndPassword = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatched = await bcryptjs.compare(password, user.password);
    if (!isMatched) throw new ApiError(401, "Invalid password");

    if (!user.isEmailVerified) {
      const token = await tokenService.generateEmailVerificationToken(user.id);
      await emailService.sendVerificationEmail(token, user.email);
      throw new ApiError(403, "Email not verified. Email verification has been sent");
    }
    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Authentication failed due to server error");
  }
};

export default {
  loginEmailAndPassword
};