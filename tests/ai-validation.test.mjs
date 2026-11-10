import test from 'node:test';
import assert from 'node:assert/strict';
import { containsSensitivePersonalData, estimateMicroUsd, validateAssistantConfig, validateChatInput, validateImageDataUrl } from '../src/lib/ai-validation.mjs';

test('chat input accepts a grade-school question and normalizes whitespace', () => {
  assert.deepEqual(validateChatInput({slug:'toan-hoc',message:'  125 × 24 bằng bao nhiêu?  ',grade:3}), {
    slug:'toan-hoc',message:'125 × 24 bằng bao nhiêu?',grade:3,conversationId:null,
  });
});

test('chat input rejects an invalid grade and oversized identity', () => {
  assert.equal(validateChatInput({slug:'toan-hoc',message:'Xin chào',grade:7}), null);
  assert.equal(validateChatInput({slug:'../admin',message:'Xin chào',grade:3}), null);
});

test('personal data guard catches common private fields without blocking arithmetic', () => {
  assert.equal(containsSensitivePersonalData('Email của con là be@example.com'), true);
  assert.equal(containsSensitivePersonalData('Số điện thoại 0912345678'), true);
  assert.equal(containsSensitivePersonalData('125 nhân 24 bằng bao nhiêu?'), false);
});

test('AI configuration only accepts supported models and bounded limits', () => {
  const base = {assistant_id:'123e4567-e89b-12d3-a456-426614174000',system_prompt:'Dạy Toán',greeting:'Chào con',teaching_guidance:'Gợi mở',forbidden_content:'Không làm hộ',model:'gpt-6-luna',reasoning_effort:'none',max_output_tokens:'500',daily_request_limit:'20',input_cost_microusd_per_million:'50000',output_cost_microusd_per_million:'250000'};
  assert.equal(validateAssistantConfig(base)?.provider, 'openai');
  assert.equal(validateAssistantConfig({...base,model:'unknown-model'}), null);
  assert.equal(validateAssistantConfig({...base,daily_request_limit:'1000'}), null);
});

test('cost estimate uses recorded tokens and configured per-million rates', () => {
  assert.equal(estimateMicroUsd(1000,500,50000,250000), 175);
});

test('chat input accepts one small supported image and rejects unsafe image data', () => {
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
  assert.equal(validateImageDataUrl(image), image);
  assert.equal(validateChatInput({slug:'toan-hoc',message:'',imageDataUrl:image,grade:3})?.imageDataUrl, image);
  assert.equal(validateImageDataUrl('data:image/svg+xml;base64,PHN2Zz4='), null);
  assert.equal(validateImageDataUrl('https://example.com/student.png'), null);
});
