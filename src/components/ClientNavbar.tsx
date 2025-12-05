"use client";
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

export default function ClientNavbar() {
  const { user } = useAuth();
  if (user) return null;
  return <Navbar />;
}
