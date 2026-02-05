// components/UI/Inputs/DatePicker.tsx
'use client'
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import styles from './DatePicker.module.css';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  max,
  disabled,
  placeholder = 'اختر التاريخ',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date && onChange) {
      onChange(format(date, 'yyyy-MM-dd'));
    }
    setIsOpen(false);
  };

  const maxDate = max ? new Date(max) : undefined;

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(styles.triggerButton, className)}
      >
        <span className={selected ? styles.selectedText : styles.placeholderText}>
          {selected ? format(selected, 'dd/MM/yyyy', { locale: ar }) : placeholder}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdownContainer}>
            <div className={styles.calendarWrapper}>
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelect}
                locale={ar}
                disabled={maxDate ? { after: maxDate } : undefined}
                dir="rtl"
                styles={{
                  root: {
                    direction: 'rtl',
                  },
                }}
                classNames={{
                  months: styles.months,
                  month: styles.month,
                  caption: styles.caption,
                  caption_label: styles.captionLabel,
                  nav: styles.nav,
                  nav_button: styles.navButton,
                  nav_button_previous: styles.navButtonPrevious,
                  nav_button_next: styles.navButtonNext,
                  table: styles.table,
                  head_row: styles.headRow,
                  head_cell: styles.headCell,
                  row: styles.row,
                  cell: styles.cell,
                  day: styles.day,
                  day_selected: styles.daySelected,
                  day_today: styles.dayToday,
                  day_outside: styles.dayOutside,
                  day_disabled: styles.dayDisabled,
                  day_hidden: styles.dayHidden,
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: 'var(--primary)',
                    color: 'var(--onPrimary)',
                  },
                  today: {
                    backgroundColor: 'var(--secondary1)',
                    color: 'var(--onPrimary)',
                    fontWeight: '600',
                  },
                }}
              />
            </div>
            
            {/* Action buttons */}
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={styles.cancelButton}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selected && onChange) {
                    onChange(format(selected, 'yyyy-MM-dd'));
                  }
                  setIsOpen(false);
                }}
                className={styles.confirmButton}
              >
                تأكيد
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DatePicker;