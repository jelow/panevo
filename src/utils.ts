// Format timestamps as UTC (not local timezone)
export function formatUTC(date: Date, formatStr: string): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return formatStr
    .replace('MMM d, yyyy h:mm a', `${months[month]} ${day}, ${year} ${hours}:${minutes}`)
    .replace('MMM d, yyyy', `${months[month]} ${day}, ${year}`)
    .replace('MMM d, HH:mm', `${months[month]} ${day}, ${hours}:${minutes}`)
    .replace('HH:mm', `${hours}:${minutes}`);
}
