"use client";

import Image from "next/image";
import { ActiveElement, NavbarProps } from "@/types/type";
import ActiveUsers from "./users/ActiveUsers";


const Navbar = ({ activeElement, imageInputRef, handleImageUpload, handleActiveElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 px-5 py-2 text-white">
      <Image src="/assets/logo.png" alt="Figman Logo" width={104} height={24} />

      <ActiveUsers />
    </nav>
  );
};

export default Navbar;