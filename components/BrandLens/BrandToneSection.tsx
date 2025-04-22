import { Card, CardDescription } from "@components/shadcn/ui/card";
import { SparklesIcon, X } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { defaultExtensions } from "@components/Novel/extensions";
import { slashCommand } from "@components/Novel/slash-command";
import { Button as ShadButton } from "@components/shadcn/ui/button";
import { Input as ShadInput } from "@components/shadcn/ui/input";
import { Label as ShadLabel } from "@components/shadcn/ui/label";
import { generateJSON } from "@tiptap/react";
import { marked } from "marked";
import SmartEditor from "@components/Novel/SmartEditor";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { ICompanyState } from "interfaces";
import { updateCompanyAction } from "@redux/actions/companyAction";

interface BrandToneSectionProps {
  isLoading: boolean;
  onGenerateTone: () => void;
}

const BrandToneSection = ({ isLoading, onGenerateTone }: BrandToneSectionProps) => {
    const dispatch = useDispatch();
    const companyState: ICompanyState = useSelector(selectCompanyState);
    const { selectedCompany: brandLens } = companyState;

    const [positiveKeywordInputVal, setPositiveKeywordInputVal] = React.useState<string>("");
    const [negativeKeywordInputVal, setNegativeKeywordInputVal] = React.useState<string>("");

    const positiveKeywordExamples = [
      "Friendly",
      "Inspirational",
      "Authoritative",
      "Playful",
      "Sophisticated",
      "Innovative",
      "Honest",
      "Energetic",
      "Relaxed",
      "Empathetic",
      "Bold",
      "Calm",
      "Educational",
      "Luxurious",
    ];

    const negativeKeywordExamples = [
      "Folksy",
      "Wordplay",
      "Casual",
      "Overly positive",
      "Boring",
      "Standard",
      "Neutral",
      "Mainstream",
      "Old school",
      "Provocative",
      "Pedantic",
      "Patronizing",
      "Childish",
      "Sloppy",
    ];

    const handleAddPositiveKeyword = () => {
      if (!brandLens) return;
      if (
        !brandLens.brandToneKeywords.use.includes(positiveKeywordInputVal) &&
        brandLens.brandToneKeywords.use.split(", ").length < 10 &&
        positiveKeywordInputVal.replace(/[^a-zA-Z\s]/g, "").trim().length > 0
      ) {
        const keywordsArray = brandLens.brandToneKeywords.use.split(", ");
        keywordsArray.push(positiveKeywordInputVal.toLowerCase());
        // console.log("updated keywords: ", brandLens.brandToneKeywords,  { ...brandLens.brandToneKeywords, use: keywordsArray.join(", ")});
        dispatch(
          updateCompanyAction({
            key: "brandToneKeywords",
            value: { ...brandLens.brandToneKeywords, use: keywordsArray.join(", ")}
          })
        );
        setPositiveKeywordInputVal("");
      }
    };

    const handleAddNegativeKeyword = () => {
      if (!brandLens) return;
      if (
        !brandLens.brandToneKeywords.avoid.includes(negativeKeywordInputVal) &&
        brandLens.brandToneKeywords.avoid.split(", ").length < 10 &&
        negativeKeywordInputVal.replace(/[^a-zA-Z\s]/g, "").trim().length > 0
      ) {
        const keywordsArray = brandLens.brandToneKeywords.avoid.split(", ");
        keywordsArray.push(negativeKeywordInputVal.toLowerCase());
        // console.log("updated keywords: ", brandLens.brandToneKeywords,  { ...brandLens.brandToneKeywords, avoid: keywordsArray.join(", ")});
        dispatch(
          updateCompanyAction({
            key: "brandToneKeywords",
            value: { ...brandLens.brandToneKeywords, avoid: keywordsArray.join(", ")},
          })
        );
        setNegativeKeywordInputVal("");
      }
    };

    const handleRemoveKeyword = (
      type: "positive" | "negative",
      keyword: string
    ) => {
      if (!brandLens) return;
      const key =
        type === "positive"
          ? "use"
          : "avoid";
      const keywordsArray = brandLens.brandToneKeywords[key].split(", ").filter((item: string) => item !== keyword);
      // console.log("removed keywords: ", brandLens.brandToneKeywords, { ...brandLens.brandToneKeywords, [key]: keywordsArray.join(", ")});
      dispatch(
        updateCompanyAction({
          key: "brandToneKeywords",
          value: { ...brandLens.brandToneKeywords, [key]: keywordsArray.join(", ")},
        })
      );
    };

    const convertMarkdownToJSON = (markdown: string) => {
      const htmlContent = marked(markdown);
      return generateJSON(htmlContent as string, [
        ...defaultExtensions,
        slashCommand,
      ]);
    };
    if (!brandLens) return (
      <p>Loading...</p>
    )
    return (
      <Card id="brand-tone" className="bg-white p-6 mb-5">
        <div>
          <div className="mb-8 max-w-[1025px]">
            <h3 className="text-base font-bold">Brand Tone of Voice</h3>
            <CardDescription>
              A brand tone of voice refers to the style and personality conveyed through a brands communication. 
              Provide some information about your company below to generate your brands specific tone of voice.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-5 md:flex-row">
            {/* Positive Keywords Section */}
            <div className="basis-1/2 flex flex-col gap-6">
              <p className="text-sm">
                Please provide at least 2 adjectives to <b>describe</b> your
                brands tone of voice.
              </p>
              <div>
                <div className="flex gap-2">
                  <ShadInput
                    id="positive-keyword-input"
                    placeholder={"E.g. enthusiastic"}
                    value={positiveKeywordInputVal}
                    className="bg-white color-black max-w-xl"
                    onChange={(event) => {
                      setPositiveKeywordInputVal(
                        event.target.value.replace(/[^a-zA-Z\s]/g, "")
                      );
                    }}
                  />
                  <ShadButton
                    id="add-positive-word"
                    onClick={handleAddPositiveKeyword}
                  >
                    Add
                  </ShadButton>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {brandLens.brandToneKeywords.use.split(", ").length}/10 keywords
                    selected
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 min-h-9">
                    {Array.isArray(brandLens.brandToneKeywords.use.split(", ")) &&
                      brandLens.brandToneKeywords.use.split(", ").map(
                        (keyword: string) => (
                          <div
                            className="inline-flex gap-1 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 pl-2.5 pr-4 py-2"
                            key={`${keyword}-selected`}
                          >
                            <button
                              className="hover:bg-gray-200 rounded-full p-0.5"
                              onClick={() =>
                                handleRemoveKeyword("positive", keyword)
                              }
                            >
                              <X height={"1rem"} width={"1rem"} />
                            </button>
                            {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                          </div>
                        )
                      )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm">Examples to get you started</p>
                <div className="flex flex-wrap gap-2">
                  {positiveKeywordExamples.map((keyword) => (
                    <ShadButton
                      key={`${keyword}-example`}
                      variant={"outline"}
                      disabled={brandLens.brandToneKeywords.use.split(", ").includes(
                        keyword.toLowerCase()
                      )}
                      onClick={() => {
                        if (brandLens && brandLens.brandToneKeywords.use.split(", ").length < 10) {
                          const keywordsArray = brandLens.brandToneKeywords.use.split(", ");
                          keywordsArray.push(keyword.toLowerCase());
                          dispatch(
                            updateCompanyAction({
                              key: "brandToneKeywords",
                              /* value: [
                                ...brandLens.selectedPositiveKeywords,
                                keyword.toLowerCase(),
                              ], */
                              value: {
                                ...brandLens.brandToneKeywords,
                                use: keywordsArray.join(", ")
                              }
                            })
                          );
                        }
                      }}
                    >
                      {keyword}
                    </ShadButton>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-l border-gray-300" />
            {/* Negative Keywords Section */}
            <div className="basis-1/2 flex flex-col gap-6">
              <p className="text-sm">
                Please provide at least 2 adjectives to <b>avoid</b> for your
                brands tone of voice.
              </p>
              <div>
                <div className="flex gap-2">
                  <ShadInput
                    id="negative-keyword-input"
                    placeholder={"E.g. passive"}
                    value={negativeKeywordInputVal}
                    className="bg-white color-black max-w-xl"
                    onChange={(event) => {
                      setNegativeKeywordInputVal(
                        event.target.value.replace(/[^a-zA-Z\s]/g, "")
                      );
                    }}
                  />
                  <ShadButton
                    id={"add-negative-word"}
                    onClick={handleAddNegativeKeyword}
                  >
                    Add
                  </ShadButton>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    {brandLens.brandToneKeywords.avoid.split(", ").length}/10 keywords
                    selected
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 min-h-9">
                    {Array.isArray(brandLens.brandToneKeywords.avoid.split(", ")) &&
                      brandLens.brandToneKeywords.avoid.split(", ").map(
                        (keyword: string) => (
                          <div
                            className="inline-flex gap-1 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-9 pl-2.5 pr-4 py-2"
                            key={`${keyword}-selected`}
                          >
                            <button
                              className="hover:bg-gray-200 rounded-full p-0.5"
                              onClick={() =>
                                handleRemoveKeyword("negative", keyword)
                              }
                            >
                              <X height={"1rem"} width={"1rem"} />
                            </button>
                            {keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                          </div>
                        )
                      )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm">Examples to get you started</p>
                <div className="flex flex-wrap gap-2">
                  {negativeKeywordExamples.map((keyword) => (
                    <ShadButton
                      key={`${keyword}-example`}
                      variant={"outline"}
                      disabled={brandLens.brandToneKeywords.avoid.split(", ").includes(
                        keyword.toLowerCase()
                      )}
                      onClick={() => {
                        if (brandLens && brandLens.brandToneKeywords.avoid.split(", ").length < 10) {
                          const keywordsArray = brandLens.brandToneKeywords.avoid.split(", ");
                          keywordsArray.push(keyword.toLowerCase());
                          dispatch(
                            updateCompanyAction({
                              key: "brandToneKeywords",
                              /* value: [
                                ...brandLens.selectedNegativeKeywords,
                                keyword.toLowerCase(),
                              ], */
                              value: {
                                ...brandLens.brandToneKeywords,
                                avoid: keywordsArray.join(", ")
                              }
                            })
                          );
                        }
                      }}
                    >
                      {keyword}
                    </ShadButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:gap-4 sm:justify-end sm:items-center">
            <p className="text-sm text-muted-foreground">
              Your companys AI-generated brand tone will appear below
            </p>
            <ShadButton
              id="save-generate-tone"
              onClick={onGenerateTone}
              className="flex items-center gap-1"
              disabled={
                isLoading ||
                !( 
                  brandLens &&
                  brandLens.brandToneKeywords.avoid.split(", ").length > 1 &&
                  brandLens.brandToneKeywords.avoid.split(", ").length > 1
                )
              }
            >
              <SparklesIcon height={16} width={16} />
              Generate Brand Tone
            </ShadButton>
          </div>
        </div>
        {brandLens.brandTone && (
          <div className="mt-8">
            <div className="mb-3">
              <div className="flex items-center gap-1.5">
                <SparklesIcon height={"1rem"} width={"1rem"} />
                <ShadLabel htmlFor="brand-tone">
                  AI-generated brand tone
                </ShadLabel>
              </div>
            </div>
            <SmartEditor
              fileContent={brandLens.brandTone || ""}
              setFileContent={
                (brandTone: string) =>{
                  dispatch(updateCompanyAction({
                    key: "brandTone",
                    value: brandTone
                  }))
                }
              }
              fileName="brandTone"
            />
            <div className="flex items-center gap-1.5 mt-3">
              <p className="text-sm text-muted-foreground">
                Edit with AI using the smart editor above. Highlight text or
                begin a new line to get started!
              </p>
            </div>
          </div>
        )}
      </Card>
    );
  }


// BrandToneSection.displayName = "BrandToneSection";

export default BrandToneSection;
