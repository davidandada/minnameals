import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-(--header-height) flex items-center px-6 bg-baedaGrey-800 border-b border-b-baedaOrange-500 z-(--mui-zIndex-appBar)">
      <Image src="/images/header.svg" alt="Baeda" loading="eager" width={221} height={36} />
    </header>
  );
}
