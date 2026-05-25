import express from "express";
import { PageView, Case, User } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { clients } from "../services/realtime.js";

export const analyticsRouter = express.Router();
analyticsRouter.use(requireAuth, requireRole("admin", "lab_staff"));

analyticsRouter.get("/realtime", async (req, res) => {
  const now = new Date();
  const since = new Date(now - 5 * 60 * 1000);

  const [recentViews, activeConnections] = await Promise.all([
    PageView.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$path", count: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
      { $project: { path: "$_id", views: "$count", visitors: { $size: "$sessions" } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]),
    Promise.resolve(clients.size),
  ]);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [viewsToday, casesToday, usersToday] = await Promise.all([
    PageView.countDocuments({ createdAt: { $gte: todayStart } }),
    Case.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
  ]);

  res.json({ activeConnections, recentPages: recentViews, today: { views: viewsToday, cases: casesToday, users: usersToday } });
});

analyticsRouter.get("/pageviews", async (req, res) => {
  const days = Math.min(Number(req.query.days || 30), 90);
  const from = new Date(Date.now() - days * 86400000);

  const [daily, topPages, topReferrers] = await Promise.all([
    PageView.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: {
        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" }, d: { $dayOfMonth: "$createdAt" } },
        views: { $sum: 1 }, sessions: { $addToSet: "$sessionId" },
      }},
      { $project: { date: { $dateFromParts: { year: "$_id.y", month: "$_id.m", day: "$_id.d" } }, views: 1, visitors: { $size: "$sessions" } } },
      { $sort: { date: 1 } },
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } }, { $limit: 10 },
      { $project: { path: "$_id", views: 1, _id: 0 } },
    ]),
    PageView.aggregate([
      { $match: { createdAt: { $gte: from }, referrer: { $ne: "" } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
      { $project: { referrer: "$_id", count: 1, _id: 0 } },
    ]),
  ]);

  const totalViews = daily.reduce((s, d) => s + d.views, 0);
  const totalVisitors = daily.reduce((s, d) => s + d.visitors, 0);

  res.json({ daily, topPages, topReferrers, totals: { views: totalViews, visitors: totalVisitors, days } });
});

analyticsRouter.get("/sla", async (req, res) => {
  const threshold = Number(req.query.days || 7);
  const cutoff = new Date(Date.now() - threshold * 86400000);

  const staleCases = await Case.find({
    status: { $nin: ["Dispatched", "Completed"] },
    updatedAt: { $lt: cutoff },
  }).populate("dentist", "name email").sort({ updatedAt: 1 }).limit(50);

  res.json({ staleCases, threshold });
});

analyticsRouter.get("/funnel", async (req, res) => {
  const days = Number(req.query.days || 30);
  const from = new Date(Date.now() - days * 86400000);

  const [submitViews, casesCreated] = await Promise.all([
    PageView.countDocuments({ path: "/submit", createdAt: { $gte: from } }),
    Case.countDocuments({ createdAt: { $gte: from } }),
  ]);

  const conversionRate = submitViews > 0 ? Math.round((casesCreated / submitViews) * 100) : 0;
  res.json({ submitPageViews: submitViews, casesCreated, conversionRate, days });
});

