import Image from "next/image";

export default function Header() {
  return (
    <header className="h-(--header-height) w-full flex items-center px-6 border-b border-b-baedaOrange-500">
      <Image src="/images/minnameals/header.svg" alt="Minna Meals" width={221} height={36} />
    </header>
  );
}
