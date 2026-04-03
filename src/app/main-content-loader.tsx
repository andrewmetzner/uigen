"use client";

import dynamic from "next/dynamic";

const MainContent = dynamic(
  () => import("./main-content").then((m) => m.MainContent),
  { ssr: false, loading: () => null }
);

export { MainContent };
