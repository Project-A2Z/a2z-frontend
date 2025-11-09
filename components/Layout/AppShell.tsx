'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Layout/Nav/Header';
import Footer from '@/pages/HomePage/sections/FooterSection/Footer';
import FloatingChat from '@/components/UI/FloatingChat/FloatingChat';

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

  const shouldShowFloatingChat = ![
    '/login',
    '/active-code',
    '/register',
    '/reset-password',
  ].some((path) => pathname?.startsWith(path));

  return (
    <>
      {shouldShowHeaderFooter && <Header />}
      {children}
      {shouldShowHeaderFooter && <Footer />}
      {shouldShowFloatingChat && <FloatingChat />}
    </>
  );
};

export default AppShell;