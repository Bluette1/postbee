export function slugify(jobTitle: string, companyName: string): string {
  const text = `${jobTitle} ${companyName}`;
  return text
      .toLowerCase()
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
      .replace(/\-\-+/g, '-')     // Replace multiple hyphens with a single hyphen
      .trim();                   // Trim whitespace
}