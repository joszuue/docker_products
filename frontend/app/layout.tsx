import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Gestor de Productos | CRUD Laravel & Next.js',
  description: 'Gestor de catálogo de productos con Next.js 16, Laravel 11/13 y MySQL en Docker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            Gestor de Productos • Next.js 16 + Laravel API + MySQL • Arquitectura Docker
          </div>
        </footer>
      </body>
    </html>
  );
}
