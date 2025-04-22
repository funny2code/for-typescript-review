"use client";
import FolderTree from "@components/Filemanager/FolderTree/FolderTree";
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { IFile, IConfirmDialog } from "interfaces";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TreeActions from "./TreeActions";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFileToStage, addFolder, deleteFolder, updateFileOnDuplicate, updateFileOnPaste } from "@redux/actions/folderAction";
import { selectFolders } from "@redux/reducers/folderReducer";
import { downloadItem, findNodeById, isSameFileExits } from "@redux/reducers/helper";
import ConfirmDialog from "@components/ui/ConfirmDialog";
function EndIcon() {
    return <div style={{ width: 24 }} />;
}
const FolderTreePanel = ({ explorerData, handleOnOpenFolder, companyId, from }: {
    explorerData: any; 
    handleOnOpenFolder: (folder: IFile, index: number)=>void; 
    companyId: string;
    from: string;
}) => {
    const [file, setFile] = useState<IFile | null>(null);
    const dispatch = useDispatch();
    const folderData = useSelector(selectFolders);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
      } | null>(null);
    const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);
    const handleContextMenu = (event: React.MouseEvent, folder: IFile) => {
        event.preventDefault();
        event.stopPropagation();
        // console.log("context event: ", event);
        setFile(folder);
        // set context menu position
        setContextMenu(
          contextMenu === null
            ? {
                mouseX: event.clientX + 2,
                mouseY: event.clientY - 6,
              }
            : null
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    }
    
    const handleOnCopyFolder = () => {
        if (!file) return;
        setContextMenu(null);
        dispatch(addFileToStage({ stageType: "copy", file }));
        // alert("Not implemented yet");
    };

    const handleOnCutFolder = () => {
        if (!file) return;
        setContextMenu(null);
        dispatch(addFileToStage({ stageType: "cut", file }));
    };

    const handleOnPaste = () => {
      if (!file) return;
      let targetId = file.id;
      const targetFile = findNodeById(folderData.data, targetId as string);
      const sourceFile = folderData.stagedFile.file;
      const isInvalidPaste = isSameFileExits(sourceFile, targetFile.children);
      if (isInvalidPaste) {
        setShowMessage({
          open: true,
          title: "Error",
          content: "The same file/folder exists already. Please change the file/folder name.",
          isConfirm: false,
          handleConfirm: () => {}
        });
      } else {
        dispatch(updateFileOnPaste(targetId as string));
      }
      setContextMenu(null);
    };

    const handleDeleteClick = () => {
      if (!file) return;
      
      setShowMessage({
        open: true,
        title: "Deleting",
        content: "Are you sure? You won't be able to revert this!",
        isConfirm: true,
        handleConfirm: () => {
          dispatch(deleteFolder(file));
        }
      });
      handleClose();
    };

    const handleDuplicate = () => {
      if (!file) return;
      const targetFile = findNodeById(folderData.data, file.parentId as string);
      const isInvalidDuplicate = isSameFileExits(file, targetFile.children, true);
      if (isInvalidDuplicate) {
        setShowMessage({
          open: true,
          title: "Error",
          content: "The same file/folder exists already. Please change the file/folder name.",
          isConfirm: false,
          handleConfirm: () => {}
        });
      } else {
        dispatch(updateFileOnDuplicate(file));
      }
      handleClose();
    };
    const handleOnDownloadFile = async () => {
      if (!file) return;
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
    const handleAddNewFile = (isFolder = true) => {
        if (!file) return;
        const parentFolderId = file.id
        const subFolder = file.children || [];
        const newFolder: IFile = {
            id: companyId,
            name: isFolder
            ? `New Folder (${subFolder.length || "0"})`
            : `New File (${subFolder.length || "0"}).txt`,
            isFolder: isFolder,
            color: isFolder ? "#8f95a0" : "#cad333",
            parentId: parentFolderId,
            children: [],
            path: "",
        };

        dispatch(addFolder(newFolder));
        setContextMenu(null);
    };

    return (
        <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
            <SimpleTreeView
                defaultExpandedItems={['grid']}
                slots={{
                    expandIcon: ArrowRightIcon,
                    collapseIcon: ArrowDropDownIcon,
                    endIcon: EndIcon,
                }}
            >
                {explorerData?.map((folder: any, idx: number) => (
                    <FolderTree
                        key={`${from}-${folder.id}`}
                        index={idx}
                        folder={folder}
                        handleOnOpenFolder={handleOnOpenFolder}
                        handleContextMenu={handleContextMenu}
                    />
                ))}
            </SimpleTreeView>
            <TreeActions 
                file={explorerData}
                contextMenu={companyId != "modal" ? contextMenu : null}
                handleClose={handleClose}
                handleOpenFolder={() => {}}
                handleOnCopyFolder={handleOnCopyFolder}
                handleOnCutFolder={handleOnCutFolder}
                handleOnPaste={handleOnPaste}
                handleDeleteClick={handleDeleteClick}
                handleDuplicate={handleDuplicate}
                handleOnDownloadFile={handleOnDownloadFile}
                handleAddNewFile={handleAddNewFile}
            />
            {showMessage && 
              <ConfirmDialog 
                open = {showMessage.open}
                title = {showMessage.title}
                content = {showMessage.content}
                handleClose = {() => { setShowMessage(null); }}
                isConfirm = {showMessage.isConfirm}
                handleConfirm={() => { showMessage.handleConfirm(); }}
              />
            }
        </Box>
    );
}

export default FolderTreePanel;