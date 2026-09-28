// components/SearchableMultiSelect.tsx
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
    options?: string[];
    selected?: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export default function SearchableMultiSelect({
    options = [],
    selected = [],
    onChange,
    placeholder = "Todos los sensores",
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const filtered = useMemo(
        () => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
        [options, query]
    );

    const toggle = (key: string) => {
        if (selected.includes(key)) onChange(selected.filter((k) => k !== key));
        else onChange([...selected, key]);
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const label =
        selected.length === 0
            ? placeholder
            : selected.length === 1
            ? selected[0]
            : `${selected.length} sensores`;

    return (
        <div ref={containerRef} className="relative w-full max-w-xs select-none">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={[
                    "w-full flex items-center justify-between gap-1",
                    "h-12 px-2.5 rounded-md border text-xs",
                    "bg-content1 text-default-600 border-divider",
                    "hover:border-default-400 transition-colors",
                    "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
                    open ? "border-primary ring-1 ring-primary/20" : "",
                ].join(" ")}
            >
                <span
                    className={
                        selected.length === 0
                            ? "text-default-400"
                            : "text-foreground font-medium"
                    }
                >
                    {label}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                    {selected.length > 0 && (
                        <span
                            onClick={clear}
                            className="text-default-300 hover:text-default-500 cursor-pointer text-sm leading-none"
                            title="Limpiar"
                        >
                            ×
                        </span>
                    )}
                    <svg
                        className={`w-3 h-3 text-default-400 transition-transform ${
                            open ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <path
                            d="M2 4.5l4 4 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 top-full mt-1 left-0 w-full bg-content1 border border-divider rounded-md shadow-lg overflow-hidden">
                    {/* Search */}
                    <div className="p-1.5 border-b border-divider">
                        <div className="flex items-center gap-1.5 bg-content2 border border-divider rounded px-2 py-1">
                            <svg
                                className="w-3 h-3 text-default-400 shrink-0"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="5" cy="5" r="3.5" />
                                <path d="M8 8l2.5 2.5" strokeLinecap="round" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar sensor..."
                                className="w-full text-xs bg-transparent text-foreground placeholder-default-400 focus:outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="text-default-300 hover:text-default-500 text-sm leading-none"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-default-400 text-center">
                                Sin resultados
                            </div>
                        ) : (
                            filtered.map((opt) => {
                                const checked = selected.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => toggle(opt)}
                                        className={[
                                            "w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left",
                                            "transition-colors cursor-pointer",
                                            checked
                                                ? "bg-primary/10 text-primary"
                                                : "text-default-600 hover:bg-default-100",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                checked
                                                    ? "bg-primary border-primary"
                                                    : "border-default-300 bg-content1",
                                            ].join(" ")}
                                        >
                                            {checked && (
                                                <svg
                                                    viewBox="0 0 8 8"
                                                    className="w-2 h-2 text-primary-foreground"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        d="M1 4l2 2 4-4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="font-mono">{opt}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer: contador + limpiar */}
                    {selected.length > 0 && (
                        <div className="border-t border-divider px-2.5 py-1.5 flex justify-between items-center">
                            <span className="text-[10px] text-default-400">
                                {selected.length} seleccionado
                                {selected.length > 1 ? "s" : ""}
                            </span>
                            <button
                                onClick={clear}
                                className="text-[10px] text-primary hover:opacity-80"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}