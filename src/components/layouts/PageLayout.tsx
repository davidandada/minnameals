type Props = {
  children: React.ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <main className="mx-auto max-w-7xl w-full h-[calc(100dvh-var(--header-height))] mt-[var(--header-height)] px-4 sm:px-8 py-6 overflow-hidden flex flex-col">
      {children}
    </main>
  );
}
