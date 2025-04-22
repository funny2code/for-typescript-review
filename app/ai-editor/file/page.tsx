"use client";
import { AIEDITOR_AVAILABLE_TYPES } from "constants/aieditor";
import {
  Button,
  ButtonGroup,
  Flex,
  Input,
  Label,
  Loader,
} from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";

import TailwindAdvancedEditor from "@components/Novel/advanced-editor";
import { useRouter } from "next/navigation";
import type { JSONContent } from "novel";

import { downloadData, uploadData } from "aws-amplify/storage";
import { getFileExtension, getFileProperty } from "@redux/reducers/helper";
import { useSelector } from "react-redux";
import { selectFolders } from "@redux/reducers/folderReducer";
import { IConfirmDialog, IFolderState } from "interfaces";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const AIEditorPage = () => {
  const companyState = useSelector(selectCompanyState);
  const folderState: IFolderState = useSelector(selectFolders);
  const filePath = folderState?.selectedFilePath;
  const { selectedCompanyId: companyId } = companyState;
  const [fileName, setFileName] = useState("untitled.md");
  const [fileContent, setFileContent] = useState<JSONContent>();
  const [path, setPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  
  const defaultExt = ".md";
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);

  const emptyFileContent: JSONContent = {
    /* type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "" }],
      }
    ], */
  }
  const handleViewSavedFiles = () => {
    router.push(`/file-manager`);
  };

  const handleSaveEditorContent = async () => {
    setIsSaving(true);
    if (!fileContent) {
      setIsSaving(false);
      return;
    }

    const partPaths = path.split("/");
    const originFileName = partPaths[partPaths.length - 1];
    let currentPath = path;
    
    // Checking the file type
    const fileExt = getFileExtension(fileName.trim()) || '';

    if (fileExt != '' && !AIEDITOR_AVAILABLE_TYPES.includes(fileExt.toLocaleLowerCase())) {
      setShowMessage({
        open: true,
        title: "Error",
        content: "File type not supported in AI Editor. Available types are .txt, .md, .json.",
        isConfirm: false,
        handleConfirm: () => {}
      });
      setIsSaving(false);
      return;
    }

    let trimFileName = fileName.trim() + (fileExt == '' ? defaultExt : "");
    if (originFileName!== trimFileName) {
      currentPath = currentPath.split("/").slice(0,-1).join("/")+"/"+trimFileName;
    }
    let text = fileContent as unknown as string;
    
    if (typeof text == "object" && Object.keys(text).length == 0) {
      text = ""
    }

    // Checking file-existance
    const currentFileProperty = await getFileProperty(currentPath);
    if (!currentFileProperty) {
      await uploadData({
        path: currentPath,
        data: text,
      }).result;
      setIsSaving(false);
    } else {
      setShowMessage({
        open: true,
        title: "Warning",
        content: "The same file exists already. Would you like to overwrite it?",
        isConfirm: true,
        handleConfirm: async () => {
          await uploadData({
            path: currentPath,
            data: text,
          }).result;
          setIsSaving(false);
        }
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (filePath) {
        let decodedFilePath = decodeURIComponent(filePath);
        let fullFilePath = decodedFilePath;
        if (fullFilePath.endsWith('/')) {
          fullFilePath = fullFilePath.slice(0, -1);
        }
        setPath(fullFilePath);
        const downloadResult = await downloadData({
          path: fullFilePath
        }).result;
        const text = await downloadResult.body.text();
        const partPaths = fullFilePath.split('/');
        
        setFileContent(text as unknown as JSONContent || emptyFileContent);
        setFileName(partPaths[partPaths.length - 1] || "untitled.md");
      } else {
        router.push("/file-manager");
      }
    };

    fetchData();
  }, [filePath, companyId]);

  if (!fileContent) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="m-6">
      <div className="mb-5">
        <ButtonGroup justifyContent={"end"} size="small" fontWeight={400}>
          <Button
            variation="primary"
            isDisabled={isSaving}
            isLoading={isSaving}
            onClick={() => {
              handleSaveEditorContent();
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              handleViewSavedFiles();
            }}
          >
            View All Files
          </Button>
        </ButtonGroup>
        <Flex direction="column" gap="small">
          <Label htmlFor="file_name">File Name</Label>
          <Input
            id="file_name"
            name="file_name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </Flex>
      </div>
      <div className="flex items-center gap-1.5 m-1">
        <p className="text-sm text-muted-foreground px-2">Edit with AI using the smart editor above. Highlight text or begin a new line to get started!</p>
      </div>
      <TailwindAdvancedEditor
        fileContent={fileContent || emptyFileContent}
        setFileContent={setFileContent}
        fileName={fileName}
      />
      {showMessage && 
        <ConfirmDialog 
          open = {showMessage.open}
          title = {showMessage.title}
          content = {showMessage.content}
          handleClose = {() => { setShowMessage(null); setIsSaving(false); }}
          isConfirm = {showMessage.isConfirm}
          handleConfirm={showMessage.handleConfirm}
        />
      }
    </div>
  );
};

export default AIEditorPage;
