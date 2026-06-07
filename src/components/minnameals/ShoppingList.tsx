"use client";

import { useState } from "react";
import classNames from "classnames";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { type ListItem } from "../../types/api/minnameals/listItems";

type Props = {
  data: ListItem[];
};

export default function ShoppingList({ data }: Props) {
  const [checked, setChecked] = useState([0]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const renderList = () => {
    return data.map((listItem) => {
      const isChecked = checked.includes(listItem.id);
      return (
        <ListItem
          disablePadding
          key={listItem.id}
          secondaryAction={
            <>
              <IconButton edge="end" aira-label="edit" color="info">
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" color="error">
                <DeleteRoundedIcon />
              </IconButton>
            </>
          }
        >
          <ListItemButton role={undefined} onClick={handleToggle(listItem.id)} dense>
            <ListItemIcon>
              <Checkbox
                checked={isChecked}
                disableRipple
                edge="start"
                slotProps={{ input: { "aria-labelledby": listItem.item } }}
                tabIndex={-1}
              />
            </ListItemIcon>
            <ListItemText
              id={listItem.id}
              primary={listItem.item}
              className={classNames({
                "line-through": isChecked,
              })}
            />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper", marginInline: "auto" }}>
      <List>
        {renderList()}
        <Divider />
        <ListItem>
          <Button className="w-full" startIcon={<AddIcon />}>
            Add item
          </Button>
        </ListItem>
      </List>
    </Box>
  );
}
