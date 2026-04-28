import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  Group,
  Logout,
  ManageAccounts,
  Menu as MenuIcon,
  People,
  PointOfSale,
  Receipt,
  RestaurantMenu,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const logoImg = "/android-chrome-192x192.png";

const menuItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/home" },
  { label: "Funcionarios", icon: <People />, path: "/funcionarios" },
  { label: "Clientes", icon: <Group />, path: "/clientes" },
  { label: "Produtos", icon: <RestaurantMenu />, path: "/produtos" },
  { label: "Comandas", icon: <Receipt />, path: "/comandas" },
  { label: "Caixa", icon: <PointOfSale />, path: "/caixa" },
];

const renderUserAvatar = ({ usuario, getIniciais, navigate, size = 36 }) => (
  <Avatar
    src={usuario?.avatar || undefined}
    sx={{
      width: size,
      height: size,
      bgcolor: "secondary.main",
      color: "primary.main",
      fontWeight: 800,
      cursor: "pointer",
    }}
    onClick={() => navigate("/perfil")}
  >
    {getIniciais()}
  </Avatar>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getIniciais, isAuthenticated, logout, usuario } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ width: 272 }}>
      <Box
        sx={{
          p: 2,
          color: "white",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img
            src={logoImg}
            alt="Logo Comandas App"
            style={{ width: 38, height: 38, borderRadius: 8 }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Comandas Stuani</Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {usuario?.nome}
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ p: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              bgcolor: isActive(item.path) ? "rgba(245, 158, 11, 0.12)" : "transparent",
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? "secondary.main" : "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List sx={{ p: 1 }}>
        <ListItemButton
          onClick={() => {
            navigate("/perfil");
            setDrawerOpen(false);
          }}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon>
            <ManageAccounts />
          </ListItemIcon>
          <ListItemText primary="Perfil" />
        </ListItemButton>

        <ListItemButton
          onClick={() => {
            setDrawerOpen(false);
            setLogoutDialogOpen(true);
          }}
          sx={{ borderRadius: 2, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={3}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate(isAuthenticated ? "/home" : "/login")}
          >
            <img
              src={logoImg}
              alt="Logo Comandas Stuani"
              style={{ width: 34, height: 34, borderRadius: 8 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
              Comandas Stuani
            </Typography>
          </Box>

          {isAuthenticated && (
            <>
              <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
                {menuItems.map((item) => (
                  <Tooltip key={item.path} title={item.label}>
                    <Button
                      color="inherit"
                      onClick={() => navigate(item.path)}
                      sx={{
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: isActive(item.path) ? "rgba(245, 158, 11, 0.18)" : "transparent",
                      }}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
                ))}

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 1, borderColor: "rgba(255,255,255,0.16)" }}
                />

                <Tooltip title={usuario?.nome || "Perfil"}>
                  <IconButton color="inherit" onClick={() => navigate("/perfil")}>
                    {renderUserAvatar({ usuario, getIniciais, navigate })}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Sair">
                  <IconButton color="inherit" onClick={() => setLogoutDialogOpen(true)}>
                    <Logout />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
                {renderUserAvatar({ usuario, getIniciais, navigate, size: 34 })}
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {drawer}
      </Drawer>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sair do sistema"
        message="Tem certeza que deseja encerrar a sessao atual?"
        confirmLabel="Sim, sair"
        cancelLabel="Cancelar"
        severity="warning"
        onConfirm={() => {
          setLogoutDialogOpen(false);
          logout();
        }}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  );
};

export default Navbar;
