"use client";
import React from 'react';
import Link from 'next/link';

type Item = { label: string; href: string };

type Props = {
  items?: Item[];
  current?: string; // label of current active item
};

const defaultItems: Item[] = [
  { label: 'الرئيسية', href: '/' },
  { label: 'الخدمات', href: '/services' },
  { label: 'المنتجات', href: '/product' },
  { label: 'من نحن', href: '/about' },
  { label: 'تواصل معنا', href: '/contact' },
];

const TopNav: React.FC<Props> = ({ items = defaultItems, current = 'المنتجات' }) => {
  return (
    <nav className="w-full">
      <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base">
        {items.map((it) => {
          const isActive = it.label === current;
          return (
            <li key={it.label}>
              <Link
                href={it.href}
                className={`transition-colors ${
                  isActive
                    ? 'text-black87 font-semibold border-b-2 border-black16 pb-1'
                    : 'text-black60 hover:text-primary'
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default React.memo(TopNav);