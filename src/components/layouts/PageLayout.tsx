type Props = {
  children: React.ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <main className="mx-auto max-w-7xl min-h-(--content-min-height) px-8 pt-(--content-top-padding) pb-16">
      {children}
    </main>
  );
}
