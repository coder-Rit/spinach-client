import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface ThemeSelectOption {
  value: string;
  label: string;
}

interface ThemeSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ThemeSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const ThemeSelect = ({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: ThemeSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-neutral-600 bg-neutral-900/80 px-3 py-2.5 text-left text-sm text-neutral-100 outline-none transition-colors hover:border-neutral-500 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-[80] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-xl"
        >
          {options.map((opt, index) => (
            <li
              key={`${opt.label}-${index}`}
              role="option"
              aria-selected={opt.value === value}
            >
              <button
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-800 ${
                  opt.value === value ? "bg-neutral-800/90 text-emerald-400" : "text-neutral-200"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSelect;
