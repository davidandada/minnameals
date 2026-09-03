"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemButton,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  onClick?: () => void;
  isDeleting?: boolean;
  disabled?: boolean;
  dndRef?: (node: HTMLElement | null) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  deleteLabel?: string;
  sx?: SxProps<Theme>;
  showHoverDelete?: boolean;
};

export default function SwipeableRow({
  children,
  onDelete,
  onClick,
  isDeleting = false,
  disabled = false,
  dndRef,
  onBlur,
  onFocus,
  deleteLabel = "delete",
  sx,
  showHoverDelete = true,
}: Props) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const isSwipingHorizontally = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isDeleting) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    isSwipingHorizontally.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || disabled || isDeleting) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    if (isSwipingHorizontally.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isSwipingHorizontally.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isSwipingHorizontally.current) {
      // Only allow swiping left (negative offset)
      const offset = Math.min(0, diffX);
      setSwipeOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || isDeleting) return;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 360;
    const threshold = viewportWidth * 0.75; // 75% viewport requirement

    if (Math.abs(swipeOffset) >= threshold) {
      setSwipeOffset(-viewportWidth);
      onDelete();
    } else {
      setSwipeOffset(0);
    }

    setTouchStartX(null);
    setTouchStartY(null);
    isSwipingHorizontally.current = null;
  };

  const handleClick = () => {
    if (swipeOffset !== 0) {
      setSwipeOffset(0);
      return;
    }
    onClick?.();
  };

  return (
    <ListItem
      disablePadding
      ref={dndRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden rounded-lg"
      sx={{
        backgroundColor: "transparent",
        "@media (hover: hover)": {
          "&:hover .hover-delete-btn": {
            width: 32,
            opacity: 1,
            pointerEvents: "auto",
            ml: 0.5,
          },
        },
      }}
    >
      {/* Mobile Swipe Delete Action Container & In-Flight Loading State */}
      <Box
        className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-4 z-0 rounded-lg bg-baedaRed-500"
        sx={{
          backgroundColor: "var(--mui-palette-baedaRed-500)",
          width: isDeleting ? "100%" : Math.max(64, Math.abs(swipeOffset)),
          transform: isDeleting || swipeOffset < 0 ? "translateX(0)" : "translateX(100%)",
          transition: swipeOffset === 0 || isDeleting ? "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.25s ease" : "none",
        }}
      >
        {isDeleting ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "var(--mui-palette-baedaGrey-50)", pr: 2 }}>
            <CircularProgress size={20} sx={{ color: "var(--mui-palette-baedaGrey-50)" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--mui-palette-baedaGrey-50)" }}>
              Deleting...
            </Typography>
          </Box>
        ) : (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={deleteLabel}
            sx={{
              color: "var(--mui-palette-baedaGrey-50)",
              "&:active": {
                transform: "scale(0.85)",
              },
            }}
          >
            <DeleteRoundedIcon />
          </IconButton>
        )}
      </Box>

      {/* Row Interactive Surface */}
      <ListItemButton
        role={undefined}
        onClick={handleClick}
        dense
        onBlur={onBlur}
        onFocus={onFocus}
        sx={{
          position: "relative",
          zIndex: 1,
          transform: isDeleting ? "translateX(-100%)" : `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 || isDeleting ? "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          backgroundColor: "transparent",
          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "var(--mui-palette-baedaGrey-700)",
            },
            "&:hover .hover-delete-btn": {
              width: 32,
              opacity: 1,
              pointerEvents: "auto",
              ml: 0.5,
            },
          },
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          py: 0.75,
          px: 1,
          ...sx,
        }}
      >
        {children}

        {/* Web Hover Delete Button */}
        {showHoverDelete && swipeOffset === 0 && !isDeleting && (
          <Box
            className="hover-delete-btn"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 0,
              opacity: 0,
              overflow: "hidden",
              pointerEvents: "none",
              transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, margin 0.2s ease",
              ml: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              aria-label={deleteLabel}
              color="baedaRed"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "var(--mui-palette-baedaRed-100)",
                },
              }}
            >
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
}
