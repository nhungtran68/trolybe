import { previewAssistants } from './preview-store.mjs';

export type Assistant = { id: string; slug: string; name: string; description: string; image_url: string; category: string; tool_type: string | null };
export type Catalogue = { items: Assistant[]; mode: 'preview' | 'live' | 'error' };

export async function getAssistants(): Promise<Catalogue> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // A partially configured or broken live connection must never silently show stale sample data.
  if (!url && !key) {
    try { return { items: previewAssistants() as Assistant[], mode: 'preview' }; }
    catch { return { items: [], mode: 'error' }; }
  }
  if (!url || !key) return { items: [], mode: 'error' };
  try {
    const response = await fetch(`${url}/rest/v1/assistants?select=id,slug,name,description,image_url,category,tool_type&status=eq.published&order=sort_order.asc`, {
      headers: { apikey: key }, cache: 'no-store',
    });
    if (!response.ok) throw new Error('Catalogue unavailable');
    return { items: await response.json() as Assistant[], mode: 'live' };
  } catch { return { items: [], mode: 'error' }; }
}

