export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
  interests?: string[];
}

export interface IUserLogin {
  email: string;
  password: string;
}
