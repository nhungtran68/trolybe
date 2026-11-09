"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function authenticate(form: FormData) {
  const client = await createClient();
  if (!client) redirect("/dang-nhap?status=config");
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || password.length < 8) redirect("/dang-nhap?status=invalid");
  if (form.get("action") === "signup") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) redirect("/dang-nhap?status=config");
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: new URL("/auth/callback", siteUrl).toString() } });
    if (error) redirect("/dang-nhap?status=signup-error");
    if (!data.session) redirect("/dang-nhap?status=check-email");
  } else {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) redirect("/dang-nhap?status=login-error");
  }
  redirect("/tai-khoan");
}
export async function signOut() {
  const client = await createClient();
  if (client) await client.auth.signOut();
  redirect("/");
}
