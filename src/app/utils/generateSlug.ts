// Helper function to generate slug from name
const generateSlug = (string: string) => {
  return string
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
export { generateSlug };
