/**
 * Normalize DB row → cart / UI shape (snake_case → consistent fields).
 */
export function normalizeMenuItem(item) {
  if (!item) return item
  return {
    ...item,
    nameEn: item.name_en ?? item.nameEn ?? '',
    blurData: item.blur_data ?? item.blurData ?? null,
  }
}
