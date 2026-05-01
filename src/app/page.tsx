import { redirect } from 'next/navigation';

export default function Home() {
  // Redirección a nivel de servidor (Server-Side).
  redirect('/login');
}