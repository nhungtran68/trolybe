import test from 'node:test';
import assert from 'node:assert/strict';
import { previewAssistants } from '../src/lib/preview-store.mjs';

test('preview catalogue has six separate published assistants and valid local images', () => {
  const items = previewAssistants();
  assert.equal(items.length, 6);
  assert.equal(new Set(items.map(item => item.slug)).size, 6);
  assert.equal(new Set(items.map(item => item.image_url)).size, 6);
  assert.equal(items.find(item => item.slug === 'rubik').tool_type, 'rubik');
  assert.equal(items.find(item => item.slug === 'lap-trinh').tool_type, 'logic');
});
