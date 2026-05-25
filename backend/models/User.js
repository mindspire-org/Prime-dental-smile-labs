import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "lab_staff", "dentist"], default: "dentist", index: true },
    subRole: { type: String, enum: ["production", "design", "dispatch"] },
    permissions: [{ type: String }], // Override permissions for specific users
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    phone: String,
    gdcNumber: String,
    active: { type: Boolean, default: true },
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
    passwordResetToken: { type: String, index: { sparse: true } },
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = async function(permissionKey) {
  // Check user-specific override permissions first
  if (this.permissions && this.permissions.includes(permissionKey)) {
    return true;
  }
  
  // Check role-based permissions
  const { RoleConfiguration } = await import("./RoleConfiguration.js");
  const config = await RoleConfiguration.getConfiguration(this.role, this.subRole);
  
  if (config) {
    return config.hasPermission(permissionKey);
  }
  
  // Fallback to basic role checking for backward compatibility
  if (this.role === "admin") return true;
  if (this.role === "dentist" && permissionKey.startsWith("cases.")) return true;
  if (this.role === "lab_staff" && permissionKey.startsWith("cases.")) return true;
  
  return false;
};

// Method to check if user can set specific status
userSchema.methods.canSetStatus = async function(status) {
  const { RoleConfiguration } = await import("./RoleConfiguration.js");
  const config = await RoleConfiguration.getConfiguration(this.role, this.subRole);
  
  if (config) {
    return config.canSetStatus(status);
  }
  
  // Fallback logic
  if (this.role === "admin") return true;
  if (this.role === "dentist" && status === "Submitted") return true;
  
  return false;
};

// Method to check if user can view specific status
userSchema.methods.canViewStatus = async function(status) {
  const { RoleConfiguration } = await import("./RoleConfiguration.js");
  const config = await RoleConfiguration.getConfiguration(this.role, this.subRole);
  
  if (config) {
    return config.canViewStatus(status);
  }
  
  // All authenticated users can view all statuses by default
  return true;
};

// Method to get user's effective permissions
userSchema.methods.getEffectivePermissions = async function() {
  const { RoleConfiguration } = await import("./RoleConfiguration.js");
  const config = await RoleConfiguration.getConfiguration(this.role, this.subRole);
  
  let permissions = config ? [...config.permissions] : [];
  
  // Add user-specific override permissions
  if (this.permissions) {
    permissions = [...new Set([...permissions, ...this.permissions])];
  }
  
  return permissions;
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
