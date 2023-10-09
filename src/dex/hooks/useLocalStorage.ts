import { ChangeEvent, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  function getStorageValue<T>(key: string, defaultValue: T) {
    const storageValue = localStorage.getItem(key);
    const localStorageValue = storageValue !== null ? JSON.parse(storageValue) : defaultValue;
    return localStorageValue;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    setValue(inputElement.value as T);
  }

  function setStorageValue(newValue: T) {
    setValue(newValue);
  }

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return {
    value,
    handleChange,
    setStorageValue,
  };
}
