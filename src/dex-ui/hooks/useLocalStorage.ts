import { ChangeEvent, useEffect, useState } from "react";

function getStorageValue<T>(key: string, defaultValue: T) {
  if (typeof window !== "undefined") {
    const storageValue = localStorage.getItem(key);
    const localStorageValue = storageValue !== null ? JSON.parse(storageValue) : defaultValue;
    return localStorageValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    setValue(inputElement.value as T);
  }

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return {
    value,
    handleChange,
  };
}
