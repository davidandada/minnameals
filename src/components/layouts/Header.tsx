import { Typography } from "@mui/material";

export default function Header() {
  return (
    <header className="h-(--header-height) w-full flex items-center px-4">
      <Typography variant="h3" component="h1">
        Minna皆Meals
      </Typography>
    </header>
  );
}
