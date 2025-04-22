"use client";
import { AIEDITOR_AVAILABLE_TYPES } from "constants/aieditor";
import { Button, ButtonGroup, Flex, Loader } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";

import { IFile, IAIEditorState, IConfirmDialog } from "interfaces";
import TailwindAdvancedEditor from "@components/Novel/advanced-editor";
import { Input as ShadInput } from "@components/shadcn/ui/input";
import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { getFileExtension, getFileProperty, getValidatedPath } from "@redux/reducers/helper";
import { uploadData } from "aws-amplify/storage";
import { useRouter } from "next/navigation";
import type { JSONContent } from "novel";
import { useSelector } from "react-redux";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import { Card } from "@components/shadcn/ui/card";
import { SparklesIcon } from "lucide-react";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import SmartEditor from "@components/Novel/SmartEditor";
import { ICompanyState } from "interfaces";
import { selectCompanyState } from "@redux/reducers/companyReducer";

const AIEditorPage = () => {
  const [fileName, setFileName] = useState("untitled.md");
  const [fileContent, setFileContent] = useState<JSONContent>();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { aiEditorData } = aiEditorState;
  const { selectedCompanyId: companyId } = companyState;

  const defaultExt = ".md";
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);
  
  const path = `company/${companyId}/`;
  
  
  const emptyFileContent: JSONContent = {
    /* type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "" }],
      }
    ], */
  };

  useEffect(() => {
    setFileContent(
      (aiEditorData.content as unknown as JSONContent) || emptyFileContent
    );
  }, []);
  
  const handleViewSavedFiles = () => {
    router.push(`/file-manager`);
  };

  const handleSaveEditorContent = async () => {
    setIsSaving(true);
    if (!fileContent) {
      // console.error("No file content to save");
      setIsSaving(false);
      return;
    }
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

    let text = fileContent as unknown as string;

    if (typeof text == "object" && Object.keys(text).length == 0) {
      text = "";
    }
    const currentPath = `${path}${fileName.trim()}` + (fileExt == '' ? defaultExt : ''); 
    // Checking file-existance
    const currentFileProperty = await getFileProperty(currentPath);
    if (!currentFileProperty) {
      const uploadResult = await uploadData({
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

  if (!fileContent) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  
  return (
    <Card className="m-6 bg-white p-6">
      <div className="mb-5">
        <div className="flex flex-col justify-between mb-8 gap-8">
          <div>
            <h2 className="text-lg font-bold">AI Content Editor</h2>
            <p className="text-sm text-muted-foreground">The AI content editor combines standard text editing features with AI-driven text editing. Simply highlight text and ask AI to make improvements.</p>
          </div>
        </div>
        <div className="flex flex-col">
          <ShadLabel className="mb-2" htmlFor="file-name">
            File name
          </ShadLabel>
          <ShadInput
            id="file-name"
            name="file-name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-white color-black"
          />
        </div>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-1.5">
          <SparklesIcon height={"1rem"} width={"1rem"} />
          <ShadLabel>
            File content
          </ShadLabel>
        </div>
      </div>
      {/* <SmartEditor 
        fileContent={ fileContent as unknown as string || emptyFileContent as unknown as string }
        setFileContent={(content) => setFileContent(content as unknown as JSONContent)}
        fileName={fileName}
      /> */}
      <TailwindAdvancedEditor
        fileContent={fileContent || emptyFileContent}
        setFileContent={setFileContent}
        fileName={fileName}
      />
      <div className="flex items-center gap-1.5 mt-2">
        <p className="text-sm text-muted-foreground">Enhance any text content using the editor above. Copy and paste content or press &apos;/&apos; to get started!</p>
      </div>
      <div className="flex gap-2 mt-5 justify-end">
        <ShadButton
          disabled={isSaving}
          onClick={() => {
            handleSaveEditorContent();
          }}
        >
          {isSaving ? "Saving..." : "Save"}
        </ShadButton>
        <ShadButton
          variant={"outline"}
          onClick={() => {
            handleViewSavedFiles();
          }}
        >
          View All Files
        </ShadButton>
      </div>
      {showMessage && 
        <ConfirmDialog 
          open = {showMessage.open}
          title = {showMessage.title}
          content = {showMessage.content}
          handleClose = {() => { setShowMessage(null); setIsSaving(false); }}
          isConfirm = {showMessage.isConfirm}
          handleConfirm={() => { showMessage.handleConfirm(); }}
        />
      }
    </Card>
  );
};

export default AIEditorPage;
