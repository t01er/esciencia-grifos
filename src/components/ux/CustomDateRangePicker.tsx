import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  RangeCalendar,
  RadioGroup,
  Radio,
  cn,
} from "@heroui/react";
import type { RangeValue, DateValue } from "@heroui/react";
import { Calendar } from "@solar-icons/react";
import { getLocalTimeZone, today } from "@internationalized/date";

interface CustomDateRangePickerProps {
  value: RangeValue<DateValue> | null;
  onChange: (range: RangeValue<DateValue> | null) => void;
  placeholder?: string;
  className?: string;
}

const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "flex-none m-0 h-8 bg-content1 hover:bg-content2 items-center justify-between",
          "cursor-pointer rounded-full border-2 border-default-200/60",
          "data-[selected=true]:border-primary",
        ),
        label: "text-tiny text-default-500",
        labelWrapper: "px-1 m-0",
        wrapper: "hidden",
      }}
    >
      {children}
    </Radio>
  );
};

export default function CustomDateRangePicker({
  value,
  onChange,
  placeholder = "Rango de fechas",
  className = "",
}: CustomDateRangePickerProps) {
  const [focusedValue, setFocusedValue] = useState<DateValue | null>(null);

  const formatDateRange = () => {
    if (!value || !value.start || !value.end) {
      return "Seleccionar fechas";
    }

    const start = value.start.toDate(getLocalTimeZone());
    const end = value.end.toDate(getLocalTimeZone());

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} - ${end.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  const handleRadioChange = (days: number) => {
    const todayDate = today(getLocalTimeZone());
    const startDate = todayDate.add({ days: -days });

    onChange({
      start: startDate,
      end: todayDate,
    });
  };

  return (
    <Dropdown size="sm" placement="bottom-start" className={className}>
      <DropdownTrigger>
        <Button
          variant="flat"
          color="default"
          radius="sm"
          className="h-12 w-full max-w-57 justify-start px-3 "
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[11px] text-default-500">
                {placeholder}
              </span>
              <div className="flex items-center gap-1">
                <Calendar weight="Bold" size={15} />
                <span className="text-sm text-foreground truncate">
                  {formatDateRange()}
                </span>
              </div>
            </div>
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Selector de fechas"
        closeOnSelect={false}
        className="p-0 up"
      >
        <DropdownItem
          key="calendar"
          isReadOnly
          className="p-0"
        >
          <div>
            <RangeCalendar
              showMonthAndYearPickers
              aria-label="Date (Show Month and Year Picker)"
              value={value as any}
              onChange={onChange}
              focusedValue={focusedValue}
              onFocusChange={setFocusedValue}
              bottomContent={
                <RadioGroup
                  aria-label="Date precision"
                  classNames={{
                    base: "w-full pb-2",
                    wrapper: "py-2.5 px-3 gap-1 flex-nowrap overflow-x-auto",
                  }}
                  defaultValue="exact_dates"
                  orientation="horizontal"
                >
                  <CustomRadio
                    value="exact_dates"
                    onChange={() => {
                      const todayDate = today(getLocalTimeZone());
                      onChange({
                        start: todayDate,
                        end: todayDate,
                      });
                    }}
                  >
                    Hoy
                  </CustomRadio>
                  <CustomRadio
                    value="1_day"
                    onChange={() => handleRadioChange(1)}
                  >
                    1 día
                  </CustomRadio>
                  <CustomRadio
                    value="2_days"
                    onChange={() => handleRadioChange(2)}
                  >
                    2 días
                  </CustomRadio>
                  <CustomRadio
                    value="3_days"
                    onChange={() => handleRadioChange(3)}
                  >
                    3 días
                  </CustomRadio>
                  <CustomRadio
                    value="7_days"
                    onChange={() => handleRadioChange(7)}
                  >
                    7 días
                  </CustomRadio>
                  <CustomRadio
                    value="14_days"
                    onChange={() => handleRadioChange(14)}
                  >
                    14 días
                  </CustomRadio>
                </RadioGroup>
              }
              nextButtonProps={{
                variant: "bordered",
                size: "sm",
              }}
              prevButtonProps={{
                variant: "bordered",
                size: "sm",
              }}
            />
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}