const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validateAssistant(input) {
  const name = String(input.name ?? '').trim();
  const slug = String(input.slug ?? '').trim();
  const description = String(input.description ?? '').trim();
  const category = String(input.category ?? '').trim();
  const image_url = String(input.image_url ?? '').trim();
  const status = String(input.status ?? 'draft');
  const sort_order = Number(input.sort_order);
  const tool_type = input.tool_type || null;
  if (!name || name.length > 100 || !slugPattern.test(slug) || slug.length > 100 || !description || description.length > 300 || !category || category.length > 80) return null;
  if (image_url.length > 1000 || (!/^\/(?!\/)[a-zA-Z0-9/_-]+\.(?:png|jpg|jpeg|webp)$/i.test(image_url) && !/^https:\/\/[^\s]+$/i.test(image_url))) return null;
  if (!['draft','published','archived'].includes(status) || !Number.isInteger(sort_order) || sort_order < 0 || sort_order > 9999 || ![null,'rubik','logic'].includes(tool_type)) return null;
  return { name, slug, description, category, image_url, status, sort_order, tool_type };
}
