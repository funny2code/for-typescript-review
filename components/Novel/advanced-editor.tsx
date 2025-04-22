"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import {
  ImageResizer,
  getPrevText,
  handleCommandNavigation,
} from "novel/extensions";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import { handleImageDrop, handleImagePaste } from "novel/plugins";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

import { useCompletion } from "ai/react";
import { toast } from "sonner";
import "./prosemirror.css";

// Import Panels
// import { AppContext } from "contexts/NovelEditorContext";
/* import FeaturesPanel from "./ui/panels/features-panel";
import PromptsList from "./ui/panels/prompts-panel";
import PromptSetList from "./ui/panels/promptset-panel";
import ReportList from "./ui/panels/scanlist-panel";
import Placeholder from "@tiptap/extension-placeholder"; */
import { useDispatch, useSelector } from "react-redux";
import { setAIEditorAction } from "@redux/actions/aieditorAction";
import { IAIEditorState } from "interfaces";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = ({
  fileContent = {},
  setFileContent = () => {},
  fileName = "",
}: {
  fileContent: JSONContent;
  setFileContent: React.Dispatch<React.SetStateAction<JSONContent>>;
  fileName: string;
}) => {
  const [initialContent, setInitialContent] = useState<JSONContent>({});

  let _range: any = null;
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [isPromptSetVisible, setIsPromptSetVisible] = useState(false);
  const [isPromptListVisible, setIsPromptListVisiable] = useState(false);
  const [isFeatureVisible, setIsFeatureVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { aiEditorData } = aiEditorState;
  const {
    gptModel,
    gptTemp,
    gptUserPrt,
    gptSysPrt,
    gptTopP,
    gptHighlight,
    gptArbVars,
    textFull,
    textToInsert,
    gptMaxTokens,
    promptSets,
    selectedPromptSetId,
    llmOpt,
    isScanning,
    novelEditor,
  } = aiEditorData;

  const dispatch = useDispatch();
  const columnLayoutClassName = useMemo(() => {
    return (
      12 -
      (isPromptSetVisible ? 2 : 0) -
      (isPromptListVisible ? 2 : 0) -
      (isFeatureVisible ? 4 : 0) -
      (isReportVisible ? 4 : 0)
    );
  }, [
    isPromptSetVisible,
    isPromptListVisible,
    isFeatureVisible,
    isReportVisible,
  ]);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      window.localStorage.setItem("novel-content", JSON.stringify(json));
      setSaveStatus("Saved");
    },
    500
  );

  const { completion, complete, isLoading } = useCompletion({
    // id: "novel",
    api: "/api/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.", {
          duration: 3000,
          position: "bottom-center"
        });
        return;
      }
    },
    onFinish(prompt, completion) {
      if (novelEditor) {
        const selection = novelEditor.state.selection;
        _range
          ? novelEditor
              .chain()
              .focus()
              .deleteRange(_range)
              .insertContentAt(selection.to, completion)
              .run()
          : novelEditor.chain().insertContentAt(selection.to, completion).run();
      }
    },
    onError: (e) => {
      toast.error("Internal Server Error!", {
        duration: 3000,
        position: "bottom-center"
      });
    },
  });

  /* useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    dispatch(setAIEditorAction({ key: "content", value: "" }));
    if (content) setInitialContent(JSON.parse(content));
  }, [dispatch]); */

  const onCommand = (item: any, val: any) => {
    if (item.title == "Continue writing" && !isLoading) {
      const { editor, range } = val;
      _range = range;
      const text = getPrevText(editor, { chars: 5000 });
      complete(text, {
        body: {
          option: "continue",
          params: {
            gptModel,
            gptTemp,
            gptSysPrt,
            gptUserPrt,
            gptTopP,
            gptArbVars,
            gptMaxTokens,
            text_full: textFull,
            text_to_insert: textToInsert,
            text_highlighted: gptHighlight,
            llmOpt,
          },
        },
      });
    } else {
      item.command(val);
    }
  };

  if (!initialContent) return null;

  return (
    <div className="relative w-full grid grid-cols-12 gap-1">
      {isLoading && (
        <div
          style={{
            position: "fixed" /* Use fixed positioning */,
            top: "50%" /* Position at half the height of the viewport */,
            left: "50%" /* Position at half the width of the viewport */,
            transform: "translate(-50%, -50%)" /* Adjust to the exact center */,
            backgroundColor:
              "rgba(0, 0, 0, 0.5)" /* Semi-transparent background */,
            padding: "20px",
            borderRadius: "10px",
            color: "white" /* Text color */,
            textAlign: "center" /* Center the text horizontally */,
            zIndex: 100,
          }}
        >
          AI is thinking now...
        </div>
      )}
      {/* <div
        className={`border-stone-200 sm:rounded-lg sm:border sm:shadow-lg 
          ${
            isPromptSetVisible
              ? `col-span-2 p-2`
              : `bg-yellow hover:bg-yellow-500 absolute z-10`
          }`}
        style={!isPromptSetVisible ? { marginLeft: "-25px" } : undefined}
      >
        <PromptSetList
          isPromptSetVisible={isPromptSetVisible}
          setIsPromptSetVisible={setIsPromptSetVisible}
          setIsReportVisible={setIsReportVisible}
          promptSets={promptSets}
          setPromptSets={setPromptSets}
          selectedPromptSetId={selectedPromptSetId}
          setSelectedPromptSetId={setSelectedPromptSetId}
        />
      </div> */}
      {/* <div
        className={`border-stone-200 sm:rounded-lg sm:border sm:shadow-lg 	
          ${
            isReportVisible
              ? "col-span-4 p-2"
              : "bg-green hover:bg-green absolute z-10 pb-3"
          }`}
        style={
          !isPromptSetVisible && !isReportVisible
            ? { top: "145px", marginLeft: "-25px" }
            : !isReportVisible
            ? { marginLeft: "-25px" }
            : undefined
        }
      >
        <ReportList
          isReportVisible={isReportVisible}
          setIsReportVisible={setIsReportVisible}
          isPromptSetVisible={isPromptSetVisible}
          setIsPromptSetVisible={setIsPromptSetVisible}
          setIsFeatureVisible={setIsFeatureVisible}
          setIsPromptListVisiable={setIsPromptListVisiable}
          fileName={fileName}
          fileContent={fileContent}
        />
      </div> */}
      <div
        className={
          columnLayoutClassName == 4
            ? "col-span-4"
            : columnLayoutClassName == 8
            ? "col-span-8"
            : columnLayoutClassName == 10
            ? "col-span-10"
            : columnLayoutClassName == 6
            ? "col-span-6"
            : "col-span-12"
        }
      >
        <EditorRoot>
          <EditorContent
            initialContent={fileContent}
            extensions={extensions}
            className="relative min-h-[300px] w-full border-muted bg-background sm:rounded-lg sm:border sm:border-gray-300"
            editorProps={{
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              handlePaste: (view, event) =>
                handleImagePaste(view, event, uploadFn),
              handleDrop: (view, event, _slice, moved) =>
                handleImageDrop(view, event, moved, uploadFn),
              attributes: {
                class: `prose prose-lg prose-headings:font-title font-default focus:outline-none max-w-full`,
              },
            }}
            onCreate={({ editor }) => {
              // setNovelEditor(editor);
              dispatch(setAIEditorAction({ key: "novelEditor", value: editor }));
            }}
            onUpdate={({ editor }) => {
              // setNovelEditor(editor);
              dispatch(setAIEditorAction({ key: "novelEditor", value: editor }));
              const selection = editor.state.selection;
              
              const lastTwo = editor.state.doc.textBetween(
                Math.max(0, editor.state.selection.from - 2),
                editor.state.selection.from,
                "\n"
              );
              // editor.commands.setContent(fileContent);
              const current_content = getPrevText(editor, { chars: 5000 });
              if (current_content.length > 0) {
                setFileContent(current_content);
              } else {
                setFileContent({});
              }
              dispatch(setAIEditorAction({ key: "textFull", value: editor.state.doc.textContent }));
              dispatch(setAIEditorAction({ key: "textToInsert", value: editor.state.doc.textBetween(0, selection.from, "\n") }));
              /* setTextFull(editor.state.doc.textContent);
              setTextToInsert(
                editor.state.doc.textBetween(0, selection.from, "\n")
              ); */

              if (lastTwo === "++" && !isLoading) {
                editor.commands.deleteRange({
                  from: selection.from - 2,
                  to: selection.from,
                });
                const text = getPrevText(editor, { chars: 5000 });
                // _editor = editor;
                _range = null;
                /* complete(text, {
                  body: {
                    option: "continue",
                    params: {
                      gptModel,
                      gptTemp,
                      gptSysPrt,
                      gptUserPrt,
                      gptTopP,
                      gptArbVars,
                      gptMaxTokens,
                      text_full: textFull,
                      text_to_insert: textToInsert,
                      text_highlighted: gptHighlight,
                      llmOpt,
                    },
                  },
                }); */
              } else {
                debouncedUpdates(editor);
                setSaveStatus("Unsaved");
              }
            }}
            slotAfter={<ImageResizer />}
          >
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-muted-foreground">
                No results
              </EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item) => (
                  <EditorCommandItem
                    value={item.title}
                    onCommand={(val) => onCommand(item, val)}
                    className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                    key={item.title}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </EditorCommandItem>
                ))}
              </EditorCommandList>
            </EditorCommand>

            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
              <Separator orientation="vertical" />
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <TextButtons />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          </EditorContent>
        </EditorRoot>
      </div>
      {/* <div
        className={`border-stone-200 sm:rounded-lg sm:border sm:shadow-lg 	
          ${
            isPromptListVisible
              ? "col-span-2 p-2"
              : "bg-[#3BF7F7] absolute right-1 z-10"
          }`}
      >
        <PromptsList
          isPromptListVisible={isPromptListVisible}
          setIsPromptListVisiable={setIsPromptListVisiable}
          setIsReportVisible={setIsReportVisible}
          promptSets={promptSets}
          setPromptSets={setPromptSets}
          selectedPromptSetId={selectedPromptSetId}
          setSelectedPromptSetId={setSelectedPromptSetId}
        />
      </div> */}
      {/* <div
        className={`border-stone-200 sm:rounded-lg sm:border sm:shadow-lg
          ${
            isFeatureVisible
              ? `col-span-4 p-2`
              : `bg-[#FF33AA] absolute right-1 z-10`
          }`}
        style={
          !isFeatureVisible && !isPromptListVisible
            ? { top: "118px" }
            : undefined
        }
      >
        <FeaturesPanel
          isFeatureVisible={isFeatureVisible}
          setIsFeatureVisible={setIsFeatureVisible}
          setIsReportVisible={setIsReportVisible}
        />
      </div> */}
    </div>
  );
};

export default TailwindAdvancedEditor;
