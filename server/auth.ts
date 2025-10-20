import bcrypt from "bcryptjs";

// بيانات المسؤول الافتراضية
const ADMIN_USERNAME = "Harth";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("Harth12", 10);

export interface AdminUser {
  id: string;
  username: string;
  role: "admin";
}

export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<AdminUser | null> {
  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return {
      id: "admin-1",
      username: ADMIN_USERNAME,
      role: "admin",
    };
  }
  return null;
}

