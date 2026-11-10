'use client';
import { FormEvent, useMemo, useState } from 'react';

type Message = { id: string; role: 'user'|'assistant'; content: string };
type Props = { slug: string; name: string; greeting: string; enabled: boolean };

const suggestions: Record<string, string[]> = {
  'toan-hoc': ['Giúp con giải bài này', 'Cho con 5 bài tập', 'Giải thích kiến thức', 'Kiểm tra bài của con'],
  'tieng-viet': ['Luyện đọc hiểu', 'Kiểm tra chính tả', 'Gợi ý viết đoạn văn', 'Cho con bài tập'],
  'tieng-anh': ['Học 10 từ mới', 'Luyện hội thoại', 'Kiểm tra từ vựng', 'Giải thích ngữ pháp'],
  'rubik': ['Dạy con ký hiệu xoay', 'Bắt đầu Rubik 3x3', 'Giải thích bước này', 'Kiểm tra thao tác của con'],
  'khoa-hoc': ['Vì sao trời mưa?', 'Cho con câu hỏi vui', 'Giải thích một hiện tượng', 'Gợi ý thí nghiệm an toàn'],
  'lap-trinh': ['Dạy con tư duy thuật toán', 'Cho con thử thách Scratch', 'Giải thích đoạn mã', 'Dạy con cách hỏi AI'],
};

export default function ChatRoom({ slug, name, greeting, enabled }: Props) {
  const initial = useMemo<Message>(() => ({ id: 'greeting', role: 'assistant', content: greeting }), [greeting]);
  const [messages, setMessages] = useState<Message[]>([initial]);
  const [text, setText] = useState('');
  const [grade, setGrade] = useState(3);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const send = async (message: string) => {
    const clean = message.trim();
    if (!clean || pending || !enabled) return;
    setPending(true); setError(''); setText('');
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: clean };
    setMessages(current => [...current, userMessage]);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, message: clean, grade, conversationId }),
      });
      const body = await response.json() as { reply?: string; conversationId?: string; error?: string };
      if (!response.ok || !body.reply) throw new Error(body.error || 'Chưa nhận được câu trả lời.');
      if (body.conversationId) setConversationId(body.conversationId);
      setMessages(current => [...current, { id: crypto.randomUUID(), role: 'assistant', content: body.reply! }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể kết nối phòng học.');
    } finally { setPending(false); }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void send(text); };
  const startNew = () => { setConversationId(null); setMessages([initial]); setText(''); setError(''); };

  return <section className="chat-room" aria-label={`Hội thoại với ${name}`}>
    <div className="chat-toolbar">
      <label>Lớp <select value={grade} onChange={event => setGrade(Number(event.target.value))} disabled={pending}>
        {[1,2,3,4,5].map(item => <option key={item} value={item}>{item}</option>)}
      </select></label>
      <button type="button" onClick={startNew} disabled={pending}>+ Cuộc học mới</button>
    </div>
    <div className="suggestions" aria-label="Bài học gợi ý">
      {(suggestions[slug] || ['Giải thích cho con', 'Cho con một ví dụ', 'Kiểm tra con đi']).map(item =>
        <button type="button" key={item} onClick={() => void send(item)} disabled={pending || !enabled}>{item}</button>)}
    </div>
    <div className="messages" aria-live="polite">
      {messages.map(message => <article key={message.id} className={`message ${message.role}`}>
        <strong>{message.role === 'assistant' ? name : 'Con'}</strong>
        <p>{message.content}</p>
      </article>)}
      {pending && <article className="message assistant pending"><strong>{name}</strong><p>Đang suy nghĩ từng bước…</p></article>}
    </div>
    {!enabled && <p className="chat-warning">Quản trị viên cần thêm khóa OpenAI và khóa máy chủ Supabase trước khi bắt đầu hội thoại thật.</p>}
    {error && <p className="chat-error" role="alert">{error}</p>}
    <form className="chat-input" onSubmit={submit}>
      <label htmlFor="student-question" className="sr-only">Câu hỏi của con</label>
      <textarea id="student-question" value={text} maxLength={2000} rows={3}
        onChange={event => setText(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
        placeholder="Con hãy nhập câu hỏi ở đây…" disabled={pending || !enabled}/>
      <button type="submit" disabled={pending || !enabled || !text.trim()}>Gửi</button>
    </form>
    <p className="privacy-note">Không gửi họ tên đầy đủ, địa chỉ, số điện thoại, email hoặc mật khẩu.</p>
  </section>;
}

