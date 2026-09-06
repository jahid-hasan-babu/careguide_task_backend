import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { UserRole } from "../modules/user/user.interface";


const ALGORITHM = "HS256" as const;


export interface IAccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export interface IRefreshTokenPayload extends JwtPayload {
  sub: string;
  type: "refresh";
}

export interface IResetPasswordPayload extends JwtPayload {
  sub: string;
  type: "reset_password";
}

const generateAccessToken = (userId: string, role: UserRole): string => {
  const secret = config.jwt.access_secret as Secret;
  const expiresIn = (config.jwt.access_expires_in as string) ?? "15m";

  const payload = { sub: userId, role };
  const options: SignOptions = { algorithm: ALGORITHM, expiresIn } as any;
  return jwt.sign(payload, secret, options);
};

const verifyAccessToken = (token: string): IAccessTokenPayload => {
  const secret = config.jwt.access_secret as Secret;
  return jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as IAccessTokenPayload;
};

const generateRefreshToken = (userId: string): string => {
  const secret = config.jwt.refresh_secret as Secret;
  const expiresIn = (config.jwt.refresh_expires_in as string) ?? "7d";

  const payload = { sub: userId, type: "refresh" };
  const options: SignOptions = { algorithm: ALGORITHM, expiresIn } as any;
  return jwt.sign(payload, secret, options);
};

const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  const secret = config.jwt.refresh_secret as Secret;
  const decoded = jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as IRefreshTokenPayload;

  if (decoded.type !== "refresh") {
    throw new jwt.JsonWebTokenError("Invalid token type");
  }

  return decoded;
};

const generateResetPasswordToken = (userId: string): string => {
  const secret = (config.jwt.reset_pass_secret || config.jwt.access_secret) as Secret;
  const expiresIn = (config.jwt.reset_pass_expires_in as string) ?? "10m";

  const payload = { sub: userId, type: "reset_password" };
  const options: SignOptions = { algorithm: ALGORITHM, expiresIn } as any;
  return jwt.sign(payload, secret, options);
};

const verifyResetPasswordToken = (token: string): IResetPasswordPayload => {
  const secret = (config.jwt.reset_pass_secret || config.jwt.access_secret) as Secret;
  const decoded = jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as IResetPasswordPayload;

  if (decoded.type !== "reset_password") {
    throw new jwt.JsonWebTokenError("Invalid token type: expected password reset token");
  }

  return decoded;
};

const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, { expiresIn, algorithm: ALGORITHM } as any);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret, { algorithms: [ALGORITHM] }) as JwtPayload;
};

export const jwtHelpers = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetPasswordToken,
  verifyResetPasswordToken,
  generateToken,
  verifyToken,
};
