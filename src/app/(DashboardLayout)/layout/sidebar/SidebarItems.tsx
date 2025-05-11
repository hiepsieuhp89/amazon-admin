import React from "react";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import './style.css'
import {
  IconUsers,
  IconTransactionDollar,
  IconBuildingWarehouse,
  IconPackages,
  IconBrandTelegram,
  IconLayoutGridAdd,
  IconPrinter,
  IconLayoutDashboard,
  IconArchive,
  IconBell,
  IconSettings,
  IconShoppingCart,
  IconTicket,
} from "@tabler/icons-react"
import { useGetProfileData } from "@/hooks/authentication";

const generateUniqueId = (() => {
  const usedIds = new Set()
  return () => {
    let id
    do {
      id = Math.floor(Math.random() * 1000000) // Generate a random number
    } while (usedIds.has(id))
    usedIds.add(id)
    return id
  }
})()

const Menuitems = [
  {
    navlabel: true,
    subheader: "Menu",
  },
  {
    id: generateUniqueId(),
    title: "Bảng điều khiển",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý POS",
    icon: IconPrinter,
    href: "/admin/pos",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý người dùng",
    icon: IconUsers,
    href: "/admin/users",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý cửa hàng",
    icon: IconBuildingWarehouse,
    href: "/admin/shops",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý đơn hàng",
    icon: IconShoppingCart,
    href: "/admin/orders",
  },
  {
    id: generateUniqueId(),
    title: "Các sản phẩm",
    icon: IconArchive,
    href: "javascript:void(0)",
    children: [
      {
        id: generateUniqueId(),
        title: "Thêm sản phẩm mới",
        href: "/admin/products/create-new",
      },
      {
        id: generateUniqueId(),
        title: "Tất cả sản phẩm",
        href: "/admin/products",
      },
    ],
  },
  {
    id: generateUniqueId(),
    title: "Quản lý đánh giá",
    icon: IconLayoutGridAdd,
    href: "/admin/fake-reviews",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý danh mục",
    icon: IconLayoutGridAdd,
    href: "/admin/categories",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý nạp/rút",
    icon: IconTransactionDollar,
    href: "/transaction/history",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý mã mời",
    icon: IconTicket,
    href: "/admin/invitation-codes",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý gói bán hàng",
    icon: IconPackages,
    href: "/admin/seller-packages",
  },
  {
    id: generateUniqueId(),
    title: "Quản lý gói quảng bá",
    icon: IconBrandTelegram,
    href: "/admin/spread-packages",
  },
  {
    id: generateUniqueId(),
    title: "Thông báo",
    icon: IconBell,
    href: "javascript:void(0)",
    children: [
      {
        id: generateUniqueId(),
        title: "Phê duyệt cửa hàng mới",
        href: "/admin/notifications/store-approval",
      },
      {
        id: generateUniqueId(),
        title: "Lệnh nạp",
        href: "/admin/notifications/deposit-orders",
      },
      {
        id: generateUniqueId(),
        title: "Lệnh rút",
        href: "/admin/notifications/withdraw-orders",
      },
      {
        id: generateUniqueId(),
        title: "Tin nhắn với người bán",
        href: "/admin/notifications/seller-messages",
      },
      {
        id: generateUniqueId(),
        title: "Tin nhắn mail",
        href: "/admin/notifications/email-messages",
      },
      {
        id: generateUniqueId(),
        title: "Tìm kiếm của người dùng",
        href: "/admin/notifications/user-searches",
      },
    ],
  },
  {
    id: generateUniqueId(),
    title: "Thiết lập và cấu hình",
    icon: IconSettings,
    href: "javascript:void(0)",
    children: [
      {
        id: generateUniqueId(),
        title: "Kích hoạt tính năng",
        href: "/admin/settings/feature-activation",
      },
      {
        id: generateUniqueId(),
        title: "Cấu hình vận chuyển",
        href: "/admin/settings/shipping-config",
      },
      {
        id: generateUniqueId(),
        title: "Nước vận chuyển",
        href: "/admin/settings/shipping-countries",
      },
      {
        id: generateUniqueId(),
        title: "Shipping States",
        href: "/admin/settings/shipping-states",
      },
      {
        id: generateUniqueId(),
        title: "Thành phố vận chuyển",
        href: "/admin/settings/shipping-cities",
      },
      {
        id: generateUniqueId(),
        title: "Shipping Zones",
        href: "/admin/settings/shipping-zones",
      },
      {
        id: generateUniqueId(),
        title: "Shipping Carrier",
        href: "/admin/settings/shipping-carriers",
      },
      {
        id: generateUniqueId(),
        title: "Quản lý Template Email",
        href: "/admin/settings/email-templates",
      },
    ],
  },
]

const filterMenuItems = (items: any[], role?: string, shopName?: string) => {
  if (role === "supper_admin") return items;

  if (role === "admin") {
    if (shopName === "admin2") {
      return items.filter(item => 
        ["Quản lý người dùng", "Quản lý nạp/rút", "Thông báo"].includes(item.title)
      );
    } else if (!shopName) {
      return items.filter(item => 
        ["Quản lý POS", "Quản lý cửa hàng", "Quản lý đơn hàng", "Các sản phẩm", "Quản lý đánh giá", "Thông báo", "Quản lý mã mời"].includes(item.title)
      );
    }
  }

  return items;
};

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const {profileData} = useGetProfileData()
  
  const filteredMenuItems = filterMenuItems(
    Menuitems,
    profileData?.data?.role,
    profileData?.data?.shopName
  );

  return (
    <List sx={{ pt: 0 }} className="sidebarNav" component="div">
      {filteredMenuItems.map((item) => {
        if (item.subheader) {
          return <NavGroup item={item} key={item.subheader} />;
        } else {
          return (
            <NavItem
              item={item as any}
              key={item.id}
              pathDirect={pathDirect}
              onClick={toggleMobileSidebar}
            />
          );
        }
      })}
    </List>
  );
};
export default SidebarItems;
