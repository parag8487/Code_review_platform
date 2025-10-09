"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      asChild
      className="absolute top-4 left-4 md:top-8 md:left-8"
    >
      <Link href="/code-review">
        <ArrowLeft />
        <span className="sr-only">Back to Code Reviews</span>
      </Link>
    </Button>
  );
}