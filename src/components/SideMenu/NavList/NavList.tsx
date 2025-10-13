import React from "react";
import { FaRegFolder } from "react-icons/fa";
import NavItem from "./NavItem/NavItem";
import { RiTeamFill } from "react-icons/ri";
import { MdSend } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { LuChartGantt } from "react-icons/lu";

interface NavItemType {
    id: number;
    label: string;
    link: string;
    icon: React.ReactNode;
}

const NavList = () => {
    const navList: NavItemType[] = [
        {id: 1, label: "Tasks", link: "/", icon: <FaRegFolder className="size-5"/>},
        {id: 2, label: "Gantt Chart", link: "/gantt", icon: <LuChartGantt className="size-5"/>},
        {id: 3, label: "Projects", link: "/projects", icon: <RiTeamFill className="size-5"/>},
        {id: 4, label: "Contact", link: "/contact", icon: <MdSend className="size-5"/>},
        {id: 5, label: "Settings", link: "/settings", icon: <IoMdSettings className="size-5"/>},
    ];
  return (
    <div className="mt-8">
        {navList.map((item) => (
            <NavItem key={item.id} label={item.label} link={item.link} icon={item.icon} />
        ))}
    </div>
  )
}

export default NavList;