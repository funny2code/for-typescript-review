"use client";

import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Heading,
  Image,
  Tabs,
  Text,
  TextAreaField,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import {
  ChevronDoubleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@components/shadcn/ui/resizeable";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { DndContext } from "@dnd-kit/core";
import GoogleDriveIntegration from "@components/BrandLens/GoogleDriveIntegration";
import { ICompanyState } from "interfaces";
import { Schema } from "amplify/data/resource";
import SmartEditor from "@components/Novel/SmartEditor";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { withGroupAccess } from "contexts/withGroupAccess";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";

type Company = Schema["Company"]["type"];
type Product = Schema["Product"]["type"];
type Keyword = Schema["Keyword"]["type"];
type Draft = Schema["Draft"]["type"];
type Section = Schema["Section"]["type"] & {
  draftId: string;
  type: string;
  template: string;
  title: string;
  order: number;
  keyword: string;
  keyTakeaways: string;
  summaryOnSite: string;
  summaryOffSite: string;
  writtenContent: string;
  finalMarkdownContent: string;
  content: string;
  status: string;
};

const ContentEngineProductKeywordDraftPage = ({
  params,
}: {
  params: {
    companyId: string;
    productId: string;
    keywordId: string;
    draftId: string;
  };
}) => {
  const router = useRouter();
  const client = useClient();
  const dispatch = useDispatch();
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany, selectedProduct } = companyState;
  const { keywordId, draftId } = params;
  const companyId = selectedCompany?.id;
  const productId = selectedProduct?.id;
  const [company, setCompany] = useState<Company>();
  const [product, setProduct] = useState<Product>();
  const [keyword, setKeyword] = useState<Keyword>();
  const [sections, setSections] = useState<Section[]>([]);
  const [draft, setDraft] = useState<Draft>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [signedInUser, setSignedInUser] = useState<any>();
  const [combinedContent, setCombinedContent] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const updateSection = async (
    sectionId: string,
    updatedData: Partial<Section>
  ) => {
    setIsLoading(true);
    try {
      const { data, errors } = await client.models.Section.update({
        id: sectionId,
        ...updatedData,
      });
      if (errors) throw new Error(errors[0].message);
      console.log("Section updated:", data);
      setEditingSectionId(null);
    } catch (err) {
      setError("Failed to update section. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSection = async (sectionId: string) => {
    // Implement section generation logic here
    console.log(`Generating section ${sectionId}`);
    try {
      const { data, errors } =
        await client.mutations.initContentEngineOutlineSectionGen({
          sectionIds: [sectionId],
        });
      if (errors) throw new Error(errors[0].message);
      console.log("Pre-writing generated:", data);
      // Here you might want to update the keyword state or refetch it
    } catch (err) {
      setError("Failed to generate pre-writing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMetadata = async () => {
    setIsLoading(true);

    try {
      const { data, errors } = await client.mutations.generateContentEngine({
        keywordIds: [keywordId],
      });
      if (errors) throw new Error(errors[0].message);
      console.log("Metadata generated:", data);
      // Here you might want to update the keyword state or refetch it
    } catch (err) {
      setError("Failed to generate metadata. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCombinedWrittenContent = useCallback(() => {
    return sections
      .map(
        (section, index) =>
          `Section ${index + 1}: \n\n${
            section.writtenContent || "No content yet"
          }${
            section.finalMarkdownContent &&
            section.finalMarkdownContent !== "test"
              ? `\n\n![alt text](${section.finalMarkdownContent})`
              : ""
          }`
      )
      .join("\n\n");
  }, [sections]);

  const generateAllSections = async () => {
    setIsLoading(true);
    try {
      const sectionIds = sections.map((section) => section.id);
      const { data, errors } =
        await client.mutations.initContentEngineOutlineSectionGen({
          sectionIds: sectionIds,
        });
      if (errors) throw new Error(errors[0].message);
      console.log("All sections generated:", data);
      // You might want to refetch the sections or update their state here
    } catch (err) {
      setError("Failed to generate all sections. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "not started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const approveDraft = async () => {
    setIsLoading(true);
    console.log("draft status", draft?.status);
    console.log("keyword status", keyword?.status);
    try {
      const { data, errors } = await client.models.Draft.update({
        id: draftId,
        status: "approved",
      });
      if (errors) throw new Error(errors[0].message);
      console.log("Draft approved:", data);

      if (data) {
        // Update the draft state with the approved status
        const { data: udpatedKeyword, errors: keywordErrors } =
          await client.models.Keyword.update({
            id: keywordId,
            draftApproved: true,
            outlineResultApproved: true,
            draftGenerated: true,
            status: "DRAFT APPROVED",
          });
        console.log("Keyword updated:", udpatedKeyword);
        router.push(`/companies/content-engine/product/keyword/${keywordId}`);
      }
      // You might want to refetch the draft or update its state here
    } catch (err) {
      setError("Failed to approve draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    setIsLoading(true);
    try {
      // Delete the section
      await client.models.Section.delete({ id: sectionId });

      // Update the order of remaining sections
      const updatedSections = sections.filter((s) => s.id !== sectionId);
      for (let i = 0; i < updatedSections.length; i++) {
        await client.models.Section.update({
          id: updatedSections[i].id,
          order: i + 1,
        });
      }

      // Refresh the sections
      setSections(updatedSections);
    } catch (err) {
      setError("Failed to delete section. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch company data
        const { data: companyData } = await client.models.Company.get({
          id: companyId as string,
        });
        setCompany(companyData as Company);

        // Fetch product data
        const { data: productData } = await client.models.Product.get({
          id: productId as string,
        });
        setProduct(productData as Product);

        // Fetch keyword data
        const { data: keywordData } = await client.models.Keyword.get({
          id: keywordId,
        });
        setKeyword(keywordData as Keyword);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    };

    fetchRelatedData();

    const draftSub = client.models.Draft.observeQuery({
      filter: {
        id: { eq: draftId },
      },
    }).subscribe({
      next: async ({ items, isSynced }) => {
        console.log("Draft fetched:", items);
        if (isSynced) {
          if (items.length) {
            console.log("Draft fetched:", items[0]);
            setDraft(items[0] as Draft);
            const { data: sectionsData } = await items[0].sections();
            console.log("Sections fetched:", sectionsData);
            if (sectionsData) {
              const sortedSections = [...sectionsData].sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0)
              );
              setSections(sortedSections as Section[]);
            }
            const newCombinedContent = getCombinedWrittenContent();
            setCombinedContent(newCombinedContent);
            setIsLoading(false);
          } else {
            setError("Draft not found");
            setIsLoading(false);
          }
        }
      },
      error: (err) => {
        console.error("Observation error:", err);
        setError("Error observing draft");
        setIsLoading(false);
      },
    });

    const sectionSub = client.models.Section.observeQuery({
      filter: {
        draftId: { eq: draftId },
      },
    }).subscribe({
      next: ({ items, isSynced }) => {
        if (isSynced) {
          console.log("Sections updated:", items);
          const sortedSections = [...items].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          setSections(sortedSections as Section[]);
        }
      },
      error: (err) => {
        console.error("Section observation error:", err);
        setError("Error observing sections");
      },
    });

    return () => {
      draftSub.unsubscribe();
      sectionSub.unsubscribe();
    };
  }, [client.models, companyId, productId, keywordId, draftId]);

  useEffect(() => {
    if (!isEditingContent) {
      const newCombinedContent = getCombinedWrittenContent();
      setCombinedContent(newCombinedContent);
    }
  }, [getCombinedWrittenContent, isEditingContent]);

  if (isLoading || !draft || !company || !product || !keyword) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="text-xl font-semibold text-gray-600">
          Loading draft...
        </Text>
      </View>
    );
  }

  if (error || !draft || !company || !product || !keyword) {
    return (
      <View className="flex items-center justify-center h-screen">
        <Text className="text-xl font-semibold text-red-600">
          Error: {error || "Required data not found"}
        </Text>
      </View>
    );
  }

  return (
    <DndContext>
      <Card className=" mx-auto p-8 bg-white shadow-xl rounded-lg">
        <Flex direction="column" gap="2rem">
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading level={2} className="text-4xl font-bold text-gray-800">
              {draft.title}
            </Heading>
            <Flex gap="1rem">
              <Button
                onClick={() => {
                  approveDraft();
                }}
                className="flex items-center"
              >
                <ClipboardIcon className="h-5 w-5 mr-2" />
                Approve
              </Button>
              {/* back button */}
              <Button
                onClick={() => {
                  router.push(
                    `/company/${companyId}/content-engine/${productId}/keyword/${keywordId}`
                  );
                }}
                className="flex items-center"
              >
                <ChevronDoubleLeftIcon className="h-5 w-5 mr-2" />
                Back
              </Button>
            </Flex>
          </Flex>

          <Divider />

          <View>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel>
                <View className="mt-8 p-4">
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    className="mb-4 p-4"
                  >
                    <Heading level={3} className="text-2xl font-semibold">
                      Sections
                    </Heading>
                    <Button
                      onClick={generateAllSections}
                      isLoading={isLoading}
                      loadingText="Generating..."
                      className="ml-4"
                      size="small"
                    >
                      Generate All Sections
                    </Button>
                  </Flex>
                  {sections.length > 0 ? (
                    sections.map((section, index) => (
                      <Card
                        key={section.id}
                        className="mb-6 p-4 last:mb-0 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Flex
                          direction="column"
                          gap="1rem"
                          className="mb-4 p-4"
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            className="cursor-pointerp-4"
                            onClick={() => toggleSectionExpansion(section.id)}
                          >
                            <Flex alignItems="center" gap="2">
                              <Badge
                                className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                                  section.status ?? "Not Started"
                                )}`}
                              >
                                {section.status ?? "Not Started"}
                              </Badge>
                              <Badge
                                className={`px-2 py-1 rounded-full text-sm`}
                              >
                                {section.type ?? "NA"}
                              </Badge>
                              <Heading
                                level={5}
                                className="text-lg font-semibold"
                              >
                                Section {index + 1}: {section.title}
                              </Heading>
                            </Flex>
                            <Flex alignItems="center" gap="2">
                              <Badge
                                className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                                  section.type ?? ""
                                )}`}
                              >
                                {section.type}
                              </Badge>
                              <Button
                                onClick={() => deleteSection(section.id)}
                                isLoading={isLoading}
                                loadingText="Deleting..."
                                size="small"
                                variation="destructive"
                              >
                                Delete
                              </Button>
                              {expandedSections.includes(section.id) ? (
                                <ChevronUpIcon className="h-5 w-5" />
                              ) : (
                                <ChevronDownIcon className="h-5 w-5" />
                              )}
                            </Flex>
                          </Flex>
                          {expandedSections.includes(section.id) && (
                            <Tabs.Container defaultValue="main-info">
                              <Tabs.List>
                                <Tabs.Item value="main-info">
                                  Main Info
                                </Tabs.Item>
                                <Tabs.Item value="additional-info">
                                  Additional Info
                                </Tabs.Item>
                                <Tabs.Item value="content">Content</Tabs.Item>
                              </Tabs.List>
                              <Tabs.Panel value="main-info">
                                <Flex
                                  direction="column"
                                  gap="1rem"
                                  className="mt-4"
                                >
                                  <TextField
                                    label="Title"
                                    value={section.title ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextField
                                    label="Keyword"
                                    value={section.keyword ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextAreaField
                                    label="Key Takeaways"
                                    value={section.keyTakeaways ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextField
                                    label="Type"
                                    value={section.type ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextField
                                    label="Template"
                                    value={section.template ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextField
                                    label="Status"
                                    value={section.status ?? "Not Started"}
                                    isReadOnly={!isEditing}
                                  />
                                  <Button
                                    onClick={() => generateSection(section.id)}
                                    isLoading={isLoading}
                                    loadingText="Generating..."
                                    className="mt-2"
                                  >
                                    Generate
                                  </Button>
                                </Flex>
                              </Tabs.Panel>
                              <Tabs.Panel value="additional-info">
                                <Flex
                                  direction="column"
                                  gap="1rem"
                                  className="mt-4"
                                >
                                  <TextField
                                    label="Draft ID"
                                    value={section.draftId ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextField
                                    label="Order"
                                    value={section.order?.toString() ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                </Flex>
                              </Tabs.Panel>
                              <Tabs.Panel value="content">
                                <Flex
                                  direction="column"
                                  gap="1rem"
                                  className="mt-4"
                                >
                                  <TextAreaField
                                    label="Summary On-Site"
                                    value={section.summaryOnSite ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextAreaField
                                    label="Summary Off-Site"
                                    value={section.summaryOffSite ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextAreaField
                                    label="Written Content"
                                    value={section.writtenContent ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextAreaField
                                    label="Final Markdown Content"
                                    value={section.finalMarkdownContent ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <TextAreaField
                                    label="Content"
                                    value={section.content ?? ""}
                                    isReadOnly={!isEditing}
                                  />
                                  <h1>IMage</h1>
                                  <Image
                                    src={section.finalMarkdownContent ?? ""}
                                    alt="Fomo.ai"
                                    className="h-auto w-auto max-w-64 p-6"
                                  />
                                </Flex>
                              </Tabs.Panel>
                            </Tabs.Container>
                          )}
                        </Flex>
                      </Card>
                    ))
                  ) : (
                    <Text className="text-gray-600 italic">
                      No sections found for this draft.
                    </Text>
                  )}
                </View>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <View className="mt-8 p-4">
                  <Heading level={3} className="text-2xl font-semibold mb-4">
                    Content Preview
                  </Heading>
                  <Card>
                    <SmartEditor
                      fileContent={combinedContent}
                      fileName="combined-written-content"
                      setFileContent={(param: string) => {}}
                    />
                    <TextAreaField
                      label="Preview"
                      value={getCombinedWrittenContent()}
                      isReadOnly={true}
                      className="w-full"
                      rows={100}
                    />
                  </Card>
                </View>
              </ResizablePanel>
            </ResizablePanelGroup>
          </View>
          <Divider />
          {/* <Flex className="mt-4 sticky">
            <ButtonGroup>
              {draft.status !== "approved" ? (
                <Button
                  onClick={() => {
                    approveDraft();
                  }}
                  className="flex items-center"
                >
                  <ClipboardIcon className="h-5 w-5 mr-2" />
                  Approve Draft
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    generateMetadata();
                  }}
                  className="flex items-center"
                >
                  <ClipboardIcon className="h-5 w-5 mr-2" />
                  Generate Metadata
                </Button>
              )}
            </ButtonGroup>
          </Flex> */}
          <Divider />
          <Flex className="mt-4 sticky">
            <GoogleDriveIntegration
              getCombinedWrittenContent={getCombinedWrittenContent}
              title={draft.title as string}
              draftId={draft.id as string}
            />
          </Flex>
        </Flex>
      </Card>
    </DndContext>
  );
};

export default withGroupAccess(ContentEngineProductKeywordDraftPage, [
  "superAdmin",
  "companyAdmin",
]);
