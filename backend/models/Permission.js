import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["cases", "users", "settings", "analytics", "content", "system"],
    index: true 
  },
  roles: [{ type: String, enum: ["admin", "lab_staff", "dentist"] }],
  subRoles: [{ type: String, enum: ["production", "design", "dispatch"] }],
  defaultValue: { type: Boolean, default: false },
  isCore: { type: Boolean, default: false }, // Core permissions that can't be removed
}, { timestamps: true });

// Static method to get all permissions
permissionSchema.statics.getAllPermissions = async function() {
  return this.find().sort({ category: 1, key: 1 });
};

// Static method to get permissions by category
permissionSchema.statics.getPermissionsByCategory = async function(category) {
  return this.find({ category }).sort({ key: 1 });
};

// Static method to initialize default permissions
permissionSchema.statics.initializeDefaultPermissions = async function() {
  const defaultPermissions = [
    // Cases permissions
    { key: "cases.view", description: "View cases list", category: "cases", roles: ["admin", "lab_staff", "dentist"], defaultValue: true, isCore: true },
    { key: "cases.create", description: "Create new cases", category: "cases", roles: ["admin", "dentist"], defaultValue: true, isCore: true },
    { key: "cases.update.own", description: "Update own cases", category: "cases", roles: ["admin", "dentist"], defaultValue: true },
    { key: "cases.update.all", description: "Update any case", category: "cases", roles: ["admin", "lab_staff"], defaultValue: false },
    { key: "cases.delete", description: "Delete cases", category: "cases", roles: ["admin"], defaultValue: false, isCore: true },
    { key: "cases.status.submitted", description: "Set status to 'Submitted'", category: "cases", roles: ["admin", "dentist"], defaultValue: true },
    { key: "cases.status.review", description: "Set status to 'Under Review'", category: "cases", roles: ["admin", "lab_staff"], defaultValue: false },
    { key: "cases.status.approved", description: "Set status to 'Approved'", category: "cases", roles: ["admin", "lab_staff"], defaultValue: false },
    { key: "cases.status.rejected", description: "Set status to 'Rejected'", category: "cases", roles: ["admin", "lab_staff"], defaultValue: false },
    { key: "cases.status.in_production", description: "Set status to 'In Production'", category: "cases", roles: ["admin", "lab_staff"], subRoles: ["production"], defaultValue: false },
    { key: "cases.status.quality_check", description: "Set status to 'Quality Check'", category: "cases", roles: ["admin", "lab_staff"], subRoles: ["production"], defaultValue: false },
    { key: "cases.status.ready", description: "Set status to 'Ready for Dispatch'", category: "cases", roles: ["admin", "lab_staff"], subRoles: ["production"], defaultValue: false },
    { key: "cases.status.dispatched", description: "Set status to 'Dispatched'", category: "cases", roles: ["admin", "lab_staff"], subRoles: ["dispatch"], defaultValue: false },
    { key: "cases.status.delivered", description: "Set status to 'Delivered'", category: "cases", roles: ["admin", "lab_staff"], subRoles: ["dispatch"], defaultValue: false },
    
    // Users permissions
    { key: "users.view", description: "View users list", category: "users", roles: ["admin"], defaultValue: true, isCore: true },
    { key: "users.create", description: "Create new users", category: "users", roles: ["admin"], defaultValue: false, isCore: true },
    { key: "users.update", description: "Update user information", category: "users", roles: ["admin"], defaultValue: false },
    { key: "users.delete", description: "Delete users", category: "users", roles: ["admin"], defaultValue: false },
    { key: "users.reset_password", description: "Reset user passwords", category: "users", roles: ["admin"], defaultValue: false },
    { key: "users.assign_roles", description: "Assign roles to users", category: "users", roles: ["admin"], defaultValue: false },
    
    // Settings permissions
    { key: "settings.view", description: "View system settings", category: "settings", roles: ["admin"], defaultValue: true, isCore: true },
    { key: "settings.update", description: "Update system settings", category: "settings", roles: ["admin"], defaultValue: false },
    { key: "settings.email_templates", description: "Manage email templates", category: "settings", roles: ["admin"], defaultValue: false },
    { key: "settings.roles", description: "Manage roles and permissions", category: "settings", roles: ["admin"], defaultValue: false },
    
    // Analytics permissions
    { key: "analytics.view", description: "View analytics dashboard", category: "analytics", roles: ["admin", "lab_staff"], defaultValue: true },
    { key: "analytics.reports", description: "Generate detailed reports", category: "analytics", roles: ["admin"], defaultValue: false },
    { key: "analytics.export", description: "Export analytics data", category: "analytics", roles: ["admin"], defaultValue: false },
    
    // Content permissions
    { key: "content.pages.view", description: "View pages", category: "content", roles: ["admin"], defaultValue: true },
    { key: "content.pages.edit", description: "Edit pages", category: "content", roles: ["admin"], defaultValue: false },
    { key: "content.posts.view", description: "View blog posts", category: "content", roles: ["admin"], defaultValue: true },
    { key: "content.posts.edit", description: "Edit blog posts", category: "content", roles: ["admin"], defaultValue: false },
    { key: "content.media.view", description: "View media library", category: "content", roles: ["admin", "lab_staff"], defaultValue: true },
    { key: "content.media.upload", description: "Upload media files", category: "content", roles: ["admin", "lab_staff"], defaultValue: false },
    { key: "content.media.delete", description: "Delete media files", category: "content", roles: ["admin"], defaultValue: false },
    { key: "content.seo", description: "Manage SEO settings", category: "content", roles: ["admin"], defaultValue: false },
    
    // System permissions
    { key: "system.activity_log", description: "View activity log", category: "system", roles: ["admin"], defaultValue: true },
    { key: "system.backups", description: "Manage system backups", category: "system", roles: ["admin"], defaultValue: false },
    { key: "system.maintenance", description: "Access maintenance mode", category: "system", roles: ["admin"], defaultValue: false },
  ];

  for (const permission of defaultPermissions) {
    await this.findOneAndUpdate(
      { key: permission.key },
      permission,
      { upsert: true, new: true }
    );
  }
};

export const Permission = mongoose.models.Permission || mongoose.model("Permission", permissionSchema);
