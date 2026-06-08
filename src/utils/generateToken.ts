import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  id: number;
  email: string;
  role: string;
};

export const generateToken = (payload: TokenPayload) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
};
