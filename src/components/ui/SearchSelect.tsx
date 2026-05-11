import { useEffect, useMemo, useRef, useState } from "react";

interface SearchSelectOption {
  value: string;
  label: string;
}

interface SearchSelectProps {
  value: string;
  options: SearchSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  disabled?: boolean;
  loading?: boolean;
  onSearchChange?: (query: string) => void;
}

const SearchSelect = ({
  value,
  options,
  onValueChange,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  loadingText = "Loading...",
  disabled = false,
  loading = false,
  onSearchChange,
}: SearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label || "");
    }
  }, [open, selectedOption]);

  return (
    <div ref={rootRef} className="relative">
      <input
        value={open ? query : selectedOption?.label || ""}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          onSearchChange?.(nextQuery);
          if (!open) {
            setOpen(true);
          }
        }}
        className="w-full bg-neutral-900/70 border border-transparent px-3 py-2.5 rounded-md outline-none focus:bg-neutral-900 focus:ring-1 focus:ring-emerald-500/40"
      />

      {open && (
        <div className="absolute z-[70] mt-2 w-full max-h-60 overflow-auto rounded-md border border-neutral-700 bg-neutral-900 shadow-xl">
          <div className="p-2">
            <input
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                onSearchChange?.(nextQuery);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-neutral-800 border border-transparent px-2.5 py-2 rounded outline-none focus:ring-1 focus:ring-emerald-500/40 text-sm"
            />
          </div>

          <div className="pb-2">
            {loading ? (
              <p className="px-3 py-2 text-sm text-neutral-400">{loadingText}</p>
            ) : filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-400">{emptyText}</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
