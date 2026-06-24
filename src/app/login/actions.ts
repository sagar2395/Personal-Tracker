"use server";

import { login } from "@/lib/auth";

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const ok = await login(email, password);
  if (!ok) {
    return { success: false, error: "Invalid email or password" };
  }

  return { success: true };
}
