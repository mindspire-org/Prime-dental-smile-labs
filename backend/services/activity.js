import { ActivityLog } from "../models/index.js";

export function logActivity({ actor, action, entityType, entityId, metadata }) {
  return ActivityLog.create({ actor, action, entityType, entityId, metadata }).catch((error) => {
    console.error("Activity log failed", error);
  });
}
