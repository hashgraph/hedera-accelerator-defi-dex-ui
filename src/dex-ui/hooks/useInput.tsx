import { ChangeEvent, useState } from "react";

export function useInput<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value as T);
  }

  return {
    value,
    handleChange,
  };
}
