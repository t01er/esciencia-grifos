import type { ReactNode } from "react";
import { Input, Select, SelectItem, Button, Pagination, DatePicker } from "@heroui/react";
import type { RangeValue, DateValue } from "@heroui/react";
import { Magnifer, AltArrowDown, AltArrowUp, Broom, Widget, ListArrowDown, DangerTriangle } from "@solar-icons/react";
import { ThinkingOrb } from "thinking-orbs";
import { Chart2 } from "@solar-icons/react/ssr";
import CustomDateRangePicker from "./CustomDateRangePicker";
export type ViewMode = "table" | "cards" | "chart";

export interface CustomColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sticky?: boolean;
  width: number;
  align?: "start" | "center" | "end";
  render?: (item: T) => ReactNode;
}


export interface ColumnGroupDef {
  label: string;
  columnKeys: string[];
  noRightBorder?: boolean;
}

export interface FilterFieldDef {
  key: string;
  type: "text" | "select" | "dateRange" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface CustomTableProps<T extends Record<string, any>> {
  data: T[];
  columns: CustomColumnDef<T>[];
  columnGroups?: ColumnGroupDef[];
  idField: string;
  filters?: FilterFieldDef[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  headerActions?: ReactNode;
  dateValue?: DateValue | null;
  onDateChange?: (date: DateValue | null) => void;
  sortDescriptor: { column: string; direction: "ascending" | "descending" };
  onSortChange: (d: {
    column: string;
    direction: "ascending" | "descending";
  }) => void;
  page: number;
  pageSize: number;
  totalRegistros: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  maxBodyHeight?: string;
  cardView?: (item: T) => ReactNode;
  chartComponent?: ReactNode;
  dateRangeValue?: RangeValue<DateValue> | null;
  onDateRangeChange?: (range: RangeValue<DateValue> | null) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  availableViews?: ViewMode[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GROUP_ROW_HEIGHT = 34;

function LoadingOverlay({ minHeight }: { minHeight: string }) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3"
      style={{ minHeight }}
    >
      <ThinkingOrb state="composing" size={64} />
      <span className="text-xs text-zinc-400 dark:text-zinc-500">Cargando...</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  minHeight,
}: {
  message: unknown; 
  onRetry?: () => void;
  minHeight: string;
}) {
  const text =
    typeof message === "string"
      ? message
      : message instanceof Error
        ? message.message
        : typeof message === "object" && message !== null
          ? ((message as any)?.data?.message ??
             (message as any)?.message ??
             JSON.stringify(message))
          : String(message ?? "Error desconocido");

  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-3 px-4 text-center py-6"
      style={{ minHeight }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <DangerTriangle size={24} weight="BoldDuotone" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Ocurrió un error
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
          {text}
        </span>
      </div>
      {onRetry && (
        <Button size="sm" color="primary" variant="flat" onPress={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default function TableComponent<T extends Record<string, any>>({
  data,
  columns,
  columnGroups,
  idField,
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  headerActions,
  sortDescriptor,
  onSortChange,
  page,
  pageSize,
  totalRegistros,
  pageSizeOptions = [15, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  maxBodyHeight = "700px",
  viewMode = "table",
  onViewModeChange,
  cardView,
  dateRangeValue,
  onDateRangeChange,
  chartComponent,
  dateValue,
  availableViews = ["table", "cards", "chart"],
  onDateChange,
  isLoading,
  error,
  onRetry
}: CustomTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRegistros / pageSize));

  const stickyOffsets: Record<string, number> = {};
  let acc = 0;
  columns.forEach((col) => {
    if (col.sticky) {
      stickyOffsets[col.key] = acc;
      acc += col.width;
    }
  });

  const handleHeaderClick = (col: CustomColumnDef<T>) => {
    if (col.sortable === false) return;
    if (sortDescriptor.column === col.key) {
      onSortChange({
        column: col.key,
        direction:
          sortDescriptor.direction === "ascending" ? "descending" : "ascending",
      });
    } else {
      onSortChange({ column: col.key, direction: "ascending" });
    }
  };

  const bodyMinHeight = `min(${maxBodyHeight}, 120px)`;


  const showTableView = availableViews.includes("table");
  const showCardsView = availableViews.includes("cards") && !!cardView;
  const showChartView = availableViews.includes("chart") && !!chartComponent;

  return (
    <div className="bg-background rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-zinc-200/70 dark:border-zinc-700/70 w-full max-w-full flex flex-col">
      {(filters.length > 0 || headerActions || onClearFilters) && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-700/70 bg-zinc-50/80 dark:bg-zinc-900/40 backdrop-blur-sm">
          {filters.map((f) => {
            if (f.type === "select") {
              return (
                <Select
                  key={f.key}
                  size="md"
                  radius="md"
                  className="w-50"
                  placeholder={f.placeholder}
                  selectedKeys={
                    filterValues[f.key] ? new Set([filterValues[f.key]]) : new Set([])
                  }
                  onSelectionChange={(keys) =>
                    onFilterChange(f.key, String(Array.from(keys)[0] ?? ""))
                  }
                >
                  {(f.options ?? []).map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              );
            }

            if (f.type === "dateRange") {
              return (
                <CustomDateRangePicker
                  key={f.key}
                  value={dateRangeValue as any}
                  onChange={onDateRangeChange as any}
                  placeholder={f.placeholder ?? "Rango de fechas"}
                  className="w-66"
                />
              );
            }
            if (f.type === "date") {
              return (
                <DatePicker
                  key={f.key}
                  size="md"
                  radius="md"
                  className="w-52"
                  aria-label={f.placeholder ?? "Fecha"}
                  value={dateValue as any}
                  onChange={onDateChange as any}
                  granularity="day"
                />
              );
            }
            return (
              <Input
                key={f.key}
                size="md"
                radius="md"
                className="w-70"
                placeholder={f.placeholder ?? f.key}
                startContent={<Magnifer size={14} className="text-default-400" />}
                value={filterValues[f.key] ?? ""}
                onValueChange={(v) => onFilterChange(f.key, v)}
              />
            );
          })}

          {onClearFilters && (
            <Button size="sm" color="danger" variant="flat" startContent={<Broom size={15} />} onPress={onClearFilters}>
              Limpiar
            </Button>
          )}
          <div className="flex-1" />
          {headerActions}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            {showTableView && (
              <Button
                size="sm"
                variant={viewMode === "table" ? "solid" : "light"}
                color={viewMode === "table" ? "primary" : "default"}
                isIconOnly
                onPress={() => onViewModeChange?.("table")}
                className="min-w-8 h-8"
                title="Vista tabla"
              >
                <Widget size={16} />
              </Button>
            )}

            {showCardsView && (
              <Button
                size="sm"
                variant={viewMode === "cards" ? "solid" : "light"}
                color={viewMode === "cards" ? "primary" : "default"}
                isIconOnly
                onPress={() => onViewModeChange?.("cards")}
                className="min-w-8 h-8"
                title="Vista cards"
              >
                <ListArrowDown size={16} />
              </Button>
            )}

            {showChartView && (
              <Button
                size="sm"
                variant={viewMode === "chart" ? "solid" : "light"}
                color={viewMode === "chart" ? "secondary" : "default"}
                isIconOnly
                onPress={() => onViewModeChange?.("chart")}
                className="min-w-8 h-8"
                title="Vista gráfica"
              >
                <Chart2 size={16} />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="w-full overflow-auto" style={{ maxHeight: maxBodyHeight }}>
        {isLoading ? (
          <LoadingOverlay minHeight={bodyMinHeight} />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={onRetry}
            minHeight={bodyMinHeight}
          />
        ) : viewMode === "chart" && chartComponent ? (
          <div className="p-4">{chartComponent}</div>
        ) : viewMode === "cards" && cardView ? (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {data.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
                No se encontraron resultados
              </div>
            ) : (
              data.map((item) => cardView(item))
            )}
          </div>
        ) : (
          <table className="border-collapse text-sm w-max min-w-full">
            {columnGroups && columnGroups.length > 0 && (
              <thead>
                <tr>
                  {columnGroups.map((group, idx) => {
                    const groupCols = columns.filter((c) =>
                      group.columnKeys.includes(c.key)
                    );
                    const isSticky = groupCols.every((c) => c.sticky);
                    const groupWidth = groupCols.reduce((s, c) => s + c.width, 0);
                    return (
                      <th
                        key={`${group.label}-${idx}`}
                        colSpan={groupCols.length}
                        style={{ width: groupWidth, minWidth: groupWidth, height: GROUP_ROW_HEIGHT }}
                        className={`sticky top-0 bg-zinc-100/90 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-wide text-center border-b border-zinc-200/80 dark:border-zinc-700/60 ${group.noRightBorder ? "" : "border-r border-zinc-200/80 dark:border-zinc-700/60"} ${isSticky ? "z-30 left-0" : "z-20"}`}
                      >
                        {group.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}

            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      top: columnGroups?.length ? GROUP_ROW_HEIGHT : 0,
                      ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                    }}
                    className={`sticky bg-zinc-50/90 dark:bg-zinc-950/80 text-zinc-600 dark:text-zinc-300 font-bold uppercase text-[11px] tracking-wide border-b border-zinc-200/80 dark:border-zinc-700/60 px-3 py-2 whitespace-nowrap select-none ${col.sticky ? "z-30 shadow-[1px_0_0_0_rgba(161,161,170,0.14)]" : "z-20"} ${col.sortable !== false ? "cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100" : ""} ${col.align === "center" ? "text-center" : col.align === "end" ? "text-right" : "text-left"}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false &&
                        sortDescriptor.column === col.key &&
                        (sortDescriptor.direction === "ascending" ? (
                          <AltArrowUp size={12} />
                        ) : (
                          <AltArrowDown size={12} />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item[idField]} className="hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 group transition-colors duration-200">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          width: col.width,
                          minWidth: col.width,
                          ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                        }}
                        className={`px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 border-b border-zinc-200/70 dark:border-zinc-700/60 whitespace-nowrap ${col.sticky ? "sticky z-10 bg-background group-hover:bg-zinc-100/80 dark:group-hover:bg-zinc-800/70 shadow-[1px_0_0_0_rgba(161,161,170,0.14)]" : ""} ${col.align === "center" ? "text-center" : col.align === "end" ? "text-right" : "text-left"}`}
                      >
                        {col.render ? col.render(item) : String(item[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-zinc-200/70 dark:border-zinc-700/70 bg-zinc-50/60 dark:bg-zinc-900/30">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Total Registros: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{totalRegistros}</span>
        </span>

        <div className="flex items-center gap-3">
          <Select
            size="sm"
            radius="lg"
            className="w-24"
            selectedKeys={new Set([String(pageSize)])}
            onSelectionChange={(keys) =>
              onPageSizeChange(Number(Array.from(keys)[0]))
            }
          >
            {pageSizeOptions.map((size) => (
              <SelectItem key={String(size)}>{String(size)}</SelectItem>
            ))}
          </Select>

          <Pagination
            isCompact
            showControls
            size="sm"
            radius="lg"
            color="primary"
            page={page}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}