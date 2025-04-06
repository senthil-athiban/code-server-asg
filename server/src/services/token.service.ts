import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
import moment from "moment";
import Token from "../model/token.model";
import tokenTypes from "../config/tokens";
import ApiError from "../config/error";
import { JWT_SECRET } from "../config/config";

const saveToken = async (userId: string, token: string, tokenType: string, expires: any) => {
  const existingToken = await Token.findOne({user: userId, type: tokenType });
  if (existingToken) {
    await Token.deleteMany({user: userId, type: tokenType});
  }
  const newToken = new Token({ user: userId, token, type: tokenType, expires  });
  await newToken.save();
};

const generateToken = (
  userId: string,
  expires: any,
  type: string,
  config = JWT_SECRET
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, config);
};

const verifyToken = async (
  token: string,
  tokenType: string,
  secret = JWT_SECRET
) => {
  try {
    const payload = jwt.verify(token, secret);
    const userId = payload.sub;
    const verifiedToken = await Token.findOne({ user: userId, token, type: tokenType });
    if (!verifiedToken) {
      throw new ApiError(404, `Token was not found for the corresponding user: ${userId}`);
    }
    await Token.deleteMany({
      user: userId,
      token,
      type: tokenType
    });
    return verifiedToken;
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      throw new ApiError(401, "Authentication token has expired");
    } 
    else if (error instanceof NotBeforeError) {
      throw new ApiError(401, "Token not yet valid");
    }
    else if (error instanceof JsonWebTokenError) {
      throw new ApiError(401, "Invalid authentication token");
    }
    throw new ApiError(500, "failed to verify token");
  }
};

const generateEmailVerificationToken = async (userId: string) => {
  const expiresIn = moment().add(1, "minute");
  const token = generateToken(userId, expiresIn, tokenTypes.EMAIL_VERIFY);
  await saveToken(userId, token, tokenTypes.EMAIL_VERIFY, expiresIn);
  return token;
};

const generateAuthToken = async (userId: string) => {
  const expiresIn = moment().add(1, "day");
  const token = generateToken(userId, expiresIn, tokenTypes.ACCESS);
  await saveToken(userId, token, tokenTypes.ACCESS, expiresIn);
  return token;
};

export default {
  saveToken,
  generateToken,
  generateAuthToken,
  generateEmailVerificationToken,
  verifyToken,
};