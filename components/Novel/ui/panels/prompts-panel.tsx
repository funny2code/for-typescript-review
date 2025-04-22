"use client";

import {
  // AppContext,
  PromptSetType,
  PromptType,
} from "contexts/NovelEditorContext";
import React, { useContext, useEffect, useRef, useState } from "react";

import { Schema } from "amplify/data/resource";
import { toast } from "sonner";
import { useClient } from "contexts/ClientContext";
import { useUserGroups } from "contexts/UserGroupsContext";
import { IAIEditorState } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { setAIEditorAction } from "@redux/actions/aieditorAction";

const PromptsList = ({
  isPromptListVisible,
  setIsPromptListVisiable,
  promptSets,
  setPromptSets,
  selectedPromptSetId,
  setSelectedPromptSetId,
  setIsReportVisible,
}: {
  isPromptListVisible: boolean;
  setIsPromptListVisiable: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReportVisible: React.Dispatch<React.SetStateAction<boolean>>;
  promptSets: PromptSetType[];
  setPromptSets: React.Dispatch<React.SetStateAction<PromptSetType[]>>;
  selectedPromptSetId: string | null;
  setSelectedPromptSetId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompts, setPrompts] = useState<PromptType[]>([]);
  const [editPrompt, setEditPrompt] = useState<string | null>(null);
  const [newPromptName, setNewPromptName] = useState<string>("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLUListElement>(null);
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { aiEditorData } = aiEditorState;
  const dispatch = useDispatch();
  const {
    gptModel,
    gptTemp,
    gptUserPrt,
    gptSysPrt,
    gptTopP,
    gptMaxTokens,
    selectedPromptId,
    llmOpt,
  } = aiEditorData;
  const dataclient = useClient();
  type Prompt = Schema["Prompt"];
  const { isSuperAdmin } = useUserGroups();

  useEffect(() => {
    if (selectedPromptSetId != null) {
      const sub = dataclient.models.Prompt.observeQuery().subscribe({
        next: ({
          items,
          isSynced,
        }: {
          items: PromptType[];
          isSynced: boolean;
        }) => {
          const filteredPrompts = items.filter(
            (item) => item.promptsetId === selectedPromptSetId
          );
          setPrompts(filteredPrompts);
        },
      });
      return () => sub.unsubscribe();
    }
  }, [dataclient.models.Prompt, selectedPromptSetId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promptRef.current &&
        !promptRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null); // Close any open dropdowns
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, []);

  const toggleListVisibility = () => {
    if (!isPromptListVisible) setIsReportVisible(false);
    setIsPromptListVisiable(!isPromptListVisible);
  };

  const handleAddPrompt = async () => {
    if (!newPromptName.trim()) return;
    if (!selectedPromptSetId) return;
    const { data: newPrompt, errors } = await dataclient.models.Prompt.create({
      name: newPromptName,
      promptsetId: selectedPromptSetId,
      gptSysPrt: "",
      gptUserPrt: "",
      gptModel: "gpt-4",
      gptTemp: 1,
      gptTopP: 1,
      gptMaxTokens: 500,
      llmOpt: "ChatGPT",
    });

    if (!newPrompt) {
      return;
    }

    if (!errors) {
      toast(`Saved the prompt set "${newPromptName}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });

      setPrompts([...prompts, newPrompt]);
    } else {
      alert("error!");
    }

    setNewPromptName("");
  };

  const savePrompt = async (_prompt: PromptType) => {
    const { errors, data: updatedPrompt } =
      await dataclient.models.Prompt.update({
        id: _prompt.id,
        gptSysPrt: gptSysPrt,
        gptUserPrt: gptUserPrt,
        gptModel: gptModel,
        gptTemp: gptTemp,
        gptTopP: gptTopP,
        gptMaxTokens: gptMaxTokens,
        llmOpt: llmOpt,
      });

    if (!errors && prompts && updatedPrompt) {
      toast(`Saved the prompt "${_prompt.name}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setActiveDropdownId(null);
      setPrompts(
        prompts.map((item) => (item.id === _prompt.id ? updatedPrompt : item))
      );
      // setGptSysPrt(updatedPrompt.gptSysPrt || "");
      // setGptUserPrt(updatedPrompt.gptUserPrt || "");
      // setGptModel(updatedPrompt.gptModel || "gpt-4");
      // setGptTemp(updatedPrompt.gptTemp || 0.5);
      // setGptTopP(updatedPrompt.gptTopP || 0.9);
      // setGptMaxTokens(updatedPrompt.gptMaxTokens || 500);
      // setLlmOpt(updatedPrompt.llmOpt || "ChatGPT");
      dispatch(setAIEditorAction({ key: "gptSysPrt", value: updatedPrompt.gptSysPrt || "" }));
      dispatch(setAIEditorAction({ key: "gptUserPrt", value: updatedPrompt.gptUserPrt || "" }));
      dispatch(setAIEditorAction({ key: "gptModel", value: updatedPrompt.gptModel || "gpt-4" }));
      dispatch(setAIEditorAction({ key: "gptTemp", value: updatedPrompt.gptTemp || 0.5 }));
      dispatch(setAIEditorAction({ key: "gptTopP", value: updatedPrompt.gptTopP || 0.9 }));
      dispatch(setAIEditorAction({ key: "gptMaxTokens", value: updatedPrompt.gptMaxTokens || 500 }));
      dispatch(setAIEditorAction({ key: "llmOpt", value: updatedPrompt.llmOpt || "ChatGPT" }));
    }
  };

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const handleDoubleClick = (id: string) => {
    setActiveDropdownId(null); // Close any open dropdowns
    setIsEditing(true);
    setEditPrompt(id);
  };

  const handleSingleClick = async (_prompt: PromptType) => {
    // setGptMaxTokens(Number(_prompt.gptMaxTokens) || 500);
    // setGptTopP(Number(_prompt.gptTopP) || 1);
    // setGptTemp(Number(_prompt.gptTemp) || 1);
    // setGptModel(_prompt.gptModel ?? "gpt-4");
    // setGptSysPrt(_prompt.gptSysPrt ?? "");
    // setGptUserPrt(_prompt.gptUserPrt ?? "");
    // setLlmOpt(_prompt.llmOpt ?? "ChatGPT");
    // setSelectedPromptId(_prompt.id == selectedPromptId ? null : _prompt.id);
    dispatch(setAIEditorAction({ key: "gptSysPrt", value: _prompt.gptSysPrt ?? "" }));
    dispatch(setAIEditorAction({ key: "gptUserPrt", value: _prompt.id == selectedPromptId ? null : _prompt.id }));
    dispatch(setAIEditorAction({ key: "gptModel", value: _prompt.gptModel ?? "gpt-4" }));
    dispatch(setAIEditorAction({ key: "gptTemp", value: Number(_prompt.gptTemp) || 1 }));
    dispatch(setAIEditorAction({ key: "gptTopP", value: Number(_prompt.gptTopP) || 1 }));
    dispatch(setAIEditorAction({ key: "gptMaxTokens", value: Number(_prompt.gptMaxTokens) || 500 }));
    dispatch(setAIEditorAction({ key: "llmOpt", value: _prompt.llmOpt ?? "ChatGPT" }));
    setActiveDropdownId(null);

    if (_prompt.id == selectedPromptId) {
      // setGptSysPrt("");
      // setGptUserPrt("");
      // setGptModel("gpt-4");
      // setGptTemp(1);
      // setGptTopP(1);
      // setGptMaxTokens(500);
      // setLlmOpt("ChatGPT");
      dispatch(setAIEditorAction({ key: "gptSysPrt", value: "" }));
      dispatch(setAIEditorAction({ key: "gptUserPrt", value: "" }));
      dispatch(setAIEditorAction({ key: "gptModel", value: "gpt-4" }));
      dispatch(setAIEditorAction({ key: "gptTemp", value: 1 }));
      dispatch(setAIEditorAction({ key: "gptTopP", value: 1 }));
      dispatch(setAIEditorAction({ key: "gptMaxTokens", value: 500 }));
      dispatch(setAIEditorAction({ key: "llmOpt", value: "ChatGPT" }));
    }
  };

  const handleSaveName = async (id: string, newName: string) => {
    setIsEditing(false);
    setEditPrompt(null);
    const { errors, data: updatedPrompt } =
      await dataclient.models.Prompt.update({
        id,
        name: newName,
      });
    if (!errors && updatedPrompt && prompts) {
      setPrompts(
        prompts.map((promptItem) =>
          promptItem.id === id ? updatedPrompt : promptItem
        )
      );
    }
  };

  const handleKeyPress = async (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Enter" && inputRef.current) {
      handleSaveName(id, inputRef.current.value);
    }
  };

  const handleCopy = async (_prompt: PromptType) => {
    const newPrompt = {
      name: _prompt.name + "-Copy" + Date.now(),
      promptsetId: _prompt.promptsetId,
      gptSysPrt: _prompt.gptSysPrt,
      gptUserPrt: _prompt.gptUserPrt,
      gptModel: _prompt.gptModel,
      gptTemp: _prompt.gptTemp,
      gptTopP: _prompt.gptTopP,
      gptMaxTokens: _prompt.gptMaxTokens,
      llmOpt: _prompt.llmOpt,
    };

    const { errors, data: updatedPrompt } =
      await dataclient.models.Prompt.create(newPrompt);

    if (!errors && updatedPrompt) {
      toast(`Copied the prompt set "${updatedPrompt.name}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setPrompts([...prompts, updatedPrompt]);
    } else {
      alert("error!");
    }

    setNewPromptName("");
  };

  const handleDelete = async (id: string) => {
    if (selectedPromptSetId != null) {
      const { data: deletedPrompt, errors } =
        await dataclient.models.Prompt.delete({ id: id });
      if (!errors) {
        toast(`Successfully deleted.`, {
          style: {
            background: "rgb(14 158 183 / 79%)",
            color: "#fdfdfd",
          },
          duration: 3000,
          position: "bottom-center",
        });
        setPrompts(prompts.filter((_prompt) => _prompt.id !== id));
      }
    }
  };

  return (
    <>
      {/* Show/Hide Button */}
      <button
        onClick={toggleListVisibility}
        className={`rounded-full h-6 w-6 bg-gray-300 hover:bg-gray-500 hover:text-white text-black flex 
                        items-center justify-center shadow-lg transition-all 
                        z-10 top-0 mb-2 mr-auto
                        ${isPromptListVisible ? "left-0" : "left-[-48px]"}`}
        title="Show/Hide Prompts List"
      >
        {isPromptListVisible ? ">" : "<"}
      </button>
      {!isPromptListVisible && (
        <div
          className="[writing-mode:vertical-lr] font-bold text-sm cursor-pointer"
          onClick={toggleListVisibility}
        >
          PROMPTS
        </div>
      )}
      <div className={`mb-3 ${isPromptListVisible ? "w-full mx-auto" : "w-1"}`}>
        <div className={`transition-all w-full `}>
          {isPromptListVisible && (
            <>
              <h3 className="text-2x font-bold mb-4 text-center">Prompts</h3>
              {isSuperAdmin && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    placeholder="Enter prompt name"
                    className="border text-xs border-gray-300 rounded py-1 px-2 mr-2 mb-1"
                    disabled={selectedPromptSetId == null}
                  />
                  <button
                    onClick={handleAddPrompt}
                    className="text-xs bg-fomoyellow-500 text-gray-900 py-1 px-2 rounded hover:bg-gray-300 hover:text-black"
                    disabled={selectedPromptSetId == null}
                  >
                    Save Prompt
                  </button>
                </div>
              )}
              <ul className="list-none mt-3 text-sm" ref={promptRef}>
                {selectedPromptSetId &&
                  prompts.map(
                    (prompt) =>
                      prompt && (
                        <li
                          key={prompt.id}
                          onContextMenu={(event) =>
                            toggleDropdown(prompt.id, event)
                          }
                          onDoubleClick={() => handleDoubleClick(prompt.id)}
                          onClick={() => handleSingleClick(prompt)}
                          className={`rounded py-2 px-4 my-2 relative ${
                            selectedPromptId == prompt.id
                              ? "bg-gray-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {isEditing && prompt && editPrompt == prompt.id ? (
                            <input
                              ref={inputRef}
                              defaultValue={prompt.name ?? ""}
                              onKeyDown={(event) =>
                                handleKeyPress(event, prompt.id)
                              }
                              autoFocus
                              onBlur={() =>
                                handleSaveName(
                                  prompt.id,
                                  inputRef.current
                                    ? inputRef.current.value
                                    : prompt.name ?? ""
                                )
                              }
                              className="border border-gray-300 rounded py-1 px-2"
                            />
                          ) : (
                            <span>{prompt.name}</span>
                          )}
                          {activeDropdownId === prompt.id && isSuperAdmin && (
                            <div
                              className="absolute right-0 mt-2 w-32 shadow-lg bg-white rounded z-50"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: "100%",
                              }}
                            >
                              <ul className="list-none border border-gray-300">
                                <li
                                  className="py-1 px-4 hover:bg-gray-200"
                                  onClick={() => savePrompt(prompt)}
                                >
                                  Save
                                </li>
                                <li
                                  className="py-1 px-4 hover:bg-gray-200"
                                  onClick={() => handleCopy(prompt)}
                                >
                                  Copy
                                </li>
                                <li
                                  className="py-1 px-4 hover:bg-gray-200"
                                  onClick={() => handleDelete(prompt.id)}
                                >
                                  Delete
                                </li>
                              </ul>
                            </div>
                          )}
                        </li>
                      )
                  )}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PromptsList;
