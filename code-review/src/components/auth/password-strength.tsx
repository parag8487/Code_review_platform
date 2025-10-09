"use client";

import { cn } from "@/lib/utils";
import React from 'react';

type PasswordStrengthProps = {
  password?: string;
};

const getStrength = (password: string | undefined): [number, string, string] => {
  if (!password) return [0, "", ""];
  let score = 0;
  const checks = [
    /.{8,}/,       // length >= 8
    /[a-z]/,      // lowercase
    /[A-Z]/,      // uppercase
    /[0-9]/,      // numbers
    /[^a-zA-Z0-9]/ // special chars
  ];

  checks.forEach(regex => {
    if (regex.test(password)) {
      score++;
    }
  });

  switch (score) {
    case 0:
    case 1:
    case 2:
      return [score, "Weak", "bg-destructive"];
    case 3:
      return [score, "Medium", "bg-muted-foreground"];
    case 4:
    case 5:
      return [score, "Strong", "bg-primary"];
    default:
      return [0, "", ""];
  }
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, label, color] = getStrength(password);

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-1.5 w-full flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all duration-300", color)}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-14 text-right">{label}</span>
    </div>
  );
}
