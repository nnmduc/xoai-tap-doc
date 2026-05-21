/** Strips Vietnamese diacritics so "meo" matches "meo", "duc" matches "duc". */
export function normalizeVI(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đ]/g, 'd')
    .replace(/[Đ]/g, 'd')
    .toLowerCase()
}
