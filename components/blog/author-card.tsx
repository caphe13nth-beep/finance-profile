"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AuthorCardProps {
  name: string;
  title: string | null;
  photo_url: string | null;
  bio: string | null;
}

export function AuthorCard({ name, title, photo_url, bio }: AuthorCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        {photo_url ? (
          <Image
            src={photo_url}
            alt={name}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <User className="h-6 w-6 text-accent" />
          </div>
        )}
        <div>
          <p className="font-heading font-semibold text-foreground">{name}</p>
          {title && (
            <p className="text-sm text-muted-foreground">{title}</p>
          )}
        </div>
      </div>
      {bio && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {bio}
        </p>
      )}
    </div>
  );
}
