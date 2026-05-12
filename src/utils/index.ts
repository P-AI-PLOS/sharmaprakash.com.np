export const createSlug = (str: string): string =>
  str.split(" ").join("-").toLowerCase();

export const paginate = <T>(arr: T[], page: number, limit: number): T[] =>
  arr.slice(limit * page - limit, limit * page);

export const formatBlogDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
};

export const shortBlogDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}`;
};
