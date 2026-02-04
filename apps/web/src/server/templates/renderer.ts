export function renderTemplate(template: string, data: Record<string, string | number | undefined>) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const value = data[key.trim()];
    return value === undefined || value === null ? "" : String(value);
  });
}
