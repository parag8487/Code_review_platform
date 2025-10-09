"use client";

import { Icons } from "@/components/icons";
import Link from "next/link";
import AuthBackground from "@/components/auth/AuthBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
