export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isInteger = (value: string) => /^\d+$/.test(value);
