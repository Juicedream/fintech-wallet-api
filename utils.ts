import * as bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS),
  );
  return hashedPassword;
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const matchRoles = (roles: string[], role: string) => {
  return roles.includes(role.toLowerCase());
};
