"use client";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import { selectFolders } from "@redux/reducers/folderReducer";
import { useDispatch, useSelector } from "react-redux";
import { updateBreadCrumb } from "@redux/actions/folderAction";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
}) as typeof Chip;

export default function BreadCrumbText() {
  const folderData = useSelector(selectFolders);
  const dispatch = useDispatch();

  const handleClick = (index: number | string) => {
    if (index !== undefined) {
      dispatch(updateBreadCrumb(index));
    }
  };

  return (
    <div role="presentation" className="breadcrumb-text">
      <Breadcrumbs aria-label="breadcrumb">
        <StyledBreadcrumb
          component="a"
          href="#"
          label="Home"
          onClick={() => handleClick("home")}
        />
        {folderData?.path?.map((p: any, index: number) => {
          if (p.name == 'root') return;
          return (
          <StyledBreadcrumb
            key={p.id}
            label={p.name}
            onClick={() => handleClick(index)}
          />
          )
        })}
      </Breadcrumbs>
    </div>
  );
}
