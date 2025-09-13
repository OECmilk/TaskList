'use client';

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
    <Link href={link} className={`flex p-4 items-center w-full hover:bg-gray-700 font-medium
        ${pathname === link ? 'bg-gray-600 border-r-4 border-r-green-500': ''}`}>
        <div className="mr-1">{icon}</div>
        <div>{label}</div>
    </Link>
  )
}

export default NavItem