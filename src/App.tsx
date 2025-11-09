import { AppBar, Button, Link, Toolbar } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router";
import { TestsMenu } from "./TestsMenu";
import { Link as RouterLink } from "react-router";

export function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit">Homework</Button>
          <Button onClick={handleMenu} color="inherit">
            Tests
          </Button>
          <Button color="inherit" component={RouterLink} to="/demodexie">
            Demo Dexie
          </Button>
          <TestsMenu anchorElement={anchorEl} handleClose={handleClose} />
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}
