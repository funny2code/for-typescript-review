"use client";
import { Menu, MenuItem, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectFolders } from "@redux/reducers/folderReducer";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";

import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import ContentCut from "@mui/icons-material/ContentCut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";

import FolderDeleteOutlinedIcon from "@mui/icons-material/FolderDeleteOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import { IFile } from "interfaces";

const TreeActions = ({
  file,
  contextMenu,
  handleClose,
  handleOpenFolder,
  handleOnCopyFolder,
  handleOnCutFolder,
  handleOnPaste,
  handleDeleteClick,
  handleDuplicate,
  handleOnDownloadFile,
  handleAddNewFile
}: {
  file: IFile;
  contextMenu: any;
  handleClose: () => void;
  handleOpenFolder: () => void;
  handleOnCopyFolder: () => void;
  handleOnCutFolder: () => void;
  handleDeleteClick: () => void;
  handleDuplicate: () => void;
  handleOnDownloadFile: () => void;
  handleOnPaste: (targetFile: IFile) => void;
  handleAddNewFile: (isFolder: boolean) => void;
}) => {
  const folderdata = useSelector(selectFolders);

  return (
    <>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        style={{ fontSize: "12px" }}
        className="file-context-menu"
      >
        <Paper
          sx={{ width: 320, maxWidth: "100%" }}
          style={{
            width: "210px",
            border: "none",
            boxShadow: "none",
            margin: "-9px 0px -8px 0px"
          }}
        >
          <MenuList>
            <MenuItem id="new_folder_item" onClick={() => handleAddNewFile(true)}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <CreateNewFolderOutlinedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">New Folder</Typography>
              </ListItemText>
            </MenuItem>

            <MenuItem id="new_file_item" onClick={() => handleAddNewFile(false)}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <NoteAddOutlinedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">New File</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘+SHIFT+F</Typography>
            </MenuItem>

            <MenuItem id="cut_item" onClick={handleOnCutFolder}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <ContentCut fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Cut</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘X</Typography>
            </MenuItem>

            <MenuItem id="copy_item" onClick={handleOnCopyFolder} style={{ cursor: "copy" }}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <ContentCopy fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Copy</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘C</Typography>
            </MenuItem>
            
            {folderdata.stagedFile?.stageType != "none" && (
              <MenuItem id="paste_item" onClick={() => handleOnPaste(file)}>
                <ListItemIcon style={{ minWidth: "25px" }}>
                  <ContentPaste fontSize="inherit" />
                </ListItemIcon>
                <ListItemText>
                  <Typography fontSize="small">Paste</Typography>
                </ListItemText>
                <Typography fontSize="small">⌘V</Typography>
              </MenuItem>
            )}

            <MenuItem id="clone_item" onClick={handleDuplicate} style={{ cursor: "copy" }}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                {file.isFolder ? (
                  <FolderCopyOutlinedIcon fontSize="inherit" />
                ) : (
                  <FileCopyOutlinedIcon fontSize="inherit" />
                )}
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Duplicate</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘D</Typography>
            </MenuItem>

            <Divider style={{ margin: "2px 8px 2px 8px" }} />

            {/* <FolderInfoModal onClose={handleClose} /> */}

            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <FolderDeleteOutlinedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Delete</Typography>
              </ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Menu>
    </>
  );
};

export default TreeActions;
