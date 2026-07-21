import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

type DspDropdownProps = {
  id: string;
  value: string;
  values?: string[];
  options: readonly string[];
  placeholder: string;
  onChange?: (value: string) => void;
  onMultiChange?: (values: string[]) => void;
  multiple?: boolean;
};

export function DspDropdown({
  id,
  value,
  values = [],
  options,
  placeholder,
  onChange,
  onMultiChange,
  multiple = false,
}: DspDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    if (multiple) {
      if (values.length === 0) return placeholder;
      return values.join(', ');
    }
    if (!value) return placeholder;
    return options.find(option => option === value) ?? value;
  }, [multiple, options, placeholder, value, values]);
  const hasSelection = multiple ? values.length > 0 : Boolean(value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (nextValue: string) => {
    if (multiple) {
      const nextValues = values.includes(nextValue)
        ? values.filter(existing => existing !== nextValue)
        : [...values, nextValue];
      onMultiChange?.(nextValues);
      return;
    }

    onChange?.(nextValue);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    if (multiple) {
      onMultiChange?.([]);
      return;
    }
    onChange?.('');
    setIsOpen(false);
  };

  const updateScrollIndicators = () => {
    const list = listRef.current;
    if (!list) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    setCanScrollUp(scrollTop > 2);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  };

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(updateScrollIndicators);
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className="w-full rounded-lg border border-pmg-border bg-pmg-bg px-3 py-2.5 text-left text-sm text-pmg-text transition-all focus:border-pmg-accent focus:outline-none focus:ring-2 focus:ring-pmg-accent/50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!hasSelection ? 'text-pmg-muted' : ''}>{selectedLabel}</span>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pmg-muted" />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-pmg-border bg-pmg-bg shadow-lg">
          {canScrollUp && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-6 items-start justify-center bg-gradient-to-b from-pmg-bg to-transparent">
              <ChevronUp className="h-4 w-4 text-pmg-muted" />
            </div>
          )}

          <div
            ref={listRef}
            className="max-h-64 overflow-auto py-1"
            role="listbox"
            aria-labelledby={id}
            onScroll={updateScrollIndicators}
          >
            <button
              type="button"
              onClick={handleClearAll}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-pmg-text hover:bg-pmg-bg-muted"
              role="option"
              aria-selected={multiple ? values.length === 0 : !value}
            >
              {(multiple ? values.length === 0 : !value) && <Check className="h-4 w-4 text-pmg-accent" />}
              <span className={multiple ? (values.length === 0 ? 'font-medium' : '') : (!value ? 'font-medium' : '')}>
                {multiple ? 'Clear all' : placeholder}
              </span>
            </button>
            {options.map(option => {
              const isSelected = multiple ? values.includes(option) : value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-pmg-text hover:bg-pmg-bg-muted"
                  role="option"
                  aria-selected={isSelected}
                >
                  {isSelected && <Check className="h-4 w-4 text-pmg-accent" />}
                  <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                </button>
              );
            })}
          </div>

          {canScrollDown && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex h-6 items-end justify-center bg-gradient-to-t from-pmg-bg to-transparent">
              <ChevronDown className="h-4 w-4 text-pmg-muted" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
