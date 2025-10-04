'use client';

import { truncate } from "fs/promises";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
    label: string;
    link: string;
    icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({
    label,
    link,
    icon,
}) => {
    const pathname = usePathname()
  return (
    <Link href={link} prefetch={true} className={`flex p-4 items-center w-full hover:bg-cyan-800 font-medium
        ${pathname === link ? 'bg-cyan-900 border-r-5 border-r-orange-200': ''}`}>
        <div className="mr-1">{icon}</div>
        <div>{label}</div>
    </Link>
  )
}

export default NavItem