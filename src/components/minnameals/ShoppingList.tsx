import { type ListItem } from "../../types/api/minnameals/listItems";

type Props = {
  data: ListItem[];
};

export default function ShoppingList({ data }: Props) {
  const renderList = () => {
    return data.map((listItem) => <h2 key={listItem.id}>{listItem.item}</h2>);
  };

  return <>{renderList()}</>;
}
