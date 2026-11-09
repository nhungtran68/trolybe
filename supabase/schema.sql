-- Foundation only. Review and test RLS before production use.
create extension if not exists pgcrypto;
create table public.assistants (
 id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
 name text not null, description text not null, image_url text not null, category text not null,
 sort_order integer not null default 0, status text not null default 'draft' check (status in ('draft','published','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Public data only: system prompts and configuration MUST NOT be stored here.
alter table public.assistants enable row level security;
grant select on public.assistants to anon, authenticated;
create policy "published assistants are readable" on public.assistants for select to anon, authenticated using (status = 'published');
-- Configuration is intentionally inaccessible through the public API until authorization is implemented.
create table public.assistant_configs (
 id uuid primary key default gen_random_uuid(), assistant_id uuid not null references public.assistants(id),
 version integer not null, system_prompt text not null, greeting text not null,
 provider text not null, model text not null, max_output_tokens integer not null default 500,
 created_at timestamptz not null default now(), unique(assistant_id,version)
);
alter table public.assistant_configs enable row level security;
revoke all on public.assistant_configs from anon, authenticated;
insert into public.assistants (slug,name,description,image_url,category,sort_order,status) values
('toan-hoc','Thầy AI Toán học','Giải thích, hướng dẫn từng bước, luyện tính toán.','/assistants/math.webp','Toán học',1,'published'),
('tieng-viet','Cô AI Tiếng Việt','Tập đọc, chính tả, tập làm văn, ngữ pháp.','/assistants/vietnamese.webp','Tiếng Việt',2,'published'),
('tieng-anh','Cô AI Tiếng Anh','Từ vựng, giao tiếp, phát âm, luyện nghe.','/assistants/english.webp','Tiếng Anh',3,'published'),
('rubik','Thầy AI Rubik','Dạy xoay Rubik bằng hình ảnh trực quan.','/assistants/rubik.webp','Rubik',4,'published'),
('khoa-hoc','Thầy AI Khoa học','Khám phá tự nhiên, vật lý, hóa học và thế giới xung quanh.','/assistants/science.webp','Khoa học',5,'published'),
('lap-trinh','Thầy AI Lập trình','Scratch, tư duy logic, Python cơ bản và làm quen AI.','/assistants/coding.webp','Lập trình',6,'published');
