'use client';

import { usePathname } from 'next/navigation';

// Public-site chrome (scroll progress, back-to-top) is not rendered inside the admin panel.
export default function PublicOnly({ children }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return children;
}
