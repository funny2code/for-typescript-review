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
import { useSelector } from "react-redux";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import {
  ImageResizer,
  getPrevText,
  handleCommandNavigation,
} from "novel/extensions";

import React, { useEffect, useState } from "react";
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
import { useDispatch } from "react-redux";
import { 
  /* setContentAction,
  setNovelEditorAction,
  setTextFullAction,
  setTextToInsertAction, */
  setAIEditorAction
} from "@redux/actions/aieditorAction";
import { Editor } from "@tiptap/react";
import { IAIEditorState } from "interfaces";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";
import { updateCompanyStateOriginAction } from "@redux/actions/companyAction";

const extensions = [...defaultExtensions, slashCommand];

const SmartEditor = ({
  fileContent,
  setFileContent,
  fileName,
  index
}: {
  fileContent: string;
  fileName: string;
  setFileContent: (param: string) => void;
  index?: number;
}) => {
  const [initialContent, setInitialContent] = useState<JSONContent>(fileContent as unknown as JSONContent);

  let _range: any = null;
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [localEditor, setLocalEditor] = useState<EditorInstance | null>(null);

  /* const aiEditorState = useSelector(selectAIEditorState);
  const { aiEditorData, brandLens } = aiEditorState; */
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens, isUpdatedFromServer } = companyState;
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { gptModel, gptTemp, gptUserPrt, gptSysPrt, gptTopP, gptHighlight, gptArbVars, textFull, textToInsert, gptMaxTokens, llmOpt } = aiEditorState.aiEditorData;

  const dispatch = useDispatch();

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      window.localStorage.setItem("novel-content", JSON.stringify(json));
    },
    500
  );

  const { completion, complete, isLoading } = useCompletion({
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
      if (localEditor) {
        const selection = localEditor.state.selection;
        _range
          ? localEditor
              .chain()
              .focus()
              .deleteRange(_range)
              .insertContentAt(selection.to, completion)
              .run()
          : localEditor.chain().insertContentAt(selection.to, completion).run();
      }
    },
    onError: (e) => {
      toast.error("Internal Server Error!", {
        duration: 3000,
        position: "bottom-center"
      });
    },
  });

  useEffect(() => {
    // console.log("isUpdatedFromServer: ", isUpdatedFromServer);
    if (brandLens && localEditor && isUpdatedFromServer) {
      if (fileName == "brandPersonas") {
        localEditor.commands.setContent(brandLens.brandPersonas[index || 0].persona_details);
      } else if (fileName == "brandContentPillars") {
        localEditor.commands.setContent(brandLens.brandContentPillars[index || 0].pillar_details);
      } else {
        localEditor.commands.setContent(brandLens[fileName]);
      }
    }
  }, [brandLens, localEditor]);

  const onCommand = (item: any, val: any) => {
    if (item.title == "Continue writing" && !isLoading) {
      // console.log("item title1 : ", item.title)
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
      // console.log("item title: ", item.title, val);
      item.command(val);
    }
  };

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
      
      <div className="col-span-12">
        <EditorRoot>
          <EditorContent
            initialContent={initialContent}
            extensions={extensions}
            className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            editorProps={{
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              handlePaste: (view, event) =>
                handleImagePaste(view, event, uploadFn),
              handleDrop: (view, event, _slice, moved) =>
                handleImageDrop(view, event, moved, uploadFn),
              attributes: {
                class: `prose prose-headings:font-title font-default focus:outline-none max-w-full`,
              },
            }}
            onCreate={({ editor }) => {
              setLocalEditor(editor);
            }}
            onUpdate={({ editor }) => {
              dispatch(updateCompanyStateOriginAction(false));
              const selection = editor.state.selection;
              
              const lastTwo = editor.state.doc.textBetween(
                Math.max(0, editor.state.selection.from - 2),
                editor.state.selection.from,
                "\n"
              );
              const current_content = getPrevText(editor, { chars: 5000 });
              // console.log("last two: ", current_content, current_content.length);
              if (current_content.length > 0) {
                setFileContent(current_content);
              } else {
                setFileContent("");
              }
              setInitialContent(current_content);
              dispatch(setAIEditorAction({ key: "textFull", value: editor.state.doc.textContent }));
              dispatch(setAIEditorAction({ key: "textToInsert", value: editor.state.doc.textBetween(0, selection.from, "\n") }));
              
              if (lastTwo === "++" && !isLoading) {
                editor.commands.deleteRange({
                  from: selection.from - 2,
                  to: selection.from,
                });
                const text = getPrevText(editor, { chars: 5000 });
                _range = null;
              } else {
                debouncedUpdates(editor);
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
    </div>
  );
};

export default SmartEditor;
