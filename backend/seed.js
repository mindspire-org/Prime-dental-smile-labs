import "dotenv/config";
import { connectDatabase } from "./db.js";
import { Clinic, User } from "./models/index.js";

await connectDatabase();

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@primesmile.local";
const dentistEmail = process.env.SEED_DENTIST_EMAIL || "dentist@primesmile.local";
const password = process.env.SEED_PASSWORD || "PrimeSmile123!";

const clinic = await Clinic.findOneAndUpdate(
  { name: "Demo Dental Clinic" },
  { name: "Demo Dental Clinic", city: "London", country: "United Kingdom", email: dentistEmail },
  { upsert: true, returnDocument: "after" },
);

for (const account of [
  { name: "Prime Smile Admin", email: adminEmail, role: "admin" },
  { name: "Dr. Demo Dentist", email: dentistEmail, role: "dentist", clinic: clinic._id },
  { name: "Gokan", email: "gokan@primesmile.local", role: "lab_staff" },
  { name: "Abdurahman", email: "abdurahman@primesmile.local", role: "lab_staff" },
  { name: "Lab Technician", email: "labtech@primesmile.local", role: "lab_staff" },
]) {
  const existing = await User.findOne({ email: account.email });
  if (!existing) {
    await User.create({ ...account, passwordHash: await User.hashPassword(password) });
    console.log(`Created ${account.role}: ${account.email}`);
  } else {
    console.log(`Exists: ${account.email}`);
  }
}

console.log(`Seed password: ${password}`);
process.exit(0);
