import { z } from "zod";

export const upiRegex = /^[\w.-]+@[\w.-]+$/;

export const upiIdSchema = z
  .string()
  .min(3, "UPI ID is required")
  .regex(upiRegex, "Invalid UPI ID format. Standard Indian UPI format required (e.g. username@okhdfcbank)");

export function validateUpiId(value: string): { success: boolean; error?: string } {
  const result = upiIdSchema.safeParse(value ? value.trim() : "");
  if (!result.success) {
    return { success: false, error: result.error.issues?.[0]?.message || "Invalid UPI ID format" };
  }
  return { success: true };
}
