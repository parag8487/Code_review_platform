"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react";

interface OwnerIndicatorProps {
  ownerName: string;
}

export function OwnerIndicator({ ownerName }: OwnerIndicatorProps) {
  return (
    <div className="absolute top-20 right-4 z-10 flex animate-in fade-in zoom-in-95 items-center gap-2 rounded-full border bg-card p-2 pr-4 shadow-lg">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{ownerName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-xs font-medium leading-none">{ownerName}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Crown className="h-3 w-3 text-yellow-500" />
          <span>Owner</span>
        </p>
      </div>
    </div>
  );
}
