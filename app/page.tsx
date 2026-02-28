import dynamic from "next/dynamic";
import { Suspense } from "react";

const EisenhowerMatrix = dynamic(() => import("@/features/todos").then((mod) => mod.EisenhowerMatrix), {
  ssr: true,
});

/**
 * The root page of the application that renders the Eisenhower Matrix.
 * Uses dynamic loading for better initial bundle performance.
 * @returns {JSX.Element} The rendered home page.
 */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <EisenhowerMatrix />
    </Suspense>
  );
}

