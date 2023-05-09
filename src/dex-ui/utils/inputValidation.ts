export const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return urlString.length === 0 ? true : false;
  }
};

interface CheckForValidPositiveNumberParams {
  input: number;
  maxCapValue?: number;
  minCapValue?: number;
}

export const checkForValidPositiveNumber = (params: CheckForValidPositiveNumberParams) => {
  const { input, maxCapValue, minCapValue } = params;
  if (maxCapValue && minCapValue) {
    return Math.sign(input) > 0 && input <= maxCapValue && minCapValue <= input;
  }
  if (maxCapValue) {
    return Math.sign(input) > 0 && input <= maxCapValue;
  }
  if (minCapValue) {
    return Math.sign(input) > 0 && minCapValue <= input;
  }

  return Math.sign(input) > 0;
};
