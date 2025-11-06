import type { MenuProps } from "@mui/material/Menu";
import { bookQATests } from "./questions/booktests/bookqatests";
import { Link } from "react-router";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

export const TestsMenu = (props: {
  anchorElement: MenuProps["anchorEl"];
  handleClose: () => void;
}) => {
  return (
    <Menu
      id="menu-appbar"
      anchorEl={props.anchorElement}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(props.anchorElement)}
      onClose={props.handleClose}
    >
      {
        // todo go for nested
        bookQATests.map((bookTestSection, sectionIndex) =>
          bookTestSection.map((bookTest, testIndex) => (
            <Link
              key={testIndex}
              to={`/booktest/${sectionIndex + 1}/${testIndex + 1}`}
              style={{ textDecoration: "none" }}
            >
              <MenuItem
                LinkComponent={Link}
                onClick={props.handleClose}
              >{`Section ${sectionIndex + 1} - Test ${
                testIndex + 1
              }`}</MenuItem>
            </Link>
          ))
        )
      }
    </Menu>
  );
};
