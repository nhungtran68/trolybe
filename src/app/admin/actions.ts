"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateAssistant } from "@/lib/assistant-validation.mjs";

export async function saveAssistant(form: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect('/dang-nhap?status=config');
  const {data: {user}, error: authError} = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.school_role !== 'admin') redirect('/dang-nhap');
  const id = String(form.get('id') || '');
  const entry = validateAssistant(Object.fromEntries(form.entries()));
  if (!entry || (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) redirect('/admin?result=invalid');
  const query = id ? supabase.from('assistants').update(entry).eq('id', id) : supabase.from('assistants').insert(entry);
  const {data, error} = await query.select('id').single();
  if (error || !data) redirect('/admin?result=error');
  revalidatePath('/'); revalidatePath('/admin');
  redirect('/admin?result=saved');
}

export async function duplicateAssistant(form: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect('/dang-nhap?status=config');
  const {data: {user}, error: authError} = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.school_role !== 'admin') redirect('/dang-nhap');
  const id = String(form.get('id') || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) redirect('/admin?result=invalid');
  const {data: original, error: readError} = await supabase.from('assistants').select('name,slug,description,category,image_url,sort_order,tool_type').eq('id',id).single();
  if (readError || !original) redirect('/admin?result=error');
  const slugBase = original.slug.slice(0, 90).replace(/-+$/, '');
  const entry = validateAssistant({...original, slug: `${slugBase}-${crypto.randomUUID().slice(0,8)}`, name: `${original.name.slice(0,90)} (bản sao)`, status:'draft'});
  if (!entry) redirect('/admin?result=error');
  const {error} = await supabase.from('assistants').insert(entry);
  if (error) redirect('/admin?result=error');
  revalidatePath('/admin');
  redirect('/admin?result=duplicated');
}
