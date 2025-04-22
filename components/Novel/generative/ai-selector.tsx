"use client";

import { Command, CommandInput } from "@components/Novel/ui/command";
import { KeyboardEvent, SetStateAction, useContext, useState } from "react";

import { useCompletion } from "ai/react";
// import { AppContext } from "contexts/NovelEditorContext";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel/extensions";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { IAIEditorState } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { setAIEditorAction } from "@redux/actions/aieditorAction";

//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ open, onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { aiEditorData } = aiEditorState;
  const dispatch = useDispatch();
  const {
    gptModel,
    gptTemp,
    gptUserPrt,
    gptSysPrt,
    gptTopP,
    gptArbVars,
    gptMaxTokens,
    llmOpt,
  } = aiEditorData;

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
    onError: (e) => {
      toast.error(e.message, {
        duration: 3000,
        position: "bottom-center"
      });
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (completion)
        return complete(completion, {
          body: {
            option: "zap",
            command: inputValue,
            params: {
              gptModel,
              gptTemp,
              gptSysPrt,
              gptUserPrt,
              gptTopP,
              gptArbVars,
              gptMaxTokens,
              llmOpt,
            },
          },
        }).then(() => setInputValue(""));

      const slice = editor?.state.selection.content();
      const text = editor?.storage.markdown.serializer.serialize(
        slice?.content
      );
      // setGptHighlight(text);
      dispatch(setAIEditorAction({ key: "gptHighlight", value: text }));
      complete(text, {
        body: {
          option: "zap",
          command: inputValue,
          params: {
            gptModel,
            gptTemp,
            gptSysPrt,
            gptUserPrt,
            gptTopP,
            gptArbVars,
            gptMaxTokens,
            llmOpt,
          },
        },
      }).then(() => setInputValue(""));
    }
  };

  const hasCompletion = completion.length > 0;
  if (!editor) return;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => addAIHighlight(editor)}
              onKeyDown={(e)=>onKeyDown(e)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                if (completion)
                  return complete(completion, {
                    body: {
                      option: "zap",
                      command: inputValue,
                      params: {
                        gptModel,
                        gptTemp,
                        gptSysPrt,
                        gptUserPrt,
                        gptTopP,
                        gptArbVars,
                        gptMaxTokens,
                        llmOpt,
                      },
                    },
                  }).then(() => setInputValue(""));

                const slice = editor?.state.selection.content();
                const text = editor?.storage.markdown.serializer.serialize(
                  slice?.content
                );
                // setGptHighlight(text);
                dispatch(setAIEditorAction({ key: "gptHighlight", value: text }));
                complete(text, {
                  body: {
                    option: "zap",
                    command: inputValue,
                    params: {
                      gptModel,
                      gptTemp,
                      gptSysPrt,
                      gptUserPrt,
                      gptTopP,
                      gptArbVars,
                      gptMaxTokens,
                      llmOpt,
                    },
                  },
                }).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4 bg-gray-700" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor?.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) =>
                complete(value, {
                  body: {
                    option,
                    params: {
                      gptModel,
                      gptTemp,
                      gptSysPrt,
                      gptUserPrt,
                      gptTopP,
                      gptArbVars,
                      gptMaxTokens,
                      llmOpt,
                    },
                  },
                })
              }
            />
          )}
        </>
      )}
    </Command>
  );
}
