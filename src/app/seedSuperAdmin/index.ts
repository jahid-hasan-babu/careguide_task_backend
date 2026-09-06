import bcrypt from "bcrypt";
import config from "../../config";
import User from "../modules/user/user.model";

const seedSuperAdmin = async () => {
  const email = config.super_admin_email as string;
  const password = config.super_admin_password as string;

  const existing = await User.findOne({ email });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

  await User.create({
    fullName: "Super Admin",
    email,
    password: hashedPassword,
    role: "ADMIN",
    interests: [],
  });

  console.log("✅ Super admin seeded successfully.");
};

export default seedSuperAdmin;
