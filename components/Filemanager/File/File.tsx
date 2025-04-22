"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addFileToActiveStatus,
  addFileToStage,
  updateFolderName,
  moveNode,
  deleteFolder,
  updateFileOnDuplicate,
  setSelectedFilePathAction,
} from "@redux/actions/folderAction";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import FileActions from "./FileActions";
import { isNameExits, truncateStr } from "@components/Filemanager/utils/data";

import "./File.css";
import { selectFolders } from "@redux/reducers/folderReducer";
import { IFileComProps, IFile, IID, IConfirmDialog } from "interfaces";
import SelectFolderModal from "@components/Filemanager/SelectFolderModal/SelectFolderModal";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { findNodeById, isSameFileExits } from "@redux/reducers/helper";

const File = ({ 
  file, 
  index,
  sourceFile,
  targetId,
  setSourceFile,
  setTargetId,
  handleOnOpenFolder
}: IFileComProps) => {
  const folderData = useSelector(selectFolders);
  const { activeFolder, subFolder, stagedFile } = folderData;
  // console.log("tree data in file: ", folderData);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const [enableRename, setEnableRename] = useState(
    (activeFolder.id === file.id && activeFolder?.editable) || false
  );

  const dispatch = useDispatch();
  const nameInputRef = useRef<HTMLParagraphElement>(null);
  const stageFileOpacity = useRef<string | number>(1);

  useEffect(() => {
    if (enableRename) {
      const el: any = nameInputRef.current;

      // focus input area
      el?.focus();

      // set curson to last position of the folder name
      const range = document.createRange();
      const selection: any = window.getSelection();

      range.setStart(el, el?.childNodes.length);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [enableRename]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // update active foder
    updateActiveFolder(event);

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
  };

  const updateFolderNewName = () => {
    if (nameInputRef.current !== null) {
      const newName: string = (nameInputRef.current.textContent || "").trim();

      if (file.name !== newName && isNameExits(subFolder, newName)) {
        setShowMessage({
          open: true,
          title: "Error",
          content: `Oops... The name "${newName}" is already taken. Please choose a different name.`,
          isConfirm: false,
          handleConfirm: () => {}
        });
        nameInputRef.current.textContent = file.name;
      } else if (file.name === newName) {
        nameInputRef.current.textContent = file.name;
        return null;
      } else {
        nameInputRef.current.textContent = truncateStr(newName);
        dispatch(updateFolderName(file, newName));
      }
    }
  };

  const renameOnBlur = () => {
    updateFolderNewName();
    setEnableRename(false);
  };

  const onFolderRename: React.KeyboardEventHandler<HTMLParagraphElement> = (e) => {
    if (e.nativeEvent.key === "Enter") {
      updateFolderNewName();
      setEnableRename(false);
    }
  };

  const handleOnRenameFolder = () => {
    setContextMenu(null);
    setEnableRename(true);
  };

  const handleOnCopyFolder = () => {
    dispatch(addFileToStage({ stageType: "copy", file }));
    // alert("Not implemented yet");
    setContextMenu(null);
  };

  const handleOnCutFolder = () => {
    dispatch(addFileToStage({ stageType: "cut", file }));
    setContextMenu(null);
  };

  const handleDuplicate = () => {
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
  }

  const handleOnDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSourceFile(file);
  }

  const handleDropEnd = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (sourceFile && targetId && (sourceFile.id != targetId)) {
      // console.log("handleDropEnd", sourceFile, targetId);
      const targetFile = findNodeById(folderData.data, targetId as string);
      const isInvalidMove = isSameFileExits(sourceFile, targetFile.children);
      if (isInvalidMove) {
        setShowMessage({
          open: true,
          title: "Error",
          content: "The same file/folder exists already. Please change the file/folder name.",
          isConfirm: false,
          handleConfirm: () => {}
        });
      } else {
        dispatch(moveNode(sourceFile, targetId as string));
      }
    }
  }

  const handleOnMoveFolder = () => {
    handleOpenModal();
    setContextMenu(null);
  };

  const handleOnMove = (targetFile: IFile) => {
    const sourceFile = file;
    // console.log("move action: ", sourceFile, targetFile);

    if (!targetFile) return;
    const isInvalidMove = isSameFileExits(sourceFile, targetFile.children);
    if (isInvalidMove) {
      setShowMessage({
        open: true,
        title: "Error",
        content: "The same file/folder exists already. Please change the file/folder name.",
        isConfirm: false,
        handleConfirm: () => {}
      });
    } else {
      dispatch(moveNode(sourceFile, targetFile.id as string));
    }
    handleCloseModal();
  }

  const handleOnDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.currentTarget.dataset?.folder == "true") {
      const targetId = event.currentTarget.dataset?.target || null;
      setTargetId(targetId);
    }
  }

  const updateActiveFolder = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (activeFolder.id !== file.id) {
      dispatch(addFileToActiveStatus(file.id));
      dispatch(setSelectedFilePathAction(file.path));
    }
  };
  const handleOnDeleteFolder = () => {
    setShowMessage({
      open: true,
      title: "Deleting",
      content: `Are you sure? You won't be able to revert this!`,
      isConfirm: true,
      handleConfirm: () => {
        dispatch(deleteFolder(file));
      }
    });
    handleClose();
  }

  stageFileOpacity.current =
    stagedFile?.stageType === "cut" && stagedFile?.file?.id === file.id
      ? 0.4
      : 1;

  return (
    <div
      style={{
        position: contextMenu ? "relative" : "static",
        cursor: "context-menu",
        opacity: stageFileOpacity.current,
      }}
      className={`folder-panel files-panel__item folder ${
        contextMenu !== null || activeFolder.id === file.id || enableRename
          ? "folder-active"
          : ""
      }`}
      data-target={file.id}
      data-folder={file.isFolder ? "true" : "false"}
      onDoubleClick={() => handleOnOpenFolder(file, index)}
      onContextMenu={handleContextMenu}
      onClick={updateActiveFolder}
      draggable
      onDrag={handleOnDrag}
      // onDrop={handleOnDrop}
      onDragOver={handleOnDragOver}
      onDragEnd={handleDropEnd}
    >
      <div className="folder-icon">
        {file.isFolder ? (
          <FolderIcon style={{ color: file.color }} />
        ) : (
          <InsertDriveFileIcon style={{ color: "93DBC8" }} />
        )}

        <p
          className="files-panel__item-title"
          title={file.name}
          contentEditable={enableRename}
          onBlur={renameOnBlur}
          onKeyUp={onFolderRename}
          ref={nameInputRef}
          suppressContentEditableWarning={true}
        >
          {/* {truncateStr(file.name)} */}
          {file.name}
        </p>
      </div>

      <FileActions
        file={file}
        contextMenu={contextMenu}
        handleClose={handleClose}
        handleOpenFolder={() => handleOnOpenFolder(file, index)}
        handleOnRenameFolder={handleOnRenameFolder}
        handleOnCopyFolder={handleOnCopyFolder}
        handleOnCutFolder={handleOnCutFolder}
        handleOnMoveFolder={handleOnMoveFolder}
        handleOnDeleteFolder={handleOnDeleteFolder}
        handleDuplicate={handleDuplicate}
      />
      <SelectFolderModal 
        treeData = {[{...folderData.data, name: "Home"}]}
        open = {modalOpen}
        handleClose = {handleCloseModal}
        handleOnMove = {handleOnMove}
        from={"move-file-to-folder"}
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
    </div>
  );
};

export default File;
