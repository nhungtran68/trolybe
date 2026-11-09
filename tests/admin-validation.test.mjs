import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAssistant } from '../src/lib/assistant-validation.mjs';
const base = {name:'Trợ lý',slug:'tro-ly',description:'Cùng học',category:'Khám phá',image_url:'/assistants/math.webp',status:'draft',sort_order:'7',tool_type:''};
test('valid draft is accepted and unsafe fields are rejected', () => {
  assert.equal(validateAssistant(base).sort_order,7);
  for (const edit of [{slug:'../bad'},{status:'admin'},{sort_order:'-1'},{image_url:'javascript:alert(1)'},{image_url:'//evil.example/a.png'},{tool_type:'shell'}]) assert.equal(validateAssistant({...base,...edit}),null);
});
