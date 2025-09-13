'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Layout/Nav/Header';
import Footer from '@/Pages/HomePage/sections/FooterSection/Footer';

interface Props {
  children: React.ReactNode;
}

const AppShell: React.FC<Props> = ({ children }) => {
  const pathname = usePathname();

  const noHeaderFooterPaths = [
    '/login',
    '/active-code',
    '/register',
    '/reset-password',
  ];

  const shouldShowHeaderFooter = !noHeaderFooterPaths.some((path) =>
    pathname?.startsWith(path)
  );

  return (
    <>
      {shouldShowHeaderFooter && <Header />}
      {children}
      {shouldShowHeaderFooter && <Footer />}
    </>
  );
};

export default AppShell;
