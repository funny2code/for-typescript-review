import * as mutations from "graphql/mutations";

import { Menu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Schema } from "amplify/data/resource";
import { useClient } from "contexts/ClientContext";
import moment from "moment";
import Link from "next/link";
import { classNames } from "utils/utils";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setEditToolByAdminAction } from "@redux/actions/companyAction";
import { ITool } from "interfaces";

const statuses = {
  ACTIVE: "text-green-700 bg-green ring-green-600/20",
  "In progress": "text-gray-700 bg-gray-50 ring-gray-500/10",
  DRAFT: "bg-yellow ring-yellow-600/20",
};

interface AdminToolListProps {
  tools?: ITool[];
  handleDeleteToolClick?: (id: string) => void;
  handleDisableToolClick?: (id: string) => void;
  handleCloneToolClick?: (id: string) => void;
}

const AdminToolList: React.FC<AdminToolListProps> = ({
  tools,
  handleDeleteToolClick,
  handleDisableToolClick,
  handleCloneToolClick,
}) => {
  const [toolsWithCreator, settoolsWithCreator] = React.useState<any[]>([]);
  const client = useClient();
  const router = useRouter();
  const dispatch = useDispatch();
  React.useEffect(() => {
    const fetchToolsWithCreator = async () => {
      const tool_formatted = await Promise.all(
        tools?.map(async (tool) => {
          if (!tool.owners) {
            return tool;
          }
          let indentifiedOwner;
          if (Array.isArray(tool.owners)) {
            indentifiedOwner = tool.owners[0];
          } else {
            indentifiedOwner = tool.owners;
          }

          const creatorMail = await getUserInfo(indentifiedOwner as string);
          return { ...tool, creatorMailId: creatorMail };
        }) || []
      );
      settoolsWithCreator(tool_formatted);
    };

    fetchToolsWithCreator();
  }, [tools]);

  async function getUserInfo(teamMemberId: string) {
    const variables = { userId: teamMemberId };
    try {
      const response = await client.graphql({
        query: mutations.getUserInfo,
        variables: variables,
      });
      return response.data.getUserInfo.email;
    } catch (error) {
      // console.error(error);
      // console.error("Error fetching user info");
      return "";
    }
  }

  return (
    <ul role="list" className="divide-y divide-gray-100">
      {toolsWithCreator &&
        toolsWithCreator.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {tool.name}
                </p>
                <p
                  className={classNames(
                    statuses[tool.status as keyof typeof statuses],
                    " rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                  )}
                >
                  {tool.status}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                <p className="whitespace-nowrap">
                  Created on{" "}
                  <time dateTime={tool.createdAt}>
                    {" "}
                    {moment(tool.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
                  </time>
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">
                  Created by:{" "}
                  {tool.creatorMailId !== ""
                    ? tool.creatorMailId
                    : "Creator Id not available"}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <button
                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                onClick={() => {
                  dispatch(setEditToolByAdminAction(tool));
                  router.push("/admin/tools/edit");
                }}
              >
                Edit tool<span className="sr-only">, {tool.name}</span>
              </button>
              <Menu as="div" className="relative flex-none">
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/admin/tools/${tool.id}/edit`}
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Edit<span className="sr-only">, {tool.name}</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() =>
                            handleCloneToolClick &&
                            handleCloneToolClick(tool.id)
                          }
                          className={classNames(
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Clone
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() =>
                            handleDisableToolClick &&
                            handleDisableToolClick(tool.id)
                          }
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          {tool.status === "ACTIVE" ? "Disable" : "Enable"}
                          <span className="sr-only">, {tool.name}</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() =>
                            handleDeleteToolClick &&
                            handleDeleteToolClick(tool.id)
                          }
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Delete
                          <span className="sr-only">, {tool.name}</span>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default AdminToolList;
