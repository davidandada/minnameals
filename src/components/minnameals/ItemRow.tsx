import { useMemo, useState } from "react";
import classNames from "classnames";
import {
  ListItem,
  IconButton,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Input,
  TextField,
} from "@mui/material";
import { ListItemApi } from "../../types/api/minnameals/listItems";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditIcon from "@mui/icons-material/Edit";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { updateListItem } from "../../app/api/listItems";

type Props = {
  item: ListItemApi;
};

export default function ItemRow({ item }: Props) {
  const [isItemInEdit, setIsItemInEdit] = useState<boolean>(false);
  const [updatedItemName, setUpdatedItemName] = useState(item.item);

  const handleToggle = () => {
    if (isItemInEdit) return;
    Promise.try(() => updateListItem({ ...item, is_checked: !item.is_checked }));
  };

  const handleDeleted = () => {
    Promise.try(() => updateListItem({ ...item, is_archived: true }));
  };

  const handleItemNameUpdated = () => {
    Promise.try(() => updateListItem({ ...item, item: updatedItemName })).then(() => {
      item.item = updatedItemName;
    });
  };

  const toggleEditForItem = () => {
    setIsItemInEdit((prev) => !prev);
  };

  const updateItemName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedItemName(e.currentTarget.value);
  };

  const handleEditInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!updatedItemName) {
      handleDeleted();
    } else if (event.relatedTarget?.id === "cancelIcon" || event.relatedTarget?.id === "editItemInput") {
      setUpdatedItemName(item.item);
    } else if (item.item !== updatedItemName) {
      handleItemNameUpdated();
    }
    setIsItemInEdit(false);
  };

  const isChecked = item.is_checked;
  return (
    <ListItem
      disablePadding
      key={item.id}
      secondaryAction={
        <>
          <IconButton
            aira-label="edit"
            color={isItemInEdit ? "warning" : "info"}
            id="cancelIcon"
            onClick={toggleEditForItem}
          >
            {isItemInEdit ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          <IconButton aria-label="delete" color="error" onClick={handleDeleted}>
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </>
      }
    >
      <ListItemButton role={undefined} onClick={handleToggle} dense>
        <ListItemIcon>
          <Checkbox
            checked={isChecked}
            checkedIcon={<CheckCircleIcon className="text-baedaOrange-200" />}
            disableRipple
            edge="start"
            icon={<CircleOutlinedIcon className="text-baedaGrey-50" />}
            slotProps={{ input: { "aria-labelledby": item.item } }}
            tabIndex={-1}
          />
        </ListItemIcon>
        {isItemInEdit ? (
          <TextField
            autoFocus
            color="baedaOrange"
            fullWidth
            id="editItemInput"
            onBlur={handleEditInputBlur}
            onChange={updateItemName}
            size="small"
            value={updatedItemName}
            variant="standard"
          />
        ) : (
          <ListItemText
            className={classNames(isChecked ? "line-through text-baedaOrange-200" : "text-baedaGrey-50")}
            id={`shopping-list-item-${item.id}`}
            primary={item.item}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
}
