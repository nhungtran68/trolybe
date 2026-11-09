import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Read-only sample catalogue; it never contains student or account data.
export function previewAssistants() {
  const db = new DatabaseSync(path.join(process.cwd(), 'data', 'preview.sqlite'), { readOnly: true });
  try {
    return db.prepare("SELECT id, slug, name, description, image_url, category, tool_type FROM assistants WHERE status = 'published' ORDER BY sort_order ASC").all();
  } finally { db.close(); }
}
