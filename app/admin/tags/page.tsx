"use client";

import { Button, ButtonGroup } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useState } from "react";

import AdminToolList from "@components/AdminToolList";
import { PageHeading } from "@components/ui/PageHeading";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";
import { Badge } from "@components/shadcn/ui/badge";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/shadcn/ui/table";
import { IConfirmDialog } from "interfaces";
import ConfirmDialog from "@components/ui/ConfirmDialog";

type Tag = Schema["Tag"]["type"];
type CustomTag = {
    id: string;
    tagName: string;
    tools: {
        id: string;
        toolName: string;
        toolTagId: string;
    }[];
}

const TagsPage = () => {
  const [tags, setTags] = useState<CustomTag[]>();
  const { isSuperAdmin } = useUserGroups();

  const client = useClient();
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);
  const fetchTags = async () => {
    const { data: all_tags, errors } = await client.models.Tag.list();
    if (errors) return [];
    const customizedTags = await Promise.all(all_tags.map(async tag => {
        const { data: tool_tags, errors: tool_tag_errors } = await tag.tools();
        const tools = await Promise.all(tool_tags.map(async tool_tag => {
            const { data: tool, errors: toolErrors } = await tool_tag.tool();
            return {
                id: tool?.id,
                toolName: tool?.name,
                toolTagId: tool_tag.id
            }
        }));
        return {
            id: tag.id,
            tagName: tag.tagName,
            tools: tools
        } as CustomTag;
    }));
    setTags(customizedTags);
  }
  useEffect(() => {
    fetchTags();
  }, [client]);

  if (!isSuperAdmin) {
    return <PageHeading title="No Access" />;
  }

  const removeTag = async (tag: CustomTag) => {
    setShowMessage({
        open: true,
        title: "Deleting a tag",
        content: `Would you like to remove this tag - ${tag.tagName}?`,
        isConfirm: true,
        handleConfirm: async () => {
            tag.tools.forEach(async tool => {
                await client.models.ToolTag.delete({id: tool.toolTagId});
            });
            await client.models.Tag.delete({id: tag.id});
            const updatedTags = tags?.filter(item => item.id != tag.id);
            setTags(updatedTags);
        }
    });
  }

  return (
    <div className="p-20">
        <Table>
            <TableCaption>A list of all exiting tags.</TableCaption>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Tag Name</TableHead>
                    <TableHead>Connected Tools</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {tags?.map(tag => (
                    <TableRow key={tag.id}>
                        <TableCell className="font-medium">{tag.tagName.toUpperCase()}</TableCell>
                        <TableCell>
                            {tag.tools.map(tool => {
                                return (
                                    <Badge
                                        key={`${tool.id}-${tag?.id}`}
                                        className="bg-blue-50 text-blue-900 border-none mr-2"
                                        variant={"outline"}
                                    >
                                        {tool?.toolName.toUpperCase()}
                                    </Badge>
                                )
                            })}
                        </TableCell>
                        <TableCell className="text-right">
                            <button
                                className="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-blue-gray-500 transition-all hover:bg-blue-gray-500/10 active:bg-blue-gray-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                type="button"
                                onClick={() => removeTag(tag)}
                            >
                                <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fill-rule="evenodd"
                                    d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                                    clip-rule="evenodd"></path>
                                </svg>
                                </span>
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {showMessage && 
            <ConfirmDialog 
                open = {showMessage.open}
                title = {showMessage.title}
                content = {showMessage.content}
                handleClose = {() => { setShowMessage(null); }}
                isConfirm = {showMessage.isConfirm}
                handleConfirm={() => showMessage.handleConfirm()}
            />
        }
    </div>
    
  );
};

export default TagsPage;
