"use client";

import { IAIEditorState } from "interfaces";
import { setAIEditorAction } from "@redux/actions/aieditorAction";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { /* AppContext ,*/ type PromptSetType } from "contexts/NovelEditorContext";
import { useUserGroups } from "contexts/UserGroupsContext";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const PromptSetList = ({
  isPromptSetVisible,
  setIsPromptSetVisible,
  setIsReportVisible,
  promptSets,
  setPromptSets,
  selectedPromptSetId,
  setSelectedPromptSetId,
}: {
  isPromptSetVisible: boolean;
  setIsPromptSetVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReportVisible: React.Dispatch<React.SetStateAction<boolean>>;
  promptSets: PromptSetType[];
  setPromptSets: React.Dispatch<React.SetStateAction<PromptSetType[]>>;
  selectedPromptSetId: string | null;
  setSelectedPromptSetId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPromptSetName, setNewPromptSetName] = useState<string>("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [editPromptSetId, setEditPromptSetId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const promptSetRef = useRef<HTMLUListElement>(null);
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { aiEditorData } = aiEditorState;
  const dispatch = useDispatch();
  const { gptArbVars } = aiEditorData;
  const dataclient = useClient();
  type Promptset = Schema["Promptset"];
  const { isSuperAdmin } = useUserGroups();
  useEffect(() => {
    // fetch all promptset
    const sub = dataclient.models.Promptset.observeQuery().subscribe({
      next: ({
        items,
        isSynced,
      }: {
        items: PromptSetType[];
        isSynced: boolean;
      }) => {
        setPromptSets(items);
      },
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        promptSetRef.current &&
        !promptSetRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null); // Close any open dropdowns
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
      sub.unsubscribe();
    };
  }, []);

  const toggleListVisibility = () => {
    if (!isPromptSetVisible) setIsReportVisible(false);
    setIsPromptSetVisible(!isPromptSetVisible);
  };

  const handleAddPromptSet = async () => {
    if (!newPromptSetName.trim()) return;

    const { errors, data: newPromptset } =
      await dataclient.models.Promptset.create({
        name: newPromptSetName,
      });

    if (!newPromptset) return;

    if (errors) {
    } else {
      toast(`Saved the prompt set "${newPromptSetName}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setPromptSets([...promptSets, newPromptset]);
    }

    setNewPromptSetName("");
  };

  const savePromptSet = async (_promptSet: PromptSetType) => {
    const _updatedPromptSet = {
      id: _promptSet.id,
      gptArbVars: JSON.stringify(gptArbVars),
    };
    const { data: updatedPromptSet, errors } =
      await dataclient.models.Promptset.update(_updatedPromptSet);
    if (!errors && updatedPromptSet) {
      toast(`Saved the prompt set "${updatedPromptSet.name}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setActiveDropdownId(null);
      setPromptSets(
        promptSets.map((item) =>
          item.id == selectedPromptSetId ? updatedPromptSet : item
        )
      );
      // setGptArbVars(JSON.parse(updatedPromptSet.gptArbVars as string));
      dispatch(setAIEditorAction({ key: "gptArbVars", value: JSON.parse(updatedPromptSet.gptArbVars as string) }))
      setSelectedPromptSetId(_promptSet.id);
    }
  };

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const handleDoubleClick = (id: string) => {
    setActiveDropdownId(null); // Close any open dropdowns
    setEditPromptSetId(id);
    setIsEditing(true);
  };

  const handleSingleClick = (_promptSet: PromptSetType) => {
    if (_promptSet.id != selectedPromptSetId) {
      const _gptArbVars = JSON.parse(_promptSet.gptArbVars as string);
      if (_promptSet.gptArbVars) /* setGptArbVars(_gptArbVars); */
        dispatch(setAIEditorAction({ key: "gptArbVars", value: _gptArbVars }))
    } else {
      // setGptArbVars({});
      dispatch(setAIEditorAction({ key: "gptArbVars", value: {} }))
    }

    setSelectedPromptSetId(
      _promptSet.id == selectedPromptSetId ? null : _promptSet.id
    );
    setActiveDropdownId(null);
  };

  const handleSaveName = async (id: string, newName: string) => {
    setIsEditing(false);
    setEditPromptSetId(null);
    const { data: updatedPromptSet, errors } =
      await dataclient.models.Promptset.update({
        id: id,
        name: newName,
      });
    if (!errors && updatedPromptSet) {
      setPromptSets(
        promptSets.map((set) => (set.id === id ? updatedPromptSet : set))
      );
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Enter" && inputRef.current) {
      handleSaveName(id, inputRef.current.value);
    }
  };
  const handleCopy = async (_promptSet: PromptSetType) => {
    const newPromptSet = {
      name: _promptSet.name + "-Copy" + Date.now(),
      gptArbVars: _promptSet.gptArbVars,
    };
    const { data: prompts } = await _promptSet.prompts();

    const { data: copyedPromptSet, errors } =
      await dataclient.models.Promptset.create(newPromptSet);
    if (!errors && copyedPromptSet) {
      prompts.map(async (prompt) => {
        const { data: copyedPrompt, errors: copyErrors } =
          await dataclient.models.Prompt.create({
            name: prompt.name,
            promptsetId: copyedPromptSet.id,
            gptSysPrt: prompt.gptSysPrt,
            gptUserPrt: prompt.gptUserPrt,
            gptModel: prompt.gptModel,
            gptTemp: prompt.gptTemp,
            gptTopP: prompt.gptTopP,
            gptMaxTokens: prompt.gptMaxTokens,
            llmOpt: prompt.llmOpt,
          });
      });

      toast(`Copied the prompt set "${copyedPromptSet.name}" successfully!`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setPromptSets([...promptSets, copyedPromptSet]);
    } else {
      alert("error!");
    }
    setNewPromptSetName("");
  };

  const handleDelete = async (_promptSet: PromptSetType) => {
    const { data: prompts } = await _promptSet.prompts();
    prompts.map(async (prompt) => {
      await dataclient.models.Prompt.delete({ id: prompt.id });
    });
    const { data: deletedPromptSet, errors } =
      await dataclient.models.Promptset.delete({ id: _promptSet.id });

    if (!errors) {
      toast(`Successfully deleted.`, {
        style: {
          background: "rgb(14 158 183 / 79%)",
          color: "#fdfdfd",
        },
        duration: 3000,
        position: "bottom-center",
      });
      setPromptSets(promptSets.filter((set) => set.id !== _promptSet.id));
    }
  };

  return (
    <>
      {/* Show/Hide Button */}
      <button
        onClick={toggleListVisibility}
        className={`rounded-full h-6 w-6 bg-gray-300 hover:bg-gray-500 hover:text-white text-black flex 
                        items-center justify-center shadow-lg transition-all 
                        z-10 top-0 mb-2 ml-auto
                        ${isPromptSetVisible ? "left-0" : "left-[-48px]"}`}
        title="Show/Hide Prompt Sets List"
      >
        {isPromptSetVisible ? "<" : ">"}
      </button>
      {!isPromptSetVisible && (
        <div
          className="[writing-mode:vertical-lr] font-bold text-sm cursor-pointer"
          onClick={toggleListVisibility}
        >
          PROMPTSETS
        </div>
      )}
      <div className={`mb-3 ${isPromptSetVisible ? "w-full mx-auto" : "w-1"}`}>
        <div className={`transition-all w-full `}>
          {isPromptSetVisible && (
            <>
              <h3 className="text-2x font-bold mb-4 text-center">Prompt Set</h3>
              {isSuperAdmin && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={newPromptSetName}
                    onChange={(e) => setNewPromptSetName(e.target.value)}
                    placeholder="Enter prompt set name"
                    className="ml-auto border text-xs border-gray-300 rounded py-1 px-2 mr-2 mb-1 bg-white"
                  />
                  <button
                    onClick={handleAddPromptSet}
                    className="ml-auto text-xs bg-fomoyellow-500 text-gray-900 py-1 px-2 rounded hover:bg-gray-500 hover:text-black"
                  >
                    Save Prompt Set
                  </button>
                </div>
              )}
              <ul
                className="list-none mt-3 text-sm font-mono"
                ref={promptSetRef}
              >
                {promptSets &&
                  promptSets.map((promptSet) => (
                    <li
                      key={promptSet.id}
                      onContextMenu={(event) =>
                        toggleDropdown(promptSet.id, event)
                      }
                      onDoubleClick={() => handleDoubleClick(promptSet.id)}
                      onClick={() => handleSingleClick(promptSet)}
                      className={`rounded py-2 px-4 my-2 relative  ${
                        selectedPromptSetId == promptSet.id
                          ? "bg-gray-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {isEditing &&
                      promptSet &&
                      editPromptSetId == promptSet.id ? (
                        <input
                          ref={inputRef}
                          defaultValue={promptSet.name ?? ""}
                          onKeyDown={(event) =>
                            handleKeyPress(event, promptSet.id)
                          }
                          autoFocus
                          onBlur={() =>
                            handleSaveName(
                              promptSet.id,
                              inputRef.current
                                ? inputRef.current.value
                                : promptSet.name ?? ""
                            )
                          }
                          className="border border-gray-300 rounded py-1 px-2"
                        />
                      ) : (
                        <span>{promptSet.name}</span>
                      )}
                      {activeDropdownId === promptSet.id && isSuperAdmin && (
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
                              className="py-1 px-4 hover:bg-gray-300"
                              onClick={() => savePromptSet(promptSet)}
                            >
                              Save
                            </li>
                            <li
                              className="py-1 px-4 hover:bg-gray-300"
                              onClick={() => handleCopy(promptSet)}
                            >
                              Copy
                            </li>
                            <li
                              className="py-1 px-4 hover:bg-gray-300"
                              onClick={() => handleDelete(promptSet)}
                            >
                              Delete
                            </li>
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PromptSetList;
