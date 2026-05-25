import { z } from "zod";

// Contact form validation schema
export const contactFormSchema = z.object({
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Case submission validation schema
export const caseSubmissionSchema = z.object({
  // Step 0: Dentist/Clinic Info
  clinicName: z.string().min(2, "Clinic name is required"),
  dentistName: z.string().min(2, "Dentist name is required"),
  gdcNumber: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  country: z.string().min(1, "Country is required"),
  clinicAddress: z.string().optional(),
  preferredContact: z.enum(["Email", "WhatsApp", "Phone"]),
  
  // Step 1: Patient & Case Info
  patientRef: z.string().min(1, "Patient reference is required"),
  clinicReference: z.string().optional(),
  patientGender: z.enum(["Male", "Female", "Other"]).optional(),
  patientAge: z.number().min(0).max(150).optional(),
  
  // Step 2: Services
  services: z.array(z.string()).min(1, "At least one service must be selected"),
  
  // Step 3: Teeth Chart
  teeth: z.record(z.string(), z.enum(["prepare", "temp", "scan", "implant", "extract"])).optional(),
  
  // Step 4: Material
  material: z.string().min(1, "Material selection is required"),
  
  // Step 5: Shade
  shade: z.object({
    system: z.string().optional(),
    body: z.string().optional(),
    cervical: z.string().optional(),
    incisal: z.string().optional(),
  }).optional(),
  
  // Step 6: Implant
  implant: z.object({
    brand: z.string().optional(),
    platform: z.string().optional(),
    diameter: z.string().optional(),
    length: z.string().optional(),
  }).optional(),
  
  // Step 7: Files (handled separately)
  files: z.array(z.string()).optional(),
  
  // Step 8: Shipping
  shipping: z.object({
    method: z.enum(["Standard", "Express", "Urgent"]).default("Standard"),
    address: z.string().optional(),
    instructions: z.string().optional(),
  }).optional(),
  
  // Step 9: Declaration
  declaration: z.object({
    consent: z.boolean().refine(val => val === true, "Consent is required"),
    accuracy: z.boolean().refine(val => val === true, "Accuracy confirmation is required"),
    terms: z.boolean().refine(val => val === true, "Terms acceptance is required"),
  }),
  
  // Additional fields
  urgency: z.enum(["Standard", "Express", "Urgent"]).default("Standard"),
  requestedCompletion: z.date().optional(),
  notes: z.string().optional(),
});

export type CaseSubmissionData = z.infer<typeof caseSubmissionSchema>;

// Form submission utilities
export async function submitContactForm(data: ContactFormData) {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit form");
    }

    return await response.json();
  } catch (error) {
    console.error("Contact form submission error:", error);
    throw error;
  }
}

export async function submitCaseForm(data: CaseSubmissionData, _files?: File[]) {
  // Send JSON body via apiFetch so auth token is attached automatically.
  // File uploads should be done separately via /api/files after case creation.
  const { apiFetch } = await import("@/lib/api");
  return apiFetch<{ case: any }>("/api/cases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Form validation utilities
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  
  return { success: false, errors };
}
