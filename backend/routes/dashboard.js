import express from "express";
import { Case } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = express.Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res) => {
  const filter = req.user.role === "dentist" ? { dentist: req.user._id } : {};
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalCases,
    activeCases,
    awaitingAction,
    dispatchedThisMonth,
    completedCases,
    thisMonth,
    urgentCases,
    overdueCases,
    upcomingDue,
    awaitingApproval,
    inProduction,
    casesByStatus,
    recentCases,
  ] = await Promise.all([
    Case.countDocuments(filter),
    Case.countDocuments({ ...filter, status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ ...filter, status: "Awaiting Information" }),
    Case.countDocuments({ ...filter, status: "Dispatched", updatedAt: { $gte: monthStart } }),
    Case.countDocuments({ ...filter, status: "Completed" }),
    Case.countDocuments({ ...filter, createdAt: { $gte: monthStart } }),
    Case.countDocuments({ ...filter, urgency: { $in: ["Express", "Urgent"] }, status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ ...filter, requestedCompletion: { $lt: now }, status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ ...filter, requestedCompletion: { $gte: now, $lte: weekFromNow }, status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ ...filter, status: "Dentist Approval" }),
    Case.countDocuments({ ...filter, status: { $in: ["In Production", "Finishing", "Quality Control"] } }),
    Case.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Case.find(filter).populate("dentist", "name email").populate("clinic").sort({ createdAt: -1 }).limit(10),
  ]);

  res.json({
    stats: {
      totalCases,
      activeCases,
      awaitingAction,
      dispatchedThisMonth,
      completedCases,
      thisMonth,
      urgentCases,
      overdueCases,
      upcomingDue,
      awaitingApproval,
      inProduction,
      byStatus: Object.fromEntries(casesByStatus.map(({ _id, count }) => [_id, count])),
    },
    recentCases,
  });
});
