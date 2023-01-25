import { ChangeEvent, useState } from "react";

export function useInput<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    setValue(inputElement.value as T);
  }

  return {
    value,
    handleChange,
  };
}
