export interface ShadeData {
  system?: string;
  body?: string;
  cervical?: string;
  incisal?: string;
}

// Returns labeled [label, value] pairs for each shade part that has a value,
// so prescriptions show which shade was selected for which part of the tooth
// (e.g. ["Body Shade", "A2"], ["Cervical Shade", "A3"], ["Incisal Shade", "A1"]).
export function shadeFields(shade?: ShadeData | null): Array<[string, string]> {
  if (!shade) return [];
  const fields: Array<[string, string]> = [];
  if (shade.system) fields.push(["Shade System", shade.system]);
  if (shade.body) fields.push(["Body Shade", shade.body]);
  if (shade.cervical) fields.push(["Cervical Shade", shade.cervical]);
  if (shade.incisal) fields.push(["Incisal Shade", shade.incisal]);
  return fields;
}

// Single-line summary with each part labeled, used where only one row is available.
export function shadeSummary(shade?: ShadeData | null): string {
  const fields = shadeFields(shade);
  if (fields.length === 0) return "—";
  return fields.map(([label, value]) => `${label}: ${value}`).join(" · ");
}
