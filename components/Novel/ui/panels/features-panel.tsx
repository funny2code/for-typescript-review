"use client";

import { useContext, useEffect, useState } from "react";

// import { AppContext } from "contexts/NovelEditorContext";
import { useUserGroups } from "contexts/UserGroupsContext";
import { IAIEditorState } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { selectAIEditorState } from "@redux/reducers/aieditorReducer";
import { setAIEditorAction } from "@redux/actions/aieditorAction";

export default function FeaturesPanel({
  isFeatureVisible,
  setIsFeatureVisible,
  setIsReportVisible,
}: {
  isFeatureVisible: boolean;
  setIsFeatureVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReportVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const textVariablesLabels = [
    "{{text_hightlighted}}",
    "{{text_full}}",
    "{{text_to_insert}}",
  ];
  const [activePanel, setActivePanel] = useState(-1); // Initially no panel open
  const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
  const { aiEditorData } = aiEditorState;
  const {
    gptModel,
    gptTemp,
    gptArbVars,
    gptUserPrt,
    gptSysPrt,
    gptTopP,
    gptHighlight,
    gptMaxTokens,
    textFull,
    textToInsert,
    llmOpt,
  } = aiEditorData;
  const dispatch = useDispatch();
  const { isSuperAdmin } = useUserGroups();
  const [nkey, setNkey] = useState("");
  const [nvalue, setNvalue] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [form, setForm] = useState({ key: "", value: "" });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const editValue = ({ key, value }: { key: string; value: string }) => {
    setForm({ key, value });
    setSelectedItem(key);
    setIsEdit(true);
  };
  const handleBlur = (e: any) => {
    const { key, value } = form;
    // setGptArbVars({ ...gptArbVars, [key]: value });

    setForm({ key: "", value: "" });
    setIsEdit(false);
  };
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      const { key, value } = form;
      // setGptArbVars({ ...gptArbVars, [key]: value });
      dispatch(setAIEditorAction({ key: "gptArbVars", value: { ...gptArbVars, [key]: value } }));
      setForm({ key: "", value: "" });
      setIsEdit(false);
      return;
    }
  };
  const handleEdit = (e: any) => {
    setForm({ key: form.key, value: e.target.value });
  };
  const handleTempChange = (e: any) => {
    // setGptTemp(parseFloat(e.target.value));
    dispatch(setAIEditorAction({ key: "gptTemp", value: e.target.value }));
  };
  const handleModelChange = (e: any) => {
    // setGptModel(e.target.value);
    dispatch(setAIEditorAction({ key: "gptModel", value: e.target.value }));
  };
  const handleClick = (panelIndex: number) => {
    setActivePanel(panelIndex === activePanel ? -1 : panelIndex);
  };
  const handleTopPChange = (e: any) => {
    // setGptTopP(parseFloat(e.target.value));
    dispatch(setAIEditorAction({ key: "gptTopP", value: e.target.value }));
  };
  const handleMaxTokensChange = (e: any) => {
    // setGptMaxTokens(parseFloat(e.target.value));
    dispatch(setAIEditorAction({ key: "gptMaxTokens", value: e.target.value }));
  };
  const handleUserChange = (e: any) => {
    // setGptUserPrt(e.target.value);
    dispatch(setAIEditorAction({ key: "gptUserPrt", value: e.target.value }));
  };
  const handleSystemChange = (e: any) => {
    // setGptSysPrt(e.target.value);
    dispatch(setAIEditorAction({ key: "gptSysPrt", value: e.target.value }));
  };

  const handleHighlight = (e: any) => {
    // setGptHighlight(e.target.value);
    dispatch(setAIEditorAction({ key: "gptHighlight", value: e.target.value }));
  };

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    if (id == "key") {
      setNkey(value);
    } else if (id == "value") {
      setNvalue(value);
    }
  };

  const handleAdd = () => {
    // Add the new key-value pair to the state
    // setGptArbVars({ ...gptArbVars, [nkey]: nvalue });
    dispatch(setAIEditorAction({ key: "gptArbVars", value: { ...gptArbVars, [nkey]: nvalue } }));

    // Clear the inputs for the next entry
    setNvalue("");
    setNkey("");
  };

  const handleRemove = (keyToRemove: string) => {
    const { [keyToRemove]: _, ...rest } = gptArbVars;
    // setGptArbVars(rest);
    dispatch(setAIEditorAction({ key: "gptArbVars", value: rest }));
  };

  const handleLLMChange = (e: any) => {
    // setLlmOpt(e.target.value);
    dispatch(setAIEditorAction({ key: "llmOpt", value: e.target.value }));
    // Set default model
    // setGptModel(
    //   e.target.value == "ChatGPT"
    //     ? "gpt-4"
    //     : e.target.value == "Gemini"
    //     ? "gemini-1.0-pro"
    //     : "claude-3-opus-20240229"
    // );
    dispatch(setAIEditorAction({ 
      key: "gptModel", 
      value: e.target.value == "ChatGPT"
      ? "gpt-4"
      : e.target.value == "Gemini"
      ? "gemini-1.0-pro"
      : "claude-3-opus-20240229" }))
  };

  const toggleListVisibility = () => {
    if (!isFeatureVisible) setIsReportVisible(false);
    setIsFeatureVisible(!isFeatureVisible);
  };

  return (
    <div>
      {/* Show/Hide Button */}
      <button
        onClick={toggleListVisibility}
        className={`rounded-full h-6 w-6 bg-gray-300 hover:bg-gray-500 hover:text-white text-black flex 
                            items-center justify-center shadow-lg transition-all 
                            z-10 top-0 mb-2 mr-auto
                            ${isFeatureVisible ? "left-0" : "left-[-48px]"}`}
        title="Show/Hide Variabes Panel"
      >
        {isFeatureVisible ? ">" : "<"}
      </button>
      {!isFeatureVisible && (
        <div
          className="[writing-mode:vertical-lr] text-sm font-bold pb-3 cursor-pointer"
          onClick={toggleListVisibility}
        >
          VARIABLES
        </div>
      )}
      <div
        className={`mb-3 ${
          isFeatureVisible ? "w-full container mx-auto" : "hidden"
        }`}
      >
        <h3 className="text-2x font-bold mb-4 px-2 text-center">
          Modify Prompts
        </h3>
        <div className="accordion border-b border-gray-300">
          {["Prompt Variables", "Text Variables", "Additional Variables"].map(
            (title, index) => (
              <div key={index} className="accordion-item">
                <span className="accordion-header border-t border-gray-300 text-base">
                  <button
                    className={`flex items-center justify-between w-full p-4 font-medium text-left text-gray-700 hover:text-gray-500 focus:outline-none ${
                      activePanel === index ? "text-blue-500" : "" // Add styling for active panel
                    }`}
                    onClick={() => handleClick(index)}
                  >
                    {title}
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {activePanel == index ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M 15 12 l -7 -7 l -7 7"
                        ></path>
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M 15 5 l -7 7 l -7 -7"
                        ></path>
                      )}
                    </svg>
                  </button>
                </span>
                <div
                  className={`accordion-content border-t border-gray-300 ${
                    activePanel === index ? "" : "hidden" // Show/hide based on active state
                  }`}
                >
                  {index == 0 ? (
                    <div className="p-4 border border-gray-300 rounded">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="system"
                            className="text-gray-700 font-medium"
                          >
                            System:
                          </label>
                          <textarea
                            id="system"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptSysPrt}
                            onChange={handleSystemChange}
                            rows={5}
                            style={{ height: 100 }}
                          />
                        </div>

                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="user"
                            className="text-gray-700 font-medium"
                          >
                            User:
                          </label>
                          <textarea
                            id="user"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptUserPrt}
                            onChange={handleUserChange}
                            rows={5}
                            style={{ height: 100 }}
                          />
                        </div>

                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="temp"
                            className="text-gray-700 font-medium"
                          >
                            Temp:
                          </label>
                          <input
                            id="temp"
                            type="number"
                            step={0.1}
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptTemp}
                            onChange={handleTempChange}
                          />
                          <label
                            htmlFor="top_p"
                            className="text-gray-700 font-medium"
                          >
                            Top p:
                          </label>
                          <input
                            id="top_p"
                            type="number"
                            step={1}
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptTopP}
                            onChange={handleTopPChange}
                          />
                          <label
                            htmlFor="max_tokens"
                            className="text-gray-700 font-medium"
                          >
                            Max Tokens:
                          </label>
                          <input
                            id="max_tokens"
                            type="number"
                            step={1}
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptMaxTokens}
                            onChange={handleMaxTokensChange}
                          />
                        </div>

                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="llmOpt"
                            className="col-span-3 text-xs"
                          >
                            Chat Models:
                          </label>
                          <select
                            id="llmOpt"
                            className="col-span-6 h-6 border border-gray-300 px-2 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={llmOpt}
                            onChange={handleLLMChange}
                          >
                            <option value="ChatGPT">ChatGPT</option>
                            <option value="Gemini">Gemini</option>
                            <option value="Anthropic">Anthropic</option>
                          </select>
                        </div>
                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="model"
                            className="text-gray-700 font-medium"
                          >
                            Model:
                          </label>
                          <select
                            id="model"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptModel}
                            onChange={handleModelChange}
                          >
                            {llmOpt == "ChatGPT" ? (
                              <>
                                <option value="gpt-3.5-turbo">
                                  gpt-3.5-turbo
                                </option>
                                <option value="gpt-4">gpt-4</option>
                                <option value="gpt-4-turbo-preview">
                                  gpt-4-turbo-preview
                                </option>
                              </>
                            ) : llmOpt == "Gemini" ? (
                              <>
                                <option value="gemini-1.0-pro">
                                  gemini-1.0-pro
                                </option>
                                <option value="gemini-1.0-pro-latest">
                                  gemini-1.0-pro-latest
                                </option>
                              </>
                            ) : (
                              <>
                                <option value="claude-3-opus-20240229">
                                  claude-3-opus-20240229
                                </option>
                                <option value="claude-3-sonnet-20240229">
                                  claude-3-sonnet-20240229
                                </option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : index == 1 ? (
                    <div className="p-4 border border-gray-300 rounded">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="highlight"
                            className="text-gray-700 font-medium"
                          >
                            {textVariablesLabels[0]}
                          </label>
                          <textarea
                            id="highlight"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={gptHighlight}
                            onChange={handleHighlight}
                            rows={3}
                            style={{ height: 60 }}
                          />
                        </div>
                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="text_full"
                            className="text-gray-700 font-medium"
                          >
                            {textVariablesLabels[1]}
                          </label>
                          <textarea
                            id="text_full"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={textFull}
                            onChange={() => {}}
                            rows={3}
                            style={{ height: 80 }}
                          />
                        </div>
                        <div className="grid items-center col-span-12">
                          <label
                            htmlFor="text_to_insert"
                            className="text-gray-700 font-medium"
                          >
                            {textVariablesLabels[2]}
                          </label>
                          <textarea
                            id="text_to_insert"
                            className="col-span-6 h-6 border border-gray-300 px-3 rounded focus:ring-blue-500 focus:border-blue-500 text-xs"
                            value={textToInsert}
                            onChange={() => {}}
                            rows={3}
                            style={{ height: 70 }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col p-4 border border-gray-300 rounded">
                      {isSuperAdmin && (
                        <div className="flex items-start mb-4">
                          <input
                            type="text"
                            id="key"
                            placeholder="Key"
                            className="w-full mr-4 px-2 py-1 border rounded-md focus:outline-none text-xs"
                            value={nkey}
                            onChange={handleInputChange}
                          />
                          <textarea
                            id="value"
                            placeholder="Value"
                            className="w-full px-2 py-1 border rounded-md focus:outline-none text-xs"
                            value={nvalue}
                            onChange={handleInputChange}
                            style={{ height: 25 }}
                          />
                          <button
                            onClick={handleAdd}
                            className="px-2 py-1 bg-fomoblue-300 ml-2 text-white rounded-full hover:bg-fomoyellow-500 text-xs"
                          >
                            {" "}
                            +{" "}
                          </button>
                        </div>
                      )}

                      <ul className="list-disc">
                        {Object.entries(gptArbVars).map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2 py-1">
                            <span className="w-1/5 text-xs">{key}</span>
                            {isEdit && selectedItem == key ? (
                              <textarea
                                id={key}
                                className="w-4/5 text-xs border"
                                value={form.value}
                                onChange={handleEdit}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                              />
                            ) : (
                              <span
                                className="w-4/5 text-xs"
                                onDoubleClick={() => editValue({ key, value })}
                              >
                                {value}
                              </span>
                            )}
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleRemove(key)}
                                className="px-2 py-1 bg-fomored-500 text-white rounded-full hover:bg-red-700 text-xs"
                              >
                                {" "}
                                -{" "}
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
