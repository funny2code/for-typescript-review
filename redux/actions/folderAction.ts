import { IFile, IID, IStagedFile } from "interfaces";
import {
  setFileToActive,
  setFileToStaged,
  sortSubFolder,
  updateBreadCrumbTree,
  updateSubFolderData,
  retrieveAllFilesThunk,
  deleteFileThunk,
  createFileThunk,
  renameFileThunk,
  moveFileThunk,
  updateChildOnPasteThunk,
  uploadFileThunk,
  updateOnDuplicateThunk,
  setSelectedFilePath
  } from "../reducers/folderReducer";
  import { Dispatch } from "redux";
  import { FileDispatch } from "../store";
  
  /* Completed Actions */
export const fetchFolderRoot = (companyId: string) => async (dispatch: FileDispatch) => {
  dispatch(retrieveAllFilesThunk(companyId));
};
    
export const deleteFolder = (file: IFile) => async (dispatch: FileDispatch) => {
  dispatch(deleteFileThunk({ file }));
};
export const addFolder = (folder: IFile) => async (dispatch: FileDispatch) => {
  dispatch(createFileThunk(folder));
};

export const updateFolderName = (file: IFile, newName: string = "") => async (dispatch: FileDispatch) => {
    dispatch(renameFileThunk({ file, newName }));
};

// Move => Drag&Drop
export const moveNode = (sourceFile: IFile, targetId: string) => async (dispatch: FileDispatch) => {
  dispatch(moveFileThunk({ sourceFile, parentId: targetId }));
}

export const uploadFile = (filename: string, fileContent: string, parent: string) => async (dispatch: FileDispatch) => {
  dispatch(uploadFileThunk({ filename, parent: parent, text: fileContent }));
}

export const updateFileOnDuplicate = (file: IFile) => async (dispatch: FileDispatch) => {
  dispatch(updateOnDuplicateThunk({file}));
};
export const addFileToStage = (file: IStagedFile) => (dispatch: Dispatch) => {
  dispatch(setFileToStaged(file));
};

export const updateFileOnPaste = (targetId: string) => async (dispatch: FileDispatch) => {
  dispatch(updateChildOnPasteThunk({targetId}));
};

/* Actions under review */
export const updateSubFolder = (file: IFile) => (dispatch: Dispatch) => {
  dispatch(updateSubFolderData(file));
};

export const updateBreadCrumb = (pathIndex: number | string) => (dispatch: Dispatch) => {
  dispatch(updateBreadCrumbTree(pathIndex));
};

export const updateSubFolderOnSorting = (sortBy: string) => (dispatch: Dispatch) => {
  dispatch(sortSubFolder(sortBy));
};
export const addFileToActiveStatus = (id: number | string) => (dispatch: Dispatch) => {
  dispatch(setFileToActive(id));
};

export const setSelectedFilePathAction = (path: string) => (dispatch: Dispatch) => {
  dispatch(setSelectedFilePath(path));
}