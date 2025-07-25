import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconBook,
  IconList,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "AFF BOOKS",
  },
  {
    id: uniqueId(),
    title: "Upload AFF Book",
    icon: IconBook,
    href: "/book-upload",
  },
  {
    id: uniqueId(),
    title: "AFF Books List",
    icon: IconList,
    href: "/books-list",
  },
  {
    navlabel: true,
    subheader: "BANNER",
  },
  {
    id: uniqueId(),
    title: "Banner Upload",
    icon: IconAperture,
    href: "/banner-upload",
  },
  {
    id: uniqueId(),
    title: "Banners List",
    icon: IconList,
    href: "/banner-list",
  },
  {
    navlabel: true,
    subheader: "CATEGORIES",
  },
  {
    id: uniqueId(),
    title: "Category Upload",
    icon: IconAperture,
    href: "/category-upload",
  },
  {
    id: uniqueId(),
    title: "Categories List",
    icon: IconList,
    href: "/categories-list",
  },
  {
    navlabel: true,
    subheader: "HOME",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "UTILITIES",
  },
  {
    id: uniqueId(),
    title: "Typography",
    icon: IconTypography,
    href: "/utilities/typography",
  },
  {
    id: uniqueId(),
    title: "Shadow",
    icon: IconCopy,
    href: "/utilities/shadow",
  },
  {
    navlabel: true,
    subheader: " EXTRA",
  },
  {
    id: uniqueId(),
    title: "Icons",
    icon: IconMoodHappy,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "Sample Page",
    icon: IconAperture,
    href: "/sample-page",
  },

];

export default Menuitems;


