"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/shadcn/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/shadcn/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@components/shadcn/ui/select";
import { Ellipsis, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { Badge } from "@components/shadcn/ui/badge";
import { Input } from "@components/shadcn/ui/input";
import { ShadPagination } from "@components/ui/ShadPagination";
import { sendGTMEvent } from "@next/third-parties/google";
import { segmentEvents } from "constants/segmentEvents";
import { useClient } from "contexts/ClientContext";
import { withCompanyAuthorization } from "contexts/withCompanyAuthorization";
import { analytics } from "hooks/useSegment";
import { useRouter } from "next/navigation";
import { ICompanyState, ITag, ITool } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { setToolAction } from "@redux/actions/companyAction";

const ToolsPage = () => {
  const router = useRouter();
  const client = useClient();
  const dispatch = useDispatch();

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany } = companyState;
  const companyId = selectedCompany?.id || null;
  
  const [tools, setTools] = useState<ITool[]>([]);
  const [selectKey, setSelectKey] = useState(+new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState<string>();
  const [tags, setTags] = useState<ITag[]>([]);

  /* pagination */
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(9);

  const handleViewHistoryClick = async (tool: ITool) => {
    dispatch(setToolAction(tool));
    router.push(
      `/companies/tools/threads`
    );
  };

  const handleToolClick = async (tool: ITool) => {
    sendGTMEvent({
      event: "tool_clicked",
      toolId: tool.id,
      toolName: tool.name || "Unknown",
      companyId: companyId,
      timestamp: new Date().toISOString(),
    });
    analytics.track(segmentEvents.TOOL_INITIATED, {
      companyId: companyId,
      toolId: tool.id,
      toolName: tool.name,
    });
    dispatch(setToolAction(tool));
    router.push(
      `/companies/tools/input`
    );
  };

  const filteredTools = useMemo(() => {
    if (!tools) {
      return [];
    }
    let filteredItems = tools?.filter((tool: ITool) => {
      if (searchQuery == "") return true;
      return (
        tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.toolDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // }
    });
    if (filterValue)
      filteredItems = filteredItems.filter((tool) => {
        const ownTagIds = tool.tags.map((tag) => tag.tagName);
        return ownTagIds.indexOf(filterValue) !== -1;
      });
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
    return filteredItems;
  }, [tools, searchQuery, filterValue]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const subTools = filteredTools?.slice(startIndex, endIndex);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTagChange = (value: string) => {
    setFilterValue(value);
  };

  useEffect(() => {
    if (!selectedCompany) {
      router.push("/companies");
    }
  }, [])

  useEffect(() => {
    const fetchAllTags = async () => {
      const { data: allTags, errors } = await client.models.Tag.list();
      if (errors) {
        return [];
      }
      setTags(allTags.map((tag) => ({ id: tag.id, tagName: tag.tagName! })));
    };
    fetchAllTags();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      const { data: availableTools, errors } = await client.models.Tool.list({
        filter: {
          status: {
            ne: "DRAFT",
          },
        },
        selectionSet: ['id', 'name', 'toolDescription', 'tags.tag.*', 'toolEndUserMessage', 'status', 'inputs', 'assistantId', 'userMessage', 'toolImageURL', 'toolAdditionalInstructions', 'toolFunctions', 'toolOptions', 'isFeatured', 'owners']
      });
      
      const customizedTools = availableTools.map((tool) => {
        return {
          ...tool,
          tags: tool.tags.map(tagData => ({ id: tagData.tag.id, tagName: tagData.tag.tagName }))
        } as ITool;
      });
      setTools(customizedTools);
    };

    fetchTools();
  }, []);

  const handlePageChange = (pN: number) => {
    setCurrentPage(pN);
  };

  useEffect(() => {
    sendGTMEvent({
      event: "all_tools_viewed",
      companyId: companyId,
      timestamp: new Date().toISOString(),
    });
  }, [companyId]);

  return (
    <Card className="bg-white p-6 m-6">
      <div>
        <h2 className="text-lg font-bold">AI Chat Tools</h2>
        <p className="font-wk pr-10 text-sm text-muted-foreground">
          Tailored, custom tools built for a specific task. We&apos;ve created and
          curated the best AI Chat Tools for marketing and business.
        </p>
      </div>
      <div className="flex flex-col mt-8 mb-8 gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8"
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-3 items-center">
          <Select key={selectKey} onValueChange={handleTagChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>All tags</SelectLabel>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.tagName}>
                    {tag.tagName.toUpperCase()}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <button
                  className="text-sm px-2 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                    setSelectKey(+new Date());
                    setFilterValue("");
                  }}
                >
                  Show all
                </button>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subTools?.map((tool, index) => (
            <Card
              key={index}
              className="relative hover:bg-gray-100 hover:cursor-pointer"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="absolute right-6 top-5">
                  <Ellipsis className="text-gray-500 hover:text-gray-700" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleViewHistoryClick(tool)}
                  >
                    History
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div onClick={() => handleToolClick(tool)}>
                <div className="mx-6 mt-6 flex items-center justify-start">
                  {tool.tags &&
                    tool.tags.map((tag) => {
                      return (
                        <Badge
                          key={`${tool.id}-${tag?.id}`}
                          className="bg-blue-50 text-blue-900 border-none mr-2"
                          variant={"outline"}
                        >
                          {tag?.tagName.toUpperCase()}
                        </Badge>
                      );
                    })}
                </div>
                <CardHeader className="pt-4">
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.toolDescription}</CardDescription>
                </CardHeader>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <ShadPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default withCompanyAuthorization(ToolsPage);
