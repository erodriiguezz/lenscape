import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Lenscape</h1>
        <p className="max-w-md text-muted-foreground">
          Turn any 3D model into an interactive, AI-narrated presentation.
        </p>
      </div>
      <Link href="/editor" className={buttonVariants()}>
        Open editor
      </Link>
      {/* TODO: public viewer mode — landing will also link to published tours */}
    </main>
  );
}
