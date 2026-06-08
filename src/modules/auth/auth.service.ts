import bcrypt from "bcrypt";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { generateToken } from "../../utils/generateToken";
import { AuthSQL } from "./auth.sql";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const register = async (payload: RegisterPayload) => {
  const { name, email, password } = payload;

  const existingUser = await pool.query(AuthSQL.findUserByEmail, [email]);

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await pool.query(AuthSQL.createUser, [
    name,
    email,
    hashedPassword,
    "user",
  ]);

  const user = createdUser.rows[0];

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

const login = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const result = await pool.query(AuthSQL.findUserByEmail, [email]);

  if (result.rows.length === 0) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = result.rows[0];

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  delete user.password;

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

const getMe = async (userId: number) => {
  const result = await pool.query(AuthSQL.getMe, [userId]);

  if (result.rows.length === 0) {
    throw new ApiError(404, "User not found");
  }

  return result.rows[0];
};

export const AuthService = {
  register,
  login,
  getMe,
};
