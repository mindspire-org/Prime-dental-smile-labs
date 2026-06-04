import express from "express";
import { Permission, RoleConfiguration, User } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";

export const rolesRouter = express.Router();
rolesRouter.use(requireAuth, requireRole("admin"));

// Get all permissions
rolesRouter.get("/permissions", async (req, res) => {
  try {
    const permissions = await Permission.getAllPermissions();
    
    // Group by category
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    }, {});
    
    res.json({ permissions: grouped });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

// Get current role configuration
rolesRouter.get("/config", async (req, res) => {
  try {
    const configs = await RoleConfiguration.getAllConfigurations();
    const permissions = await Permission.getAllPermissions();
    
    // Group configurations by role
    const grouped = configs.reduce((acc, config) => {
      const key = config.subRole ? `${config.role}:${config.subRole}` : config.role;
      acc[key] = config;
      return acc;
    }, {});
    
    res.json({ 
      configurations: grouped,
      permissions: permissions.reduce((acc, perm) => {
        acc[perm.key] = perm;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("Error fetching role configuration:", error);
    res.status(500).json({ error: "Failed to fetch role configuration" });
  }
});

// Update role configuration
rolesRouter.put("/config", async (req, res) => {
  try {
    const { role, subRole, permissions, statusPermissions } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    
    // Validate permissions exist
    const allPermissions = await Permission.getAllPermissions();
    const permissionKeys = allPermissions.map(p => p.key);
    const invalidPermissions = permissions.filter(p => !permissionKeys.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({ 
        error: "Invalid permissions", 
        invalidPermissions 
      });
    }
    
    const config = await RoleConfiguration.findOneAndUpdate(
      { role, subRole },
      { 
        permissions, 
        statusPermissions, 
        updatedBy: req.user._id 
      },
      { upsert: true, new: true, returnDocument: "after" }
    );
    
    await logActivity({ 
      actor: req.user._id, 
      action: "role_configuration.updated", 
      entityType: "RoleConfiguration", 
      entityId: config._id, 
      metadata: { role, subRole, permissionCount: permissions.length } 
    });
    
    res.json({ 
      message: "Role configuration updated successfully",
      configuration: config
    });
  } catch (error) {
    console.error("Error updating role configuration:", error);
    res.status(500).json({ error: "Failed to update role configuration" });
  }
});

// Get status permissions for all roles
rolesRouter.get("/status-permissions", async (req, res) => {
  try {
    const configs = await RoleConfiguration.getAllConfigurations();
    
    // Create status permission matrix
    const statusMatrix = {};
    const statuses = [
      "Submitted", "Under Review", "Approved", "Rejected",
      "In Production", "Quality Check", "Ready for Dispatch", 
      "Dispatched", "Delivered"
    ];
    
    configs.forEach(config => {
      const key = config.subRole ? `${config.role}:${config.subRole}` : config.role;
      statusMatrix[key] = {};
      
      statuses.forEach(status => {
        const statusPerm = config.statusPermissions.find(sp => sp.status === status);
        statusMatrix[key][status] = {
          canSet: statusPerm ? statusPerm.canSet : false,
          canView: statusPerm ? statusPerm.canView : true
        };
      });
    });
    
    res.json({ statusMatrix, statuses });
  } catch (error) {
    console.error("Error fetching status permissions:", error);
    res.status(500).json({ error: "Failed to fetch status permissions" });
  }
});

// Test user permissions
rolesRouter.post("/test-permissions", async (req, res) => {
  try {
    const { userId, permissionKeys } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const results = {};
    for (const permissionKey of permissionKeys) {
      results[permissionKey] = await user.hasPermission(permissionKey);
    }
    
    // Get user's effective permissions
    const effectivePermissions = await user.getEffectivePermissions();
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subRole: user.subRole
      },
      testResults: results,
      effectivePermissions
    });
  } catch (error) {
    console.error("Error testing permissions:", error);
    res.status(500).json({ error: "Failed to test permissions" });
  }
});

// Initialize default permissions and configurations
rolesRouter.post("/initialize", async (req, res) => {
  try {
    await Permission.initializeDefaultPermissions();
    await RoleConfiguration.initializeDefaultConfigurations();
    
    await logActivity({ 
      actor: req.user._id, 
      action: "roles_permissions.initialized", 
      entityType: "System", 
      entityId: "roles_permissions"
    });
    
    res.json({ 
      message: "Default permissions and role configurations initialized successfully" 
    });
  } catch (error) {
    console.error("Error initializing roles and permissions:", error);
    res.status(500).json({ error: "Failed to initialize roles and permissions" });
  }
});

// Get user role summary
rolesRouter.get("/user-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('clinic', 'name');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const config = await RoleConfiguration.getConfiguration(user.role, user.subRole);
    const effectivePermissions = await user.getEffectivePermissions();
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
        clinic: user.clinic,
        active: user.active
      },
      configuration: config,
      effectivePermissions,
      permissionCount: effectivePermissions.length
    });
  } catch (error) {
    console.error("Error fetching user role summary:", error);
    res.status(500).json({ error: "Failed to fetch user role summary" });
  }
});

// Update user role and permissions
rolesRouter.put("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, subRole, permissions } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Validate role and subRole combination
    if (role === "lab_staff" && subRole) {
      const validSubRoles = ["production", "design", "dispatch"];
      if (!validSubRoles.includes(subRole)) {
        return res.status(400).json({ error: "Invalid sub-role for lab_staff" });
      }
    } else if (role !== "lab_staff" && subRole) {
      return res.status(400).json({ error: "Sub-role only allowed for lab_staff" });
    }
    
    // Validate permissions if provided
    if (permissions && permissions.length > 0) {
      const allPermissions = await Permission.getAllPermissions();
      const permissionKeys = allPermissions.map(p => p.key);
      const invalidPermissions = permissions.filter(p => !permissionKeys.includes(p));
      
      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          error: "Invalid permissions", 
          invalidPermissions 
        });
      }
    }
    
    const oldRole = user.role;
    const oldSubRole = user.subRole;
    
    user.role = role;
    user.subRole = subRole || undefined;
    if (permissions) {
      user.permissions = permissions;
    }
    
    await user.save();
    
    await logActivity({ 
      actor: req.user._id, 
      action: "user.role_updated", 
      entityType: "User", 
      entityId: user._id, 
      metadata: { 
        oldRole, 
        newRole: role, 
        oldSubRole, 
        newSubRole: subRole,
        permissionCount: permissions ? permissions.length : 0
      } 
    });
    
    res.json({ 
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        subRole: user.subRole,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});
