'use client';

import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/dashboard/Header";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
} 