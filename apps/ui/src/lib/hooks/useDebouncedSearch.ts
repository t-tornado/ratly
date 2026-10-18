import { useState } from "react";
import { useDebounce } from "./useDebounce";

const SEARCH_DEBOUNCE_MS = 300;

interface DebouncedSearch {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

function useDebouncedSearch(): DebouncedSearch {
  const [rawQuery, setRawQuery] = useState("");
  const searchQuery = useDebounce(rawQuery, SEARCH_DEBOUNCE_MS);

  return { searchQuery, onSearchChange: setRawQuery };
}

export { useDebouncedSearch };
