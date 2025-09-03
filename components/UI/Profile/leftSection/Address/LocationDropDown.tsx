import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './address.module.css';

// Sample data for cities and areas
const locationData: { [key: string]: string[] } = {
  'القاهرة': ['المعادي', 'مصر الجديدة', 'الزمالك', 'وسط البلد', 'مدينة نصر', 'العباسية', 'شبرا'],
  'الجيزة': ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', 'بولاق الدكرور', 'إمبابة', 'الوراق'],
  'الإسكندرية': ['سموحة', 'سيدي جابر', 'المنتزه', 'محرم بك', 'كرموز', 'الرمل', 'باكوس'],
  'الشرقية': ['الزقازيق', 'بلبيس', 'أبو حماد', 'فاقوس', 'القرين', 'ديرب نجم', 'المطرية'],
  'الأقصر': ['المنيل', 'الكرنك', 'طيبة', 'البياضية', 'العوامية', 'نجع الشيخ علي']
};

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  // Generate button class names
  const getButtonClassName = () => {
    let className = styles.dropdownButton;
    
    if (disabled) {
      className += ` ${styles.dropdownButtonDisabled}`;
    } else if (isOpen) {
      className += ` ${styles.dropdownButtonOpen}`;
    }
    
    return className;
  };

  // Generate text class names
  const getTextClassName = () => {
    let className = styles.buttonText;
    
    if (!value && !disabled) {
      className += ` ${styles.buttonTextPlaceholder}`;
    } else if (disabled) {
      className += ` ${styles.buttonTextDisabled}`;
    }
    
    return className;
  };

  // Generate option button class names
  const getOptionClassName = (option: string, index: number) => {
    let className = styles.optionButton;
    
    if (index === 0) {
      className += ` ${styles.optionButtonFirst}`;
    }
    if (index === options.length - 1) {
      className += ` ${styles.optionButtonLast}`;
    }
    if (value === option) {
      className += ` ${styles.optionButtonSelected}`;
    }
    
    return className;
  };

  return (
    <div className={styles.container_drop} ref={dropdownRef}>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={getButtonClassName()}
        >
          <ChevronDown 
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
          <span className={getTextClassName()}>
            {value || placeholder}
          </span>
        </button>

        {isOpen && !disabled && (
          <div className={styles.optionsContainer}>
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className={getOptionClassName(option, index)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;