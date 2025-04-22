"use client";
import { AIEDITOR_AVAILABLE_TYPES } from "constants/aieditor";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./Filemanager.css";
import Navbar from "@components/Filemanager/Navbar/Navbar";
import { Input } from "@components/shadcn/ui/input";
import { EllipsisVertical, Search, FileUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/shadcn/ui/dropdown-menu";
import { setSelectedFilePathAction, updateFileOnPaste, uploadFile } from "@redux/actions/folderAction";

import { selectFolders } from "@redux/reducers/folderReducer";
import { fetchFolderRoot } from "@redux/actions/folderAction";
import FileList from "@components/Filemanager/FileList/FileList";
import BreadCrumbText from "@components/Filemanager/BreadCrumb/BreadCrumbText";
import ContextMenu from "@components/Filemanager/ContextMenu/ContextMenu";
import { IFile, IConfirmDialog } from "interfaces";
import FolderTreePanel from "./FolderTree/FolderTreePanel";
import { useDispatch, useSelector } from "react-redux";
import { updateSubFolder } from "@redux/actions/folderAction";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { findNodeById, isSameFileExits } from "@redux/reducers/helper";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const Filemanager = () => {
  const companyState = useSelector(selectCompanyState);
  const { selectedCompanyId: companyId } = companyState;
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const folderData = useSelector(selectFolders);
  const { path, subFolder, stagedFile } = folderData;
  const dispatch = useDispatch();
  let filteredSubFolderData = [];
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);

  useEffect(() => {
    dispatch(fetchFolderRoot(companyId));
  }, [dispatch, companyId]);

  const handleOnSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
  };

  if (folderData?.subFolder && folderData?.subFolder.length) {
    filteredSubFolderData = folderData.subFolder.filter((file: IFile) =>
      file.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  const handleOnOpenFolder = async (file: IFile, index: number) => {
    if (file.isFolder) {
      dispatch(updateSubFolder({ ...file, index }));
    } else {
      // Checking file extension
      const fileExt = file.name.split(".").pop() || 'no-ext';
      if (!AIEDITOR_AVAILABLE_TYPES.includes(fileExt.toLocaleLowerCase())) {
        setShowMessage({
          open: true,
          title: "Error",
          content: "File type not supported in AI Editor. Available types are .txt, .md, .json.",
          isConfirm: false,
          handleConfirm: () => {}
        });
        return;
      }
      dispatch(setSelectedFilePathAction(file.path));
      router.push(
        // `/ai-editor/${encodeURIComponent(`${file.path}`)}`
        'ai-editor/file'
      );
    }
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

        const parentFile = findNodeById(folderData.data, parentFolderId as string);
        const isInvalidUpload = isSameFileExits(file.name, parentFile.children);
        if (isInvalidUpload) {
          setShowMessage({
            open: true,
            title: "Error",
            content: "The same file/folder exists already. Please change the file/folder name.",
            isConfirm: false,
            handleConfirm: () => {}
          });
        } else {
          dispatch(uploadFile(file.name, text, parentFolderId));
        }
      }
      reader.readAsText(file);
    }
    input.click();
  }

  const handleOnPaste = () => {
    let targetId = folderData.data.id;
    const {path} = folderData;
    if (path.length) {
      targetId = path[path.length - 1].id;
    }
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
    
  }

  return (
    <>
      {/* <Navbar handleOnSearch={handleOnSearch} /> */}
        {folderData && folderData?.isLoading ? (
          <Box sx={{display: 'flex'}}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <div className="grid grid-cols-10 gap-3 overflow-y-auto max-h-[calc(100vh - 72px)]">
              <div className="hidden md:block col-span-2 pt-4 pl-4 pb-4">
                <h2 className="text-lg mb-2 font-bold">All Files</h2>
                <FolderTreePanel 
                  explorerData={folderData.data.children || []} 
                  handleOnOpenFolder={handleOnOpenFolder} 
                  companyId={companyId}
                  from={"folder-tree-view"}
                />
              </div>
              <div className="col-span-12 md:col-span-8 bg-white p-4 flex flex-col gap-8" style={{ overflowY: "scroll", borderLeft: "1px solid #e2e8f0" }}>
                <h2 className="block md:hidden text-lg font-bold">All Files</h2>
                <div className="flex justify-between items-center">
                  <BreadCrumbText />
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="w-[250px] sm:w-[300px] rounded-lg bg-background pl-8"
                        onChange={handleOnSearch}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="">
                        <EllipsisVertical className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={handleUpload}
                          className="flex gap-2"
                        >
                          <FileUp height={"1rem"} width={"1rem"} />
                          Upload file
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <ContextMenu  handleOnPaste={handleOnPaste}>
                  <FileList fileList={filteredSubFolderData} handleOnOpenFolder={handleOnOpenFolder} />
                </ContextMenu>
              </div>
            </div>
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
          </>
        )}
    </>
  );
};

export default Filemanager;