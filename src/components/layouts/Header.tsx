import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed h-(--header-height) w-full flex items-center px-6 bg-baedaGrey-800 border-b border-b-baedaOrange-500 z-(--mui-zIndex-appBar)">
      <Image src="/images/minnameals/header.svg" alt="" loading="eager" width={221} height={36} />
    </header>
  );
}
