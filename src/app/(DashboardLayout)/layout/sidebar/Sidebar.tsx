import { useMediaQuery, Box, Drawer } from "@mui/material";
import Logo from "../shared/logo/Logo";
import SidebarItems from "./SidebarItems";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("xl"));
  const sidebarWidth = "250px";

  const sidebarStyle = {
    overflowX: "hidden",
    "&:hover": {
      overflowY: "auto",
    },
    "&::-webkit-scrollbar": {
      width: "6px",
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.2)",
      borderRadius: "3px",
    },
    scrollbarGutter: "stable",
    width: sidebarWidth,
    boxSizing: "border-box",
    backgroundColor: "#263238",
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: "#263238",
            }
          }}
          PaperProps={{
            sx: {
              ...sidebarStyle,
            }
          }}
        >
          <Box px={0} className="!w-full flex justify-center">
            <Logo />
          </Box>
          <SidebarItems />
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: "#263238",
        }
      }}
      PaperProps={{
        sx: {
          ...sidebarStyle,
          boxShadow: (theme) => theme.shadows[8],
        }
      }}
    >
      <Box px={2} >
        <Logo />
      </Box>
      <SidebarItems />
    </Drawer>
  );
};

export default Sidebar;
