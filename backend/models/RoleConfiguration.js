import mongoose from "mongoose";

const roleConfigurationSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true,
    enum: ["admin", "lab_staff", "dentist"],
    index: true 
  },
  subRole: { 
    type: String, 
    enum: ["production", "design", "dispatch"],
    index: true 
  },
  permissions: [{ type: String }], // Array of permission keys
  statusPermissions: [{
    status: { type: String, required: true },
    canSet: { type: Boolean, default: false },
    canView: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { 
  timestamps: true,
  // Ensure unique role/subRole combinations
  index: { role: 1, subRole: 1 }, 
  unique: true 
});

// Static method to get role configuration
roleConfigurationSchema.statics.getConfiguration = async function(role, subRole = null) {
  const query = { role, isActive: true };
  if (subRole) {
    query.subRole = subRole;
  } else {
    query.subRole = { $exists: false };
  }
  
  return this.findOne(query);
};

// Static method to get all configurations
roleConfigurationSchema.statics.getAllConfigurations = async function() {
  return this.find({ isActive: true }).sort({ role: 1, subRole: 1 });
};

// Static method to get configurations by role
roleConfigurationSchema.statics.getConfigurationsByRole = async function(role) {
  return this.find({ role, isActive: true }).sort({ subRole: 1 });
};

// Static method to initialize default configurations
roleConfigurationSchema.statics.initializeDefaultConfigurations = async function() {
  const defaultConfigs = [
    // Admin - full access
    {
      role: "admin",
      permissions: [
        "cases.view", "cases.create", "cases.update.own", "cases.update.all", "cases.delete",
        "cases.status.submitted", "cases.status.review", "cases.status.approved", "cases.status.rejected",
        "cases.status.in_production", "cases.status.quality_check", "cases.status.ready", 
        "cases.status.dispatched", "cases.status.delivered",
        "users.view", "users.create", "users.update", "users.delete", "users.reset_password", "users.assign_roles",
        "settings.view", "settings.update", "settings.email_templates", "settings.roles",
        "analytics.view", "analytics.reports", "analytics.export",
        "content.pages.view", "content.pages.edit", "content.posts.view", "content.posts.edit",
        "content.media.view", "content.media.upload", "content.media.delete", "content.seo",
        "system.activity_log", "system.backups", "system.maintenance"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: true, canView: true },
        { status: "Under Review", canSet: true, canView: true },
        { status: "Approved", canSet: true, canView: true },
        { status: "Rejected", canSet: true, canView: true },
        { status: "In Production", canSet: true, canView: true },
        { status: "Quality Check", canSet: true, canView: true },
        { status: "Ready for Dispatch", canSet: true, canView: true },
        { status: "Dispatched", canSet: true, canView: true },
        { status: "Delivered", canSet: true, canView: true }
      ]
    },
    // Lab Staff - general access
    {
      role: "lab_staff",
      permissions: [
        "cases.view", "cases.update.all",
        "cases.status.review", "cases.status.approved", "cases.status.rejected",
        "analytics.view",
        "content.media.view", "content.media.upload"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: false, canView: true },
        { status: "Under Review", canSet: true, canView: true },
        { status: "Approved", canSet: true, canView: true },
        { status: "Rejected", canSet: true, canView: true },
        { status: "In Production", canSet: false, canView: true },
        { status: "Quality Check", canSet: false, canView: true },
        { status: "Ready for Dispatch", canSet: false, canView: true },
        { status: "Dispatched", canSet: false, canView: true },
        { status: "Delivered", canSet: false, canView: true }
      ]
    },
    // Lab Staff - Production sub-role
    {
      role: "lab_staff",
      subRole: "production",
      permissions: [
        "cases.view", "cases.update.all",
        "cases.status.in_production", "cases.status.quality_check", "cases.status.ready",
        "analytics.view",
        "content.media.view", "content.media.upload"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: false, canView: true },
        { status: "Under Review", canSet: false, canView: true },
        { status: "Approved", canSet: false, canView: true },
        { status: "Rejected", canSet: false, canView: true },
        { status: "In Production", canSet: true, canView: true },
        { status: "Quality Check", canSet: true, canView: true },
        { status: "Ready for Dispatch", canSet: true, canView: true },
        { status: "Dispatched", canSet: false, canView: true },
        { status: "Delivered", canSet: false, canView: true }
      ]
    },
    // Lab Staff - Design sub-role
    {
      role: "lab_staff",
      subRole: "design",
      permissions: [
        "cases.view", "cases.update.all",
        "cases.status.review", "cases.status.approved", "cases.status.rejected",
        "analytics.view",
        "content.media.view", "content.media.upload"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: false, canView: true },
        { status: "Under Review", canSet: true, canView: true },
        { status: "Approved", canSet: true, canView: true },
        { status: "Rejected", canSet: true, canView: true },
        { status: "In Production", canSet: false, canView: true },
        { status: "Quality Check", canSet: false, canView: true },
        { status: "Ready for Dispatch", canSet: false, canView: true },
        { status: "Dispatched", canSet: false, canView: true },
        { status: "Delivered", canSet: false, canView: true }
      ]
    },
    // Lab Staff - Dispatch sub-role
    {
      role: "lab_staff",
      subRole: "dispatch",
      permissions: [
        "cases.view", "cases.update.all",
        "cases.status.dispatched", "cases.status.delivered",
        "analytics.view",
        "content.media.view", "content.media.upload"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: false, canView: true },
        { status: "Under Review", canSet: false, canView: true },
        { status: "Approved", canSet: false, canView: true },
        { status: "Rejected", canSet: false, canView: true },
        { status: "In Production", canSet: false, canView: true },
        { status: "Quality Check", canSet: false, canView: true },
        { status: "Ready for Dispatch", canSet: true, canView: true },
        { status: "Dispatched", canSet: true, canView: true },
        { status: "Delivered", canSet: true, canView: true }
      ]
    },
    // Dentist - limited access
    {
      role: "dentist",
      permissions: [
        "cases.view", "cases.create", "cases.update.own",
        "cases.status.submitted"
      ],
      statusPermissions: [
        { status: "Submitted", canSet: true, canView: true },
        { status: "Under Review", canSet: false, canView: true },
        { status: "Approved", canSet: false, canView: true },
        { status: "Rejected", canSet: false, canView: true },
        { status: "In Production", canSet: false, canView: true },
        { status: "Quality Check", canSet: false, canView: true },
        { status: "Ready for Dispatch", canSet: false, canView: true },
        { status: "Dispatched", canSet: false, canView: true },
        { status: "Delivered", canSet: false, canView: true }
      ]
    }
  ];

  for (const config of defaultConfigs) {
    await this.findOneAndUpdate(
      { role: config.role, subRole: config.subRole },
      config,
      { upsert: true, new: true }
    );
  }
};

// Method to check if role has specific permission
roleConfigurationSchema.methods.hasPermission = function(permissionKey) {
  return this.permissions.includes(permissionKey);
};

// Method to check if role can set specific status
roleConfigurationSchema.methods.canSetStatus = function(status) {
  const statusPerm = this.statusPermissions.find(sp => sp.status === status);
  return statusPerm ? statusPerm.canSet : false;
};

// Method to check if role can view specific status
roleConfigurationSchema.methods.canViewStatus = function(status) {
  const statusPerm = this.statusPermissions.find(sp => sp.status === status);
  return statusPerm ? statusPerm.canView : false;
};

export const RoleConfiguration = mongoose.models.RoleConfiguration || mongoose.model("RoleConfiguration", roleConfigurationSchema);
