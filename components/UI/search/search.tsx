"use client";

import React, { useState } from 'react';
import styles from './search.module.css'; 
import SearchIcon from './../../../public/icons/search.svg'; 

const SearchComponent = (props: { data: any; }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [Data, setData] = useState(props.data || []); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className={styles.searchForm}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="بحث"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          dir="rtl"
        />
        <SearchIcon className={styles.searchIcon} />
      </div>
    </form>
  );
};

export default SearchComponent;