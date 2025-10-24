"use client";

import type { User } from "@/app/classroom/[id]/page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Crown, Trash2, ShieldX } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserRosterProps {
  users: User[];
  isOwner: boolean;
  onRemoveUser: (userId: string) => void;
  onKickAndClear: (userId: string) => void;
}

export function UserRoster({ users, isOwner, onRemoveUser, onKickAndClear }: UserRosterProps) {
  return (
    <footer className="shrink-0 border-t bg-card">
      <TooltipProvider>
      <ScrollArea className="h-28 w-full">
        <div className="flex h-full items-center gap-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="group relative flex w-24 flex-col items-center gap-2 text-center">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="relative w-full">
                <p className="truncate text-sm font-medium">{user.name}</p>
                {user.isOwner && (
                  <Crown className="absolute -top-5 left-1/2 h-4 w-4 -translate-x-1/2 text-yellow-500" />
                )}
              </div>
              {isOwner && !user.isOwner && (
                 <div className="absolute -top-2 -right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove user</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove User</p>
                    </TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 bg-red-800 hover:bg-red-900"
                        onClick={() => onKickAndClear(user.id)}
                      >
                        <ShieldX className="h-4 w-4" />
                        <span className="sr-only">Kick user and clear code</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Kick the f***er</p>
                    </TooltipContent>
                  </Tooltip>
                 </div>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      </TooltipProvider>
    </footer>
  );
}
