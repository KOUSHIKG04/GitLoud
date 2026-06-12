import * as React from "react";

type NumberStateUpdater = number | ((current: number) => number);

type UseLocalStorageNumberOptions = {
  defaultValue: number;
  key: string;
  max?: number;
  min?: number;
};

function getClampedValue(value: number, min?: number, max?: number) {
  if (!Number.isFinite(value)) {
    return null;
  }

  if (typeof min === "number" && value < min) {
    return null;
  }

  if (typeof max === "number" && value > max) {
    return null;
  }

  return value;
}

export function useLocalStorageNumber({
  defaultValue,
  key,
  max,
  min,
}: UseLocalStorageNumberOptions) {
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    const storedRaw = window.localStorage.getItem(key);
    const storedValue =
      storedRaw === null ? null : getClampedValue(Number(storedRaw), min, max);

    if (storedValue !== null) {
      setValue(storedValue);
    }
  }, [key, max, min]);

  const persistValue = React.useCallback(
    (nextValue: number) => {
      const storedValue = getClampedValue(nextValue, min, max);

      if (storedValue !== null) {
        window.localStorage.setItem(key, String(storedValue));
      }
    },
    [key, max, min],
  );

  const setStoredValue = React.useCallback(
    (updater: NumberStateUpdater) => {
      setValue((currentValue) => {
        const nextValue =
          typeof updater === "function" ? updater(currentValue) : updater;
        const clampedValue = getClampedValue(nextValue, min, max);

        if (clampedValue === null) {
          return currentValue;
        }

        persistValue(clampedValue);
        return clampedValue;
      });
    },
    [max, min, persistValue],
  );

  return {
    persistValue,
    setStoredValue,
    setValue,
    value,
  };
}
