import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store the current value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Retrieve from localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting localStorage key:", key, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
