import { IFile, IID, IFilePath } from "interfaces";
import { v4 as uuidv4 } from "uuid";
import { uploadData, list, copy, remove, downloadData, getProperties } from "aws-amplify/storage";
import { current } from "@reduxjs/toolkit";
import { PrefixList } from "aws-cdk-lib/aws-ec2";

export const getValidatedPath = (path: string, isFolder: boolean) => {
  let updatedPath = path.replace("//", "/");
  if (isFolder) {
    if (updatedPath[updatedPath.length - 1]!= "/") {
      updatedPath += "/";
    }
  } else {
    if (updatedPath[updatedPath.length - 1] == "/") {
      updatedPath = updatedPath.slice(0, -1);
    }
  }
  return updatedPath;
}

export const writePath2Target = (tree: IFile, targetId: IID, path: any[], pathTree: IFile[][]) : boolean => {
  if (tree.id == targetId) {
      path.push({id: tree.id, name: tree.name});
      pathTree.push(tree?.children);
      return true;
  }
  if (tree.children) {
    for (let i = 0; i < tree.children.length; i++) {
      const res = writePath2Target(tree.children[i], targetId, path, pathTree);
      if (res) {
        if (tree.name != 'root')
        {
          path.push({id: tree.id, name: tree.name});
          pathTree.push(tree.children)
        }
        return true;
      }
    }
  }
  return false;
}

export const updateSubFolder = (state: any, openedFolder: IFile) => {
  let treeData = state.data;
  let updatedPath: IID[] = [];
  let updatedPathTree: IFile[][] = [];
  writePath2Target(treeData, openedFolder.id, updatedPath, updatedPathTree);
  state.subFolder = openedFolder.children;
  state.currentPath = openedFolder.path;
  state.path = updatedPath.reverse();
  state.pathTree = updatedPathTree.reverse();
  return state;
}

export const updateSubFolderTree = (tree: any, pathArr: IFilePath[]) => {
  let folderTree = tree.children;

  if (!pathArr.length) return folderTree;

  const pathTree = pathArr.reduce((acc, curr) => {
    folderTree = folderTree[curr.index].children;

    acc = folderTree;
    return acc;
  }, []);

  return pathTree;
};
export const removeNodeById = (treeData: any, id: string) => {
  for (let i = 0; i < treeData.children.length; i ++) {
    if (treeData.children[i].id == id) {
      treeData.children.splice(i, 1);
      return;
    } else {
      removeNodeById(treeData.children[i], id);
    }
  }
}

export const findNodeById = (treeData: any, id: string): any => {
  if (treeData.id == id) return treeData;
  for (let i = 0; i < treeData.children.length; ++i) {
    const result = findNodeById(treeData.children[i], id);
    if (result) return result;
  }
  return null;
}


export const insertNodeInTree = (treeData: any, newFile: any) => {
  if (treeData.id == newFile.parentId) {
    treeData.children.push(newFile);
  } else {
    for (let i = 0; i < treeData.children.length; i ++) {
      insertNodeInTree(treeData.children[i], newFile);
    }
  }
}

export const updateTreeData = (treeData: any, id: string, name: string, path: string) => {
  if (treeData.id == id) {
    treeData.name = name;
    treeData.path = path;
  } else {
    for (let i = 0; i < treeData.children.length; ++ i) {
      updateTreeData(treeData.children[i], id, name, path);
    }
  }
}

export const _updateSubFolder = (subFolder: any[], id: string, name: string, path: string) => {
  for (let i = 0; i < subFolder.length; ++ i) {
    if (subFolder[i].id == id) {
      subFolder[i].name = name;
      subFolder[i].path = path;
    } else {
      _updateSubFolder(subFolder[i].children, id, name, path);
    }
  }
}

export const deleteNodeInTree = (treeData: any, targetId: string, subTreeData: any) => {
  for (let i = 0; i < treeData.children.length; i++) {
    if (treeData.children[i].id == targetId) {
      subTreeData = treeData.children[i];
      treeData.children.splice(i, 1);
      return true;
    } else {
      deleteNodeInTree(treeData.children[i], targetId, subTreeData);
    }
  }
  return false;
}

export const getAllSubIds = (treeData: any, subIds: string[]) => {
  subIds.push(treeData.id);
  for (let i = 0; i < treeData.children.length; i ++) {
    getAllSubIds(treeData.children[i], subIds);
  }
}

export const createTree = (files: any[], customTree = {}, pathPrefix = "") => {
  let tree: any;
  if (Object.keys(customTree).length === 0) {
    tree = {
      id: "root",
      name: "root",
      isFolder: true,
      parentId: "",
      color: "#8f95a0",
      path: "/",
      children: [],
    }
  } else {
    tree = customTree;
  }
  let pathMap: any = { root: tree };

  files.forEach(file => {
    const parts = file.path.split('/');
    let current: any = pathMap["root"];

    parts.forEach((part: string, index: number) => {
      if (!part) return; // Skip empty parts
      const fullPath: string = `${pathPrefix}${file.path.substring(0, file.path.indexOf(part) + part.length)}` + ((index < parts.length - 1) ? "/" : "");
      if (!current.children.some((e: any) => e.name === part)) {
        const node = {
          id: JSON.parse(file.eTag) + uuidv4(),
          name: part,
          isFolder: index < parts.length - 1,
          parentId: current.id,
          color: (index < parts.length - 1) ? "#8f95a0" : "#cad333",
          children: [],
          path: fullPath
        };
        pathMap[fullPath] = node;
        current.children.push(node);
      }
      current = current.children.find((e: any) => e.name === part);
    });
  });
  pathMap = {};
  const rootTree = tree.children[0].children[0];
  rootTree.name = "root"
  // console.log("initial tree: ", rootTree);

  return rootTree;
}

export const createSubTree = (files: any[], customTree = {}, pathPrefix = "") => {
  let tree: any;
  let rootIndex = "root";

  tree = customTree;
  rootIndex = tree.path;

  let pathMap: any;
  pathMap = {};
  pathMap[rootIndex] = tree;
  // console.log("customTree", customTree, files, pathPrefix, pathMap)

  files.forEach(file => {
    const parts = file.path.split('/');
    let current: any = pathMap[rootIndex];
    // console.log("file: ", file);
    parts.forEach((part: string, index: number) => {
      if (!part) return; // Skip empty parts
      const fullPath: string = `${pathPrefix}${file.path.substring(0, file.path.indexOf(part) + part.length)}` + ((index < parts.length - 1) ? "/" : "");
      // console.log("fullPath: ", fullPath);
      if (!current.children.some((e: any) => e.name === part)) {
        const node = {
          id: JSON.parse(file.eTag) + uuidv4(),
          name: part,
          isFolder: index < parts.length - 1,
          parentId: current.id,
          color: (index < parts.length - 1) ? "#8f95a0" : "#cad333",
          children: [],
          path: fullPath
        };
        pathMap[fullPath] = node;
        current.children.push(node);
      }
      current = current.children.find((e: any) => e.name === part);
    });
  });
  pathMap = {};
  // console.log("sub tree: ", tree);
  return tree;
}

/* Sorting */
export const updateNodeOnSort = (tree: any, parentId: IID, children: []) => {
  if (tree.id === parentId) {
    return { ...tree, children: [...children] };
  }

  const latestNode = tree?.children?.map((item: any) => {
    return updateNodeOnSort(item, parentId, children);
  });

  return { ...tree, children: latestNode };
};


export const updatePathTree = (tree: any, pathArr: IFilePath[] = []) => {
  let folderTree = tree.children;
  // console.log("folder tree: ", folderTree, current(pathArr));
  const pathTree = pathArr.reduce((acc: any, curr, currentIndex) => {
    // console.log("sub folder tree: ", acc, current(curr), folderTree[currentIndex]);
    folderTree = folderTree[currentIndex].children;

    acc.push(folderTree);

    return acc;
  }, []);

  return pathTree;
};

/* S3 buckets */

export const getFileList = async (path: string) => {
  try {
    path = getValidatedPath(path, true);
    const res = await list({ path });
    return res.items;
  } catch (error) {
    return [];
  }
}

export const copyItem = async (sourcePath: string, destinationPath: string) => {
  try {
    const res = await copy({ source: { path: sourcePath }, destination: { path: destinationPath } });
    // console.log("copy track: ", sourcePath, destinationPath, res);
    return "path" in res;
  } catch (error) {
    return false;
  }
}

export const deleteItem = async (path: string) => {
  try {
    const res = await remove({ path });
    return "path" in res;
  } catch (error) {
    return false;
  }
}

export const uploadItem = async (path: string, data: string, isFolder: boolean) => {
  try {
    path = getValidatedPath(path, isFolder);
    const res = await uploadData({ path, data }).result;
    return res;
  } catch (error) {
    return null;
  }
}

export const downloadItem = async (path: string) => {
  try {
    path = getValidatedPath(path, false);
    const res = await downloadData({ path }).result;
    return await res.body.text();
  } catch (error) {
    return "";
  }
}

export const getFileProperty = async (path: string) => {
  try {
    // Checking if the same name file exists
    const fileProperty = await getProperties({ path });
    return fileProperty
  } catch (error) {
    return false;
  }
}

export const getFileExtension = (filename: string) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

export const isSameFileExits = (source: IFile, children: IFile[], isDup = false) => {
  if (!children.length) return false;
  if (isDup) {
    const { name: oldName, isFolder } = source;
      
    let extName = oldName.split(".").pop();
    let fileName = "", newName = "";
    if (!isFolder && extName == oldName) {
      newName = oldName + " (copy)";
    } else {
      fileName = oldName.split(".").slice(0, -1).join(".");
      newName = isFolder ? (oldName + " (copy)") : (fileName + " (copy)" + "." + extName);
    }
    for (let i = 0; i < children.length; ++ i) {
      const child = children[i];
      if (child.name == newName && child.isFolder == source.isFolder) return true;
    }
  } else {
    for (let i = 0; i < children.length; ++ i) {
      const child = children[i];
      if (child.name == source.name && child.isFolder == source.isFolder) return true;
    }
  }
  return false;
}