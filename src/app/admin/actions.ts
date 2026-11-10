"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateAssistant } from "@/lib/assistant-validation.mjs";
import { validateAssistantConfig } from "@/lib/ai-validation.mjs";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect('/dang-nhap?status=config');
  const {data: {user}, error: authError} = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.school_role !== 'admin') redirect('/dang-nhap');
  return { supabase, user };
}

export async function saveAssistant(form: FormData) {
  const {supabase} = await requireAdmin();
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
  const {supabase, user} = await requireAdmin();
  const id = String(form.get('id') || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) redirect('/admin?result=invalid');
  const {data: original, error: readError} = await supabase.from('assistants').select('name,slug,description,category,image_url,sort_order,tool_type').eq('id',id).single();
  if (readError || !original) redirect('/admin?result=error');
  const slugBase = original.slug.slice(0, 90).replace(/-+$/, '');
  const entry = validateAssistant({...original, slug: `${slugBase}-${crypto.randomUUID().slice(0,8)}`, name: `${original.name.slice(0,90)} (bản sao)`, status:'draft'});
  if (!entry) redirect('/admin?result=error');
  const {data: copy, error} = await supabase.from('assistants').insert(entry).select('id').single();
  if (error || !copy) redirect('/admin?result=error');
  const {data: config} = await supabase.from('assistant_configs').select('system_prompt,greeting,teaching_guidance,forbidden_content,provider,model,reasoning_effort,max_output_tokens,daily_request_limit,input_cost_microusd_per_million,output_cost_microusd_per_million').eq('assistant_id',id).eq('active',true).maybeSingle();
  if (config) {
    const {error: configError} = await supabase.from('assistant_configs').insert({...config,assistant_id:copy.id,version:1,active:true,created_by:user.id});
    if (configError) redirect('/admin?result=partial');
  }
  revalidatePath('/admin');
  redirect('/admin?result=duplicated');
}

export async function saveAssistantConfig(form: FormData) {
  const {supabase, user} = await requireAdmin();
  const entry = validateAssistantConfig(Object.fromEntries(form.entries()));
  if (!entry) redirect('/admin?result=config-invalid');
  const {data: assistant} = await supabase.from('assistants').select('id').eq('id',entry.assistant_id).single();
  if (!assistant) redirect('/admin?result=error');
  const {data: latest} = await supabase.from('assistant_configs').select('id,version').eq('assistant_id',entry.assistant_id).order('version',{ascending:false}).limit(1).maybeSingle();
  if (latest) {
    const {error} = await supabase.from('assistant_configs').update({active:false}).eq('assistant_id',entry.assistant_id).eq('active',true);
    if (error) redirect('/admin?result=error');
  }
  const {error} = await supabase.from('assistant_configs').insert({
    ...entry, version:(latest?.version ?? 0)+1, active:true, created_by:user.id,
  });
  if (error) {
    if (latest) await supabase.from('assistant_configs').update({active:true}).eq('id',latest.id);
    redirect('/admin?result=error');
  }
  revalidatePath('/admin'); revalidatePath(`/tro-ly/${String(form.get('slug') || '')}`);
  redirect('/admin?result=config-saved');
}
