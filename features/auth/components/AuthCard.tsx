import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export interface AuthCardProps {
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  description,
  footerText,
  footerLinkText,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-slate-900 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight font-bold">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="text-center pb-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {children}

          <div className="pt-4 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              {footerText}{" "}
              <Link
                href={footerLinkHref}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

