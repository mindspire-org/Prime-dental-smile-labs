import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const accessSecret = () => process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me";
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, accessSecret(), { expiresIn: "15m" });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, refreshSecret(), { expiresIn: "30d" });
}

export async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.access_token || "";
    const header = req.headers.authorization || "";
    const headerToken = header.startsWith("Bearer ") ? header.slice(7) : "";
    const token = cookieToken || headerToken;
    if (!token) return res.status(401).json({ error: "Authentication required" });

    const payload = jwt.verify(token, accessSecret());
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokens");
    if (!user || !user.active) return res.status(401).json({ error: "Invalid account" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

// New permission-based middleware
export function requirePermission(permissionKey) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      
      const hasPermission = await req.user.hasPermission(permissionKey);
      if (!hasPermission) return res.status(403).json({ error: "Insufficient permissions" });
      
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ error: "Permission check failed" });
    }
  };
}

// Middleware to check if user can set specific status
export function requireStatusPermission(status, action = "set") {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      
      if (action === "set") {
        const canSet = await req.user.canSetStatus(status);
        if (!canSet) return res.status(403).json({ error: `Cannot set status to "${status}"` });
      } else if (action === "view") {
        const canView = await req.user.canViewStatus(status);
        if (!canView) return res.status(403).json({ error: `Cannot view status "${status}"` });
      }
      
      next();
    } catch (error) {
      console.error("Status permission check error:", error);
      res.status(500).json({ error: "Status permission check failed" });
    }
  };
}

// Middleware to check if user can access specific case
export function requireCaseAccess(action = "view") {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      
      // Admin can access all cases
      if (req.user.role === "admin") return next();
      
      // For other roles, check specific permissions
      const caseId = req.params.id || req.params.caseId;
      if (!caseId) return res.status(400).json({ error: "Case ID required" });
      
      const { Case } = await import("../models/index.js");
      const case_ = await Case.findById(caseId);
      
      if (!case_) return res.status(404).json({ error: "Case not found" });
      
      // Check if user owns the case (for dentists)
      if (req.user.role === "dentist" && case_.dentist?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Access denied to this case" });
      }
      
      // Check specific action permissions
      if (action === "update") {
        const hasUpdatePermission = await req.user.hasPermission(
          req.user.role === "dentist" ? "cases.update.own" : "cases.update.all"
        );
        if (!hasUpdatePermission) return res.status(403).json({ error: "Cannot update this case" });
      }
      
      req.case = case_;
      next();
    } catch (error) {
      console.error("Case access check error:", error);
      res.status(500).json({ error: "Case access check failed" });
    }
  };
}

// Enhanced role middleware that also checks sub-roles
export function requireRoleWithSubRole(role, subRole = null) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    
    if (subRole && req.user.subRole !== subRole) {
      return res.status(403).json({ error: "Forbidden: Sub-role mismatch" });
    }
    
    next();
  };
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}
