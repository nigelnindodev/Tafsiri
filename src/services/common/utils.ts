export const parseNumber = (value: string): number | undefined => {
  const parsedNumberResult = Number(value);
  if (isNaN(parsedNumberResult)) {
    return undefined;
  } else {
    return parsedNumberResult;
  }
};
