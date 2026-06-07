"use client";

import { useMemo, useState } from "react";
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
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { type ListItemApi } from "../../types/api/minnameals/listItems";

type Props = {
  data: ListItemApi[];
};

export default function ShoppingList({ data }: Props) {
  const [checked, setChecked] = useState([...data.filter((item) => item.is_checked).map((item) => item.id)]);

  const [uncheckedItems, checkedItems] = useMemo(() => {
    if (!data || !data.length) return [[], []];
    return data.reduce(
      (acc, item) => {
        if (item.is_checked || checked.includes(item.id)) {
          acc[1].push(item);
        } else {
          acc[0].push(item);
        }
        return acc;
      },
      [[], []],
    );
  }, [checked, data]);

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

  const renderList = (items) => {
    if (!items || !items.length) return null;
    return (
      <>
        {items.map((listItem) => {
          const isChecked = checked.includes(listItem.id);
          return (
            <ListItem disablePadding key={listItem.id}>
              <ListItemButton role={undefined} onClick={handleToggle(listItem.id)} dense>
                <ListItemIcon>
                  <Checkbox
                    checked={isChecked}
                    icon={<CircleOutlinedIcon className="text-baedaGrey-50" />}
                    checkedIcon={<CheckCircleIcon className="text-baedaOrange-200" />}
                    disableRipple
                    edge="start"
                    slotProps={{ input: { "aria-labelledby": listItem.item } }}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText
                  id={`shopping-list-item-${listItem.id}`}
                  primary={listItem.item}
                  className={classNames(isChecked ? "line-through text-baedaOrange-200" : "text-baedaGrey-50")}
                />
                <IconButton aira-label="edit" color="info">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label="delete" color="error">
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          );
        })}
        <Divider />
      </>
    );
  };

  return (
    <List className="max-w-130.5 mx-auto h-6 flex flex-col gap-2">
      <Typography variant="h4" component="h2" className="mb-6 text-baedaOrange-500">
        Shopping list
      </Typography>
      {renderList(uncheckedItems)}
      {renderList(checkedItems)}
      <ListItem disablePadding>
        <Button className="w-full normal-case flex gap-2 justify-start text-baedaOrange-500" size="large">
          <AddCircleIcon sx={{ fontSize: 24 }} className="text-baedaOrange-500" />
          Add item
        </Button>
      </ListItem>
    </List>
  );
}
