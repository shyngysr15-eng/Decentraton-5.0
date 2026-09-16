import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agro Subsidy Scoring MVP',
  description: 'MVP веб-приложения для поэтапного скоринга заявок на агросубсидии Казахстана.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}