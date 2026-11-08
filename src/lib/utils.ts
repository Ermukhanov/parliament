/** Returns the localized field value based on the current locale */
export function t<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: string = 'kk'
): string {
  if (locale === 'en') {
    const enVal = item[`${field}En` as keyof T] as string;
    if (enVal) return enVal;
  }
  const key = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as keyof T;
  return (item[key] as string) || (item[`${field}Kk` as keyof T] as string) || (item[`${field}Ru` as keyof T] as string) || '';
}

/** Format date for display */
export function formatDate(date: Date | string, locale: string = 'kk'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format date with time */
export function formatDateTime(date: Date | string, locale: string = 'kk'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'kk-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Get time remaining until a date */
export function getTimeRemaining(target: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = new Date(target).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

/** Month name in Kazakh/English */
const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthsKk = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'];

export function getMonthName(month: number, locale: string = 'kk'): string {
  const months = locale === 'en' ? monthsEn : monthsKk;
  return months[month - 1] || '';
}

/** Category display name */
const categoriesEn: Record<string, string> = {
  study: 'Education',
  culture: 'Culture & Arts',
  sport: 'Sports',
  charity: 'Volunteering',
};
const categoriesKk: Record<string, string> = {
  study: 'Оқу',
  culture: 'Мәдениет',
  sport: 'Спорт',
  charity: 'Қайырымдылық',
};

export function getCategoryName(category: string, locale: string = 'kk'): string {
  const cats = locale === 'en' ? categoriesEn : categoriesKk;
  return cats[category] || category;
}

/** CN utility for merging classes */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
