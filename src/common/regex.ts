export const extract = (regex: RegExp, str: string): string[] => {
  const result = regex.exec(str);
  if (!result) {
    throw new Error(`No matched for regex: ${regex}, string: ${str}`);
  } else {
    return result.slice(1);
  }
};
