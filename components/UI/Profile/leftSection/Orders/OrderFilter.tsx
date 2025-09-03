import React from 'react';
import { Button } from '../../../Buttons/Button';
import styles from './order.module.css';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface FilterOptions {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
}

interface OrderFilterProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (selectedFilters: string[]) => void;
  multiSelect?: boolean;
  showClearAll?: boolean;
  clearAllText?: string;
  variant?: 'outline' | 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const OrderFilter: React.FC<OrderFilterProps> = ({
  options,
  selectedFilters,
  onFilterChange,
  multiSelect = false,
  showClearAll = true,
  clearAllText = 'الكل',
  variant = 'outline' ,
  size = 'sm'
}) => {
  const handleFilterClick = (filterValue: string) => {
    if (multiSelect) {
      const newFilters = selectedFilters.includes(filterValue)
        ? selectedFilters.filter(f => f !== filterValue)
        : [...selectedFilters, filterValue];
      onFilterChange(newFilters);
    } else {
      onFilterChange([filterValue]);
    }
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const isSelected = (filterValue: string) => selectedFilters.includes(filterValue);
  const isAllSelected = selectedFilters.length === 0;

  return (
    <div className={styles.filterContainer}>
      {/* Clear All / Show All Button */}
      {showClearAll && (
        <Button
          variant={isAllSelected ? 'primary' : variant}
          size={size}
          onClick={handleClearAll}
          className={`${styles.filterButton} ${isAllSelected ? styles.activeButton : styles.inactiveButton}`}
          rounded={true}
        >
          {clearAllText}
        </Button>
      )}

      {/* Filter Options */}
      {options.map((option) => (
        <Button
          key={option.id}
          variant={isSelected(option.value) ? 'primary' : variant}
          size={size}
          onClick={() => handleFilterClick(option.value)}
          className={`${styles.filterButton} ${
            isSelected(option.value) ? styles.activeButton : styles.inactiveButton
          }`}
            rounded={true}
        >
          <span className={styles.filterLabel}>
            {option.label}
            
          </span>
        </Button>
      ))}
    </div>
  );
};

export default OrderFilter;