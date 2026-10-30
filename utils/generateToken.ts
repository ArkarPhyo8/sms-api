import { AppError } from "@/errors/app.error";
import jwt, { type SignOptions } from "jsonwebtoken";

interface payloadType {
  uid: string;
  em: string;
  r: string;
  sid: string;
}
interface Props {
  payload: payloadType;
}
export const generateToken = ({ payload }: Props) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";

  if (!jwtSecret) {
    throw new AppError(
      "jwt secret is not defined in environment variables",
      500,
    );
  }

  const options: SignOptions = {
    expiresIn: (jwtExpiresIn as SignOptions["expiresIn"]) || "1d",

  };
  const token = jwt.sign(payload, jwtSecret, options);
  return token;
};

export const generateRefreshToken = (userId: string) => {
  const payload = { userId };
  const refresh_secret = process.env.REFRESH_SECRET;
  const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || "15m";
  if (!refresh_secret) {
    throw new AppError(
      "refresh secret is not defined in environment variables",
      500,
    );
  }

  const options: SignOptions = {
    expiresIn: (refreshExpiresIn as SignOptions["expiresIn"]) || "7d",
  };
  const token = jwt.sign(payload, refresh_secret, options);
  return token;
};
