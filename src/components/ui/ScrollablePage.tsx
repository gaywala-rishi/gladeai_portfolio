"use client";

import { useEffect } from "react";

export default function ScrollablePage({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("scrollable");
    return () => document.body.classList.remove("scrollable");
  }, []);

  return <>{children}</>;
}
