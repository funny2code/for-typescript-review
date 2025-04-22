import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import {
  copyItem,
  deleteItem,
  getFileList,
  getValidatedPath,
  updatePathTree,
  uploadItem,
  updateNodeOnSort,
  updateSubFolder,
  insertNodeInTree,
  createTree,
  createSubTree,
  removeNodeById,
  findNodeById,
  getFileProperty,
  writePath2Target,
} from "./helper";
import { v4 as uuidv4 } from "uuid";
import { IFile, IFolderState } from "interfaces";
// import Swal from "sweetalert2";

export const retrieveAllFilesThunk = createAsyncThunk(
  "files/retrieve",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const items = await getFileList(`company/${companyId}/`);

      // console.log("items: ", items);
      if (!items.length) {
        return {
          fileSystem: {
            id: "root",
            name: "root",
            isFolder: true,
            parentId: "",
            path: `company/${companyId}/`,
            children: [],
          },
          currentPath: `company/${companyId}/`
        }
      }

      const testTree = createTree(items);
      const fileSystem = testTree;
      const currentPath = `company/${companyId}/`;
    
      // console.log("test tree: ", fileSystem);
      return {
        fileSystem,
        currentPath
      };
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("retrieveAllFilesThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);
    }
  }
);

export const createFileThunk = createAsyncThunk(
  "files/create",
  async (file: IFile, { getState, rejectWithValue }) => {
    try {
      const {name: filename, isFolder: isDir, parentId: parent} = file;
      const currentState: any = getState();
      let parentFolder = findNodeById(currentState.folder.data, parent as string);/* currentState.folder.currentPath; */
      let currentPath = parentFolder.path;
      // console.log("new file/folder path: ", parentFolder, currentPath+"/"+filename);
      const uploadResult = await uploadItem(currentPath+"/"+filename, "", isDir);
      // console.log("Current Path: ", currentPath, uploadResult);
      if (!uploadResult) return { newItem: null };
      
      const newItem: IFile = {
        id: JSON.parse(uploadResult.eTag as string) + uuidv4(),
        name: filename,
        path: uploadResult.path,
        isFolder: isDir,
        parentId: parent,
        color: isDir? "#8f95a0": "#cad333",
        children: []
      }
  
      return {
        newItem
      };
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("createFileThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);
    }
  }
);

export const uploadFileThunk = createAsyncThunk(
  "files/upload",
  async (file: {filename: string, parent: string, text: string}, { getState, rejectWithValue }) => {
    try {
      const {filename, parent, text} = file;
      const currentState: any = getState();
      let currentPath = getValidatedPath(currentState.folder.currentPath, true);
      let currentFilePath = getValidatedPath(currentPath+filename, false);
      /* Checking if the same file exists */
      /* const fileExits = await getFileProperty(currentFilePath); */
      /* if (!fileExits) { */
        const uploadResult = await uploadItem(currentFilePath, text, false);
        if (!uploadResult) return { newItem: null, overwrite: false };
  
        const newItem: IFile = {
          id: JSON.parse(uploadResult.eTag as string) + uuidv4(),
          name: filename,
          path: uploadResult.path,
          isFolder: false,
          parentId: parent,
          color: "#cad333",
          children: []
        }
        return {
          newItem,
          overwrite: false
        };      
      /* } else {
        const comfirmResult = await Swal.fire({
          title: "The same file exists already.",
          text: "Would you like to overwrite it? Please change the file name.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, overwrite it!",
        });
  
        if (comfirmResult.isConfirmed) {
          // console.log("saving!!!", text)
          const uploadResult = await uploadItem(currentFilePath, text, false);
          if (!uploadResult) return { newItem: null, overwrite: false };
          
          return {
            newItem : null,
            overwrite: true
          }
        } else {
          return {
            newItem: null,
            overwrite: true
          };
        }
      } */
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("uploadFileThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);      
    }
  }
);

export const moveFileThunk = createAsyncThunk(
  "files/move",
  async (file: {sourceFile: IFile, parentId: string}, { getState, rejectWithValue }) => {
    try {
      const {sourceFile, parentId} = file;
      const currentState: any = getState();
      const targetFile = parentId != ""? findNodeById(currentState.folder.data, parentId): currentState.folder.data;
      const currentParentId = sourceFile.parentId;
      const sourcePath = sourceFile.path;
      const destinationPath = targetFile.path;
      const currentPath = currentState.folder.currentPath;
      const currentFilePath = getValidatedPath(destinationPath + "/" + sourceFile.name, sourceFile.isFolder);
      const fileExits = await getFileProperty(currentFilePath);
      if (fileExits) {
        /* const comfirmResult = await Swal.fire({
          title: "The same file/folder exists already.",
          text: "Please change the file/folder name.",
          icon: "warning",
        }); */
        
        return {
          movedItem: null,
          currentParentId,
          originId: sourceFile.id,
        }
      }

      if (sourceFile.isFolder) {
        const items = await getFileList(sourcePath);
  
        const newPaths = await Promise.all(items.map(async (item) => {
          const {path} = item;
          const newPath = path.replace(currentPath, destinationPath);
          // console.log("path compare in move action: ", path, newPath, sourcePath, destinationPath);
          await copyItem(path, newPath);
          await deleteItem(path);
          return newPath;
        }));
        // console.log("new paths", newPaths);
        const movedItems = await getFileList(destinationPath + sourceFile.name);
        // console.log("moved items",destinationPath + sourceFile.name, movedItems);
        const subTree = createSubTree(
          movedItems.map(item => {
            return {...item, path: item.path.replace(destinationPath, "")} 
          }), 
          {...targetFile, children: []}, 
          destinationPath
        ); 
        
        const movedItem = subTree.children[0];
  
        return {
          movedItem,
          currentParentId,
          originId: sourceFile.id,
        }
      } else {
        /* correct returned path */
        const sourceFilePath = getValidatedPath(sourcePath, false);
        const destinationFilePath = getValidatedPath(destinationPath+"/"+sourceFile.name, false);
  
        await copyItem(sourceFilePath, destinationFilePath);
        await deleteItem(sourcePath);
  
        const movedItem: IFile = {
          ...sourceFile, path: destinationFilePath, parentId: targetFile.id
        }
        
        return {
          movedItem,
          currentParentId,
          originId: sourceFile.id,
        };
      }      
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("moveFileThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);      
    }
  }
);

export const updateChildOnPasteThunk = createAsyncThunk(
  "files/paste",
  async (params: {targetId: string},  { getState, rejectWithValue }) => {
    try {
      const {targetId} = params;
      const currentState: any = getState();
      const targetFile = targetId != ""? findNodeById(currentState.folder.data, targetId): currentState.folder.data;
      const {stageType, file: sourceFile} = currentState.folder.stagedFile;
      const currentParentId = targetFile.id;
      let sourcePath = sourceFile.path;
      let destinationPath = targetFile.path;
      const replacePath = getValidatedPath(sourcePath, false).split("/").slice(0, -1).join("/") + "/";
      const currentFilePath = getValidatedPath(destinationPath + "/" + sourceFile.name, sourceFile.isFolder);
      // console.log("*cp* Current Paths: ", sourcePath, replacePath, destinationPath, currentFilePath);

      /* const fileExits = await getFileProperty(currentFilePath);
      if (fileExits) {
        const comfirmResult = await Swal.fire({
          title: "The same file/folder exists already.",
          text: "Please change the file/folder name.",
          icon: "warning",
        });
        
        return {
          copiedItem: null,
          currentParentId,
          stageType,
          sourceId: sourceFile.id,
        }
      } */

      if (sourceFile.isFolder) {
        
        const items = await getFileList(getValidatedPath(sourcePath, true));
  
        const newPaths = await Promise.all(items.map(async (item) => {
          const {path} = item;
          const newPath = path.replace(replacePath, destinationPath);
          // console.log("newPath: ", newPath);
          await copyItem(path, newPath);
          if (stageType == "cut") await deleteItem(path);
        }));
  
        // console.log("new paths", newPaths);
        const copiedItems = await getFileList(destinationPath + sourceFile.name);
        // console.log("copied items: ", copiedItems);
        const subTree = createSubTree(
          copiedItems.map(item => {
            return {...item, path: item.path.replace(destinationPath, "")} 
          }), 
          {...targetFile, children: []}, 
          destinationPath
        ); 
        
        const copiedItem = subTree.children[0];
        
        return {
          copiedItem,
          currentParentId,
          stageType,
          sourceId: sourceFile.id,
        }
      } else {
        const newPath = sourcePath.replace(replacePath, destinationPath);
        // console.log("newPath: ", newPath);
        await copyItem(sourcePath, newPath);
        
        if (stageType == "cut") await deleteItem(getValidatedPath(sourcePath, false));
    
        const copiedItem: IFile = {
          ...sourceFile, path: newPath, parentId: targetFile.id
        }
  
        // console.log("Copied Item's path", copiedItem.path);
        
        return {
          copiedItem,
          currentParentId,
          stageType,
          sourceId: sourceFile.id,
        };
      }      
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("updateChildOnPasteThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);      
    }
  }
);

export const updateOnDuplicateThunk = createAsyncThunk(
  "files/duplicate",
  async (params : {file: IFile}, { getState, rejectWithValue }) => {
    try {
      const {file} = params;
      const { id, name: oldName, isFolder, parentId, color, path: sourcePath } = file;
      
      let extName = oldName.split(".").pop();
      let fileName = "", newName = "";
      if (!isFolder && extName == oldName) {
        newName = oldName + " (copy)";
      } else {
        fileName = oldName.split(".").slice(0, -1).join(".");
        newName = isFolder ? (oldName + " (copy)") : (fileName + " (copy)" + "." + extName);
      }
      const currentState: any = getState();
      const currentFolder = parentId != ""? findNodeById(currentState.folder.data, parentId as string): currentState.folder.data;
      let currentPath = file.path.split("/").slice(0, (file.isFolder? -2 :-1)).join("/")+"/";
      let destinationPath = getValidatedPath(currentPath + "/" + newName, isFolder);
      // console.log("*cl* Current Path: ", currentPath, sourcePath, destinationPath);

      /* Checking if the same file/folder exists */
      // const fileExits = await getFileProperty(destinationPath);
      /* if (!fileExits) { */
        if (isFolder) {      
          const items = await getFileList(sourcePath);
          // console.log("*cl* items list: ", items);
          const newPaths = await Promise.all(items.map(async (item) => {
            const {path} = item;
            const newPath = path.replace(sourcePath, destinationPath);
            await copyItem(path, newPath);
            return newPath;
          }));
          // console.log("*cl* new paths; ", newPaths);
          const clonedItems = await getFileList(destinationPath);
          // console.log("cloned items: ", clonedItems);
          const subTree = createSubTree(
            clonedItems.map(item => {
              return {...item, path: item.path.replace(currentFolder.path, "")} 
            }), 
            {...currentFolder, children: []}, 
            currentFolder.path
          ); 
          
          const clonedItem = subTree.children[0];
    
          return {
            clonedItem
          }
        } else {
          await copyItem(sourcePath, destinationPath);
          const clonedItem: IFile = {
            ...file, name: newName, path: destinationPath, id: "cloned"+uuidv4()
          }
          // console.log("*cl* cloned item: ", clonedItem);
          return {
            clonedItem
          };
        }
      /* } else {
        const comfirmResult = await Swal.fire({
          title: "The same file/folder exists already.",
          text: "Please change the file/folder name.",
          icon: "warning",
        });
        return {
          clonedItem: null
        }
      } */
  
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("updateOnDuplicateThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);
      
    }
  }
);

export const renameFileThunk = createAsyncThunk(
  "files/rename",
  async (params : {file: IFile, newName: string}, { getState, rejectWithValue }) => {
    try {
      const { file, newName } = params;
      const { id: originId, name: oldName, isFolder, parentId, color, path: sourcePath } = file;
      const currentState: any = getState();
      const currentFolder = parentId != ""? findNodeById(currentState.folder.data, parentId as string): currentState.folder.data;
      const replacePath = getValidatedPath(sourcePath, false).split("/").slice(0, -1).join("/") + "/";
      // let currentPath = currentState.folder.currentPath;
      let destinationPath = getValidatedPath(replacePath + newName, isFolder);
      
      if (isFolder) {
        const items = await getFileList(sourcePath);
        // console.log("*rn* items list: ", items);
        const newPaths = await Promise.all(items.map(async (item) => {
          const {path} = item;
          const newPath = path.replace(sourcePath, destinationPath);
          // console.log(" copy paths: ", sourcePath, destinationPath, newPath, path);
          await copyItem(path, newPath);
          await deleteItem(path);
          return newPath;
        }));
        // console.log("renamedPaths", newPaths, currentFolder);
        const renamedItems = await getFileList(destinationPath);
        const subTree = createSubTree(
          renamedItems.map(item => {
            // console.log("-------- item paths ", item.path, item.path.replace(currentFolder.path, ""));
            return {...item, path: item.path.replace(currentFolder.path, "")}
          }),
          {...currentFolder, children: []},
          currentFolder.path
        );
        
        const renamedItem = subTree.children[0];
        // console.log("*rn* renamed item: ", subTree, renamedItems);
        return {
          renamedItem,
          originId
        }
      } else {
        await copyItem(sourcePath, destinationPath);
        await deleteItem(sourcePath);
        const renamedItem: IFile = {
          ...file, name: newName, path: destinationPath
        }
        // console.log("Copied Item's path", renamedItem.path);
        return {
          renamedItem,
          originId
        };
      }      
    } catch (error: any) {
      if (!error.repsonse) {
        // console.error("renameFileThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);
    }
});

export const deleteFileThunk = createAsyncThunk(
  "files/delete",
  async ({ file }: {file: IFile}, { rejectWithValue }) => {
    try {
      const { id, name, isFolder, parentId, color, path:filePath } = file;
      
      if (isFolder) {
        const items = await getFileList(filePath);
        await Promise.all(items.map(async (item) => {
          const {path} = item;
          await deleteItem(path);
          return true;
        }));
        return { removedItem: file };
      } else {
        await deleteItem(getValidatedPath(filePath, false));
        return { removedItem: file };
      }      
    } catch (error: any) {
      if (!error.response) {
        // console.error("deleteFileThunk error: ", error);
        throw error;
      }
      return rejectWithValue(error.message);
    }
  }
);

const initialState: IFolderState = {
  data: {},
  subFolder: [],
  path: [],
  pathTree: [],
  currentPath: "",
  isLoading: true,
  stagedFile: { stageType: "none", file: {} }, // This key is used for copy and cut files. Doesn't need to save in local storage.
  activeFolder: { id: "", editable: false },
  selectedFilePath: "",
};

export const folderReducer = createSlice({
  name: "folder",
  initialState: initialState,

  reducers: {
    updateSubFolderData: (state, action) => {
      const file = action.payload;
      const updatedState = updateSubFolder(state, file);
      state = { ...state, ...updatedState };
    },
    updateBreadCrumbTree: (state, action) => {
      const pathIndex = action.payload;
      if (pathIndex === "home") {
        const treeData: any = state.data;
        state.subFolder = treeData.children;
        state.pathTree = [];
        state.path = [];
        state.currentPath = treeData.path;
      } else {
        let updatedPathTree = state.pathTree;
        let updatedPath = state.path;
        const targetId = updatedPath[pathIndex].id;
        const targetFolder = findNodeById(state.data, targetId as string);
        updatedPathTree[pathIndex] = targetFolder.children;
        state.subFolder = updatedPathTree[pathIndex] as unknown as IFile[];
        state.path = updatedPath.slice(0, pathIndex + 1);
        state.pathTree = updatedPathTree.slice(0, pathIndex + 1);
        state.currentPath = targetFolder.path; /* state.path.map((item: any)=> item.name).join("/"); */
      }
    },
    sortSubFolder: (state, action) => {
      const sortBy = action.payload;

      let sortedSubFolder = state.subFolder || [];

      switch (sortBy) {
        case "alphabetically":
          sortedSubFolder = sortedSubFolder.toSorted((a: any, b: any) =>
            a.name.localeCompare(b.name)
          );
          break;

        // TODO: Resolve sort by folder issue
        case "folder":
          sortedSubFolder = sortedSubFolder.toSorted(
            (a: any, b: any) =>
              a.isFolder ? (b.isFolder ? 0 : 1) : (b.isFolder ? 1 : a.name.localeCompare(b.name))
              // a.name.localeCompare(b.name) - (a.isFolder ? -1 : 1)
          );
          break;

        case "file":
          sortedSubFolder = sortedSubFolder.toSorted(
            (a: any, _b: any) => 
            a.isFolder ? (_b.isFolder ? 0 : -1) : (_b.isFolder ? -1 : a.name.localeCompare(_b.name))
            // a.isFolder ? 1 : -1
          );
          break;

        default:
          break;
      }

      const updatedRoot = updateNodeOnSort(
        state.data,
        sortedSubFolder[0].parentId,
        sortedSubFolder as unknown as []
      );

      // update path tree
      const path = state.path;
      const newPathTree = updatePathTree(updatedRoot, path);

      state.pathTree = newPathTree;

      state.data = updatedRoot;
      state.subFolder = sortedSubFolder;
      state.isLoading = false;
    },
    setFileToStaged: (state, action) => {
      const file = action.payload;
      state.stagedFile = file;
    },
    setFileToActive: (state, action) => {
      const id = action.payload;
      state.activeFolder = { id, editable: false };
    },
    setSelectedFilePath: (state, action) => {
      state.selectedFilePath = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(retrieveAllFilesThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(retrieveAllFilesThunk.fulfilled, (state, action) => {
        const {fileSystem, currentPath} = action.payload;
        state.data = fileSystem;
        state.subFolder = fileSystem.children;
        state.isLoading = false;
        state.currentPath = currentPath;
        state.path = [{id: fileSystem.id, name: fileSystem.name, index: 0}];
      })
      .addCase(createFileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFileThunk.fulfilled, (state, action) => {
        const { newItem } = action.payload;
        if (!newItem) return;
        const { id, parentId } = newItem;

        let treeData = state.data;
        insertNodeInTree(treeData, newItem);
        state.data = treeData;
        const updatedSubFolder = parentId != "" ? findNodeById(treeData, parentId as string): treeData;
        let updatedPathTree: IFile[][] = [], updatedPath: any[] = [];
        writePath2Target(treeData as IFile, parentId, updatedPath, updatedPathTree);
        // console.log("tree in create: ", current(treeData), updatedPath);
        state.subFolder = updatedSubFolder.children;
        state.path = updatedPath.reverse();
        state.pathTree = updatedPathTree.reverse();
        state.activeFolder = { id: id.toString(), editable: true };
        state.isLoading = false;
      })
      .addCase(uploadFileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadFileThunk.fulfilled, (state, action) => {
        
        const { newItem, overwrite } = action.payload;
        if (newItem) {
          const { parentId } = newItem;
  
          let treeData = state.data;
          insertNodeInTree(treeData, newItem);
          state.data = treeData;
          const updatedSubFolder = parentId != "" ? findNodeById(treeData, parentId as string): treeData;
          state.subFolder = updatedSubFolder.children;
        } 
        state.isLoading = false;
      })
      .addCase(deleteFileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFileThunk.fulfilled, (state, action) => {
        const { removedItem } = action.payload;
        let treeData = state.data;
        const parentId = removedItem.parentId;
        removeNodeById(treeData, removedItem.id as string);
        const updatedSubFolder = parentId != "" ? findNodeById(treeData, parentId as string): treeData;
        state.data = treeData;
        state.subFolder = updatedSubFolder.children;
        state.isLoading = false;
      })
      .addCase(renameFileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(renameFileThunk.fulfilled, (state, action) => {
        const { renamedItem, originId } = action.payload;
        const { id, name, path } = renamedItem;
        let treeData = state.data;
        removeNodeById(treeData, originId as string);
        insertNodeInTree(treeData, renamedItem);
        state.data = treeData;
        const updatedSubFolder = renamedItem.parentId != "" ? findNodeById(treeData, renamedItem.parentId as string): treeData;
        state.subFolder = updatedSubFolder.children;
        state.activeFolder = { id: "", editable: false };
        state.isLoading = false;
        // console.log("*rn* updated tree data: ", current(treeData));
      })
      .addCase(updateOnDuplicateThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOnDuplicateThunk.fulfilled, (state, action) => {
        const { clonedItem } = action.payload;
        if (clonedItem) {
          let treeData = state.data;
          const {parentId, id, name, isFolder, path, children, color} = clonedItem;
          insertNodeInTree(treeData, clonedItem);
          state.data = treeData;
          const updatedSubFolder = parentId != "" ? findNodeById(treeData, parentId as string): treeData;
          state.subFolder = updatedSubFolder.children;
          // console.log("*cl* updated tree data: ", current(treeData));
        }
        state.isLoading = false;
      })
      .addCase(moveFileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(moveFileThunk.fulfilled, (state, action) => {
        const { movedItem, currentParentId, originId } = action.payload;

        if (movedItem) {
          let treeData = state.data;
          removeNodeById(treeData, originId as string);
          insertNodeInTree(treeData, movedItem);
          state.data = treeData;
          const updateSubFolder = currentParentId != ""? findNodeById(treeData, currentParentId as string): treeData;
          state.subFolder = updateSubFolder.children;
          // console.log("*mv* updated tree data: ", current(treeData));
        }
        state.isLoading = false;
      })
      .addCase(updateChildOnPasteThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateChildOnPasteThunk.fulfilled, (state, action) => {
        const { copiedItem, currentParentId, stageType, sourceId } = action.payload;
        if (copiedItem) {
          let treeData = state.data;
          if (stageType == "cut")  removeNodeById(treeData, sourceId as string);
          insertNodeInTree(treeData, copiedItem);
          state.data = treeData;
          const updatedSubFolder = currentParentId != ""? findNodeById(treeData, currentParentId as string): treeData;
          state.subFolder = updatedSubFolder.children;
          state.stagedFile = {stageType: "none", file: {}};
          // console.log("*cp* updated tree data: ", current(treeData));
        }
        state.isLoading = false;        
      })
  }
});

export const {
  updateSubFolderData,
  updateBreadCrumbTree,
  sortSubFolder,
  setFileToStaged,
  setFileToActive,
  setSelectedFilePath,
} = folderReducer.actions;

export const selectFolders = (state: any) => state.folder;

export default folderReducer.reducer;
