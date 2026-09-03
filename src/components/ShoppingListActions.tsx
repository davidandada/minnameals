"use client";

import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import CategoryIcon from "@mui/icons-material/Category";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-description"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--mui-palette-baedaGrey-800)",
              backgroundImage: "none",
              border: "1px solid var(--mui-palette-baedaGrey-700)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "380px",
              p: 0.5,
            },
          },
        }}
      >
        <DialogTitle
          id="clear-dialog-title"
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: "var(--mui-palette-baedaOrange-500)", fontSize: 26 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: "var(--mui-palette-baedaGrey-50)" }}>
            Clear shopping list?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 1, px: 3 }}>
          <DialogContentText
            id="clear-dialog-description"
            sx={{
              color: "var(--mui-palette-baedaGrey-200)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}
          >
            This will archive all items currently on your shopping list. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmClearOpen(false)}
            color="baedaRed"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClear}
            color="baedaRed"
            variant="contained"
            size="small"
            disabled={isClearing}
            autoFocus
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 2,
            }}
          >
            Clear List
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        open={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </>
  );
}
