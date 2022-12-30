const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return urlString.length === 0 ? true : false;
  }
};

export { isValidUrl };
