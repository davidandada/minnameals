"use client";

import React, { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import CategoryIcon from "@mui/icons-material/Category";
import ClearListDialog from "@/components/ClearListDialog";
import ManageCategoriesModal from "@/components/ManageCategoriesModal";
import { SortMode } from "@/helpers/listPreferences";

type Props = {
  sortMode: SortMode;
  onSelectSortMode: (mode: SortMode) => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  onClearList: () => void;
  isClearing?: boolean;
};

export default function ShoppingListActions({
  sortMode,
  onSelectSortMode,
  showCompleted,
  onToggleShowCompleted,
  onClearList,
  isClearing = false,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupByAnchorEl, setGroupByAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const isMenuOpen = Boolean(anchorEl);
  const isGroupByOpen = Boolean(groupByAnchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setGroupByAnchorEl(null);
  };

  const handleOpenGroupBy = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setGroupByAnchorEl(event.currentTarget);
  };

  const handleCloseGroupBy = () => {
    setGroupByAnchorEl(null);
  };

  const handleSelectSortMode = (mode: SortMode) => {
    onSelectSortMode(mode);
    handleCloseMenu();
  };

  const handleToggleShowCompleted = () => {
    onToggleShowCompleted();
    handleCloseMenu();
  };

  const handleOpenCategoriesModal = () => {
    handleCloseMenu();
    setIsCategoriesModalOpen(true);
  };

  const handleOpenConfirmClear = () => {
    handleCloseMenu();
    setConfirmClearOpen(true);
  };

  const handleConfirmClear = () => {
    onClearList();
    setConfirmClearOpen(false);
  };

  return (
    <>
      <IconButton
        aria-label="more actions"
        aria-controls={isMenuOpen ? "shopping-list-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isMenuOpen ? "true" : undefined}
        onClick={handleOpenMenu}
        sx={{
          color: "var(--mui-palette-baedaGrey-100)",
          backgroundColor: "var(--mui-palette-baedaGrey-700)",
          border: "1px solid var(--mui-palette-baedaGrey-700)",
          "&:hover": {
            backgroundColor: "var(--mui-palette-baedaGrey-600)",
          },
          width: 36,
          height: 36,
        }}
      >
        <MoreHorizIcon />
      </IconButton>

      {/* More Actions Main Menu */}
      <Menu
        id="shopping-list-actions-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              minWidth: 220,
              mt: 1,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              py: 0.5,
            },
          },
        }}
      >
        {/* Categories Option */}
        <MenuItem onClick={handleOpenCategoriesModal} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Categories" />
        </MenuItem>

        {/* Group By Option */}
        <MenuItem onClick={handleOpenGroupBy} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon>
            <SortIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Group By"
            secondary={sortMode === "category" ? "Category" : "Default"}
            slotProps={{ secondary: { variant: "caption" } }}
          />
          <ChevronRightIcon fontSize="small" sx={{ opacity: 0.5, ml: 1 }} />
        </MenuItem>

        {/* Show / Hide Completed Option */}
        <MenuItem onClick={handleToggleShowCompleted} sx={{ py: 1.25, px: 2 }}>
          <ListItemIcon>
            {showCompleted ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={showCompleted ? "Hide Completed" : "Show Completed"} />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Clear List Option */}
        <MenuItem onClick={handleOpenConfirmClear} sx={{ py: 1.25, px: 2, color: "var(--mui-palette-baedaRed-500)" }}>
          <ListItemIcon sx={{ color: "var(--mui-palette-baedaRed-500)" }}>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Clear"
            slotProps={{
              primary: {
                sx: { fontWeight: 600 },
              },
            }}
          />
        </MenuItem>
      </Menu>

      {/* Group By Sub-menu */}
      <Menu
        id="shopping-list-group-by-submenu"
        anchorEl={groupByAnchorEl}
        open={isGroupByOpen}
        onClose={handleCloseGroupBy}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              minWidth: 160,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem onClick={() => handleSelectSortMode("position")} sx={{ py: 1, px: 2 }}>
          <ListItemText primary="Default" />
          {sortMode === "position" && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => handleSelectSortMode("category")} sx={{ py: 1, px: 2 }}>
          <ListItemText primary="Category" />
          {sortMode === "category" && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
        </MenuItem>
      </Menu>

      {/* Clear Confirmation Dialog */}
      <ClearListDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleConfirmClear}
        isClearing={isClearing}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        open={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </>
  );
}
