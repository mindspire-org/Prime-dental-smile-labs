import mongoose from "mongoose";

export const CASE_STATUSES = [
  "Submitted",
  "File Review",
  "Awaiting Information",
  "Design Stage",
  "Dentist Approval",
  "In Production",
  "Finishing",
  "Quality Control",
  "Ready for Dispatch",
  "Dispatched",
  "Completed",
];

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, required: true, unique: true, index: true },
    dentist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", index: true },
    patientRef: { type: String, required: true },
    clinicReference: String,
    patientGender: String,
    patientAge: Number,
    services: [String],
    teeth: mongoose.Schema.Types.Mixed,
    material: String,
    shade: {
      system: String,
      body: String,
      cervical: String,
      incisal: String,
    },
    implant: mongoose.Schema.Types.Mixed,
    shipping: mongoose.Schema.Types.Mixed,
    notes: String,
    urgency: { type: String, enum: ["Standard", "Express", "Urgent"], default: "Standard" },
    requestedCompletion: Date,
    status: { type: String, enum: CASE_STATUSES, default: "Submitted", index: true },
    statusHistory: [
      {
        status: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "LabFile" }],
  },
  { timestamps: true },
);

caseSchema.pre("validate", async function ensureCaseNumber() {
  if (this.caseNumber) return;

  const year = new Date().getFullYear();
  const count = await mongoose.models.Case.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
  this.caseNumber = `PSDL-UK-${year}-${String(count + 1).padStart(4, "0")}`;
});

export const Case = mongoose.models.Case || mongoose.model("Case", caseSchema);
