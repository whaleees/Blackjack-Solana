import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
};

export function AppHero({ title, subtitle, children }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* soft beams */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[480px] w-[900px] rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-36 right-1/3 h-[360px] w-[640px] rounded-full bg-gradient-to-r from-pink-500/30 to-yellow-500/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm md:text-base opacity-80">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
