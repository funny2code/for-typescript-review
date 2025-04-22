"use client";
import { Menu, MenuItem, Typography } from "@mui/material";


import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";

import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import ContentCut from "@mui/icons-material/ContentCut";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Download from "@mui/icons-material/Download";

import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import FolderDeleteOutlinedIcon from "@mui/icons-material/FolderDeleteOutlined";

import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import MoveUpIcon from '@mui/icons-material/MoveUp';

import { IFile } from "interfaces";
import { downloadItem } from "@redux/reducers/helper";

const FileActions = ({
  file,
  contextMenu,
  handleClose,
  handleOpenFolder,
  handleOnRenameFolder,
  handleOnCopyFolder,
  handleOnCutFolder,
  handleOnMoveFolder,
  handleOnDeleteFolder,
  handleDuplicate,
}: {
  file: IFile;
  contextMenu: any;
  handleClose: () => void;
  handleOpenFolder: () => void;
  handleOnRenameFolder: () => void;
  handleOnCopyFolder: () => void;
  handleOnCutFolder: () => void;
  handleOnMoveFolder: () => void;
  handleOnDeleteFolder: () => void;
  handleDuplicate: () => void;
}) => {
  const handleOnDownloadFile = async () => {
    if (file.isFolder) return;
    
    let filePath = file.path;
    if (filePath.endsWith('/')) {
      filePath = filePath.slice(0, -1);
    }

    const text = await downloadItem(filePath);
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    handleClose();
  };

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
            <MenuItem onClick={handleOpenFolder} disabled={!file.isFolder}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <FolderOpenOutlinedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Open</Typography>
              </ListItemText>
            </MenuItem>

            <Divider style={{ margin: "2px 8px 2px 8px" }} />

            <MenuItem onClick={handleOnCutFolder}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <ContentCut fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Cut</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘X</Typography>
            </MenuItem>

            <MenuItem onClick={handleOnMoveFolder} style={{ cursor: "move" }}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <MoveUpIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Move</Typography>
              </ListItemText>
              <Typography fontSize="small"></Typography>
            </MenuItem>

            <MenuItem onClick={handleOnCopyFolder} style={{ cursor: "copy" }}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <ContentCopy fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Copy</Typography>
              </ListItemText>
              <Typography fontSize="small">⌘C</Typography>
            </MenuItem>

            <MenuItem onClick={handleDuplicate} style={{ cursor: "copy" }}>
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

            <MenuItem onClick={handleOnDownloadFile}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <Download fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Download</Typography>
              </ListItemText>
            </MenuItem>

            <Divider style={{ margin: "2px 8px 2px 8px" }} />

            {/* <FolderInfoModal onClose={handleClose} /> */}

            <Divider style={{ margin: "2px 8px 2px 8px" }} />

            <MenuItem onClick={handleOnRenameFolder}>
              <ListItemIcon style={{ minWidth: "25px" }}>
                <DriveFileRenameOutlineOutlinedIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                <Typography fontSize="small">Rename</Typography>
              </ListItemText>
            </MenuItem>

            <MenuItem onClick={handleOnDeleteFolder}>
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

export default FileActions;
