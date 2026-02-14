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
  const pathname = usePathname();
  const isActive = pathname === link;

  return (
    <Link
      href={link}
      prefetch={true}
      className={`sidebar-item ${isActive ? 'active' : ''}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default NavItem;