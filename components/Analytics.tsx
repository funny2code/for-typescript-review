"use client";

import { analytics } from "hooks/useSegment";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    analytics.page();
  }, [pathname]);

  return null;
}
