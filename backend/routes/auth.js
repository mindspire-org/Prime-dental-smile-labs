import crypto from "node:crypto";
import express from "express";
import { z } from "zod";
import { User, Clinic } from "../models/index.js";
import { requireAuth, signAccessToken, signRefreshToken, verifyRefreshToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { sendEmail, sendWelcomeEmail } from "../services/email.js";
import { logActivity } from "../services/activity.js";

export const authRouter = express.Router();

const loginSchema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) });

const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).optional(),
    role: z.enum(["admin", "lab_staff", "dentist"]).default("dentist"),
    clinicName: z.string().optional(),
    phone: z.string().optional(),
    gdcNumber: z.string().optional(),
  }),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
};

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  if (refreshToken) res.cookie("refresh_token", refreshToken, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.active || !(await user.verifyPassword(password))) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  await logActivity({ actor: user._id, action: "auth.login", entityType: "User", entityId: user._id });

  setAuthCookies(res, accessToken, refreshToken);
  res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, clinic: user.clinic } });
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokens.some((item) => item.token === refreshToken)) return res.status(401).json({ error: "Invalid refresh token" });
    const accessToken = signAccessToken(user);
    res.cookie("access_token", accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
  if (refreshToken) {
    await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { token: refreshToken } } });
  }
  res.clearCookie("access_token", { ...COOKIE_OPTS });
  res.clearCookie("refresh_token", { ...COOKIE_OPTS });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-passwordHash -refreshTokens").populate("clinic");
  res.json({ user });
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const allowed = ["name", "phone", "gdcNumber"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-passwordHash -refreshTokens").populate("clinic");
  await logActivity({ actor: req.user._id, action: "user.profile_updated", entityType: "User", entityId: user._id });
  res.json({ user });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const user = await User.findById(req.user._id);
  if (!(await user.verifyPassword(currentPassword))) return res.status(401).json({ error: "Current password is incorrect" });

  user.passwordHash = await User.hashPassword(newPassword);
  user.refreshTokens = [];
  await user.save();
  await logActivity({ actor: user._id, action: "auth.password_changed", entityType: "User", entityId: user._id });
  res.json({ ok: true });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.APP_URL || "http://localhost:8080"}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Prime Smile password",
    text: `Click the link to reset your password (expires in 1 hour): ${resetUrl}`,
    html: `<p>Hi ${user.name},</p><p>Click the button below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0aabbd;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p><p style="color:#888;font-size:12px;">If you did not request this, ignore this email.</p>`,
  });

  res.json({ ok: true });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();
  await logActivity({ actor: user._id, action: "auth.password_reset", entityType: "User", entityId: user._id });
  res.json({ ok: true });
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    clinicName: z.string().min(2),
    phone: z.string().optional(),
    gdcNumber: z.string().optional(),
  }),
});

authRouter.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password, clinicName, phone, gdcNumber } = req.validated.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const clinic = await Clinic.create({ name: clinicName, email, phone });
  const user = await User.create({
    name, email: email.toLowerCase(),
    passwordHash: await User.hashPassword(password),
    role: "dentist", clinic: clinic._id, phone, gdcNumber, active: true,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push({ token: refreshToken });
  await user.save();
  await logActivity({ actor: user._id, action: "auth.register", entityType: "User", entityId: user._id });

  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, clinic: user.clinic } });
});

authRouter.post("/accounts", requireAuth, validate(createAccountSchema), async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const input = req.validated.body;
  const password = input.password || crypto.randomBytes(9).toString("base64url");
  const clinic = input.clinicName ? await Clinic.create({ name: input.clinicName, email: input.email, phone: input.phone }) : undefined;

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash: await User.hashPassword(password),
    role: input.role,
    clinic: clinic?._id,
    phone: input.phone,
    gdcNumber: input.gdcNumber,
  });

  await sendWelcomeEmail({ to: user.email, name: user.name, temporaryPassword: password });
  await logActivity({ actor: req.user._id, action: "user.created", entityType: "User", entityId: user._id });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, clinic: user.clinic }, temporaryPassword: password });
});
