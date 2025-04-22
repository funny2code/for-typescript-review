"use client";

import { Fragment, useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";

import AbcOutlinedIcon from "@mui/icons-material/AbcOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExploreIcon from '@mui/icons-material/Explore';

import { updateSubFolderOnSorting, uploadFile } from "@redux/actions/folderAction";
import { UploadFile } from "@mui/icons-material";
import { useCompany } from "contexts/CompanyContext";
import { selectFolders } from "@redux/reducers/folderReducer";
import { useDispatch, useSelector } from "react-redux";
import { uploadData, list, copy, remove } from "aws-amplify/storage";
import { Button } from "@mui/material";

const StyledMenu = styled((props: any) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "alpha(theme.palette.common.white, 0.15)",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const Navbar = ({ handleOnSearch }: { handleOnSearch: (e:any) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const {companyId} = useCompany();
  const open = Boolean(anchorEl);
  const folderData = useSelector(selectFolders);
  const { path, subFolder, stagedFile } = folderData;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnSort = (sortBy: string) => {
    setAnchorEl(null);
    dispatch(updateSubFolderOnSorting(sortBy));
  };

  const handleUpload = () => {
    let input = document.createElement('input');
    input.type = 'file';
    input.name = 'file';
    input.onchange = (event) => {
      //@ts-ignore
      let file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;

        const parentFolderId = path.length ? path[path.length - 1].id : folderData.data.id;
        dispatch(uploadFile(file.name, text, parentFolderId));
        handleClose();
      }
      reader.readAsText(file);
    }
    input.click();
  }

  return (
    <Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar sx={{ backgroundColor: "#000" }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <ExploreIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              FILE MANAGER
            </Typography>
            {/* <Button
              onClick={handleTest}
            >
              Test Button in S3
            </Button> */}
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                onChange={handleOnSearch}
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>

            <div>
              <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                color="inherit"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>

              <StyledMenu
                id="demo-customized-menu"
                MenuListProps={{
                  "aria-labelledby": "demo-customized-button",
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleUpload}>
                  <UploadFile />
                  Upload
                </MenuItem>
                {/* <MenuItem disableRipple>
                  <CreateNewFolderOutlinedIcon />
                  Create Folder
                </MenuItem>
                <MenuItem onClick={handleClose} disableRipple>
                  <NoteAddOutlinedIcon />
                  Create File
                </MenuItem> */}
                {/* <Divider sx={{ my: 0.5 }} /> */}
                <div className="separator">
                  <FilterAltOutlinedIcon /> Filter
                </div>
                <MenuItem
                  onClick={() => handleOnSort("alphabetically")}
                  disableRipple
                >
                  <AbcOutlinedIcon />
                  Alphabetically
                </MenuItem>
                {/* <MenuItem onClick={() => handleOnSort("folder")} disableRipple>
                  <FolderOutlinedIcon />
                  Folder
                </MenuItem>
                <MenuItem onClick={() => handleOnSort("file")} disableRipple>
                  <ArticleOutlinedIcon />
                  File
                </MenuItem> */}
                {/* <MenuItem onClick={handleClose} disableRipple>
                  <FilterAltOutlinedIcon />
                  More
                </MenuItem> */}
              </StyledMenu>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
    </Fragment>
  );
};

export default Navbar;
