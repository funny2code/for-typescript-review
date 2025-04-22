"use client";

import { Collection, Flex } from "@aws-amplify/ui-react";
import React, { memo, useCallback } from "react";

import { ArrowLongRightIcon } from "@heroicons/react/20/solid";
import { PageHeading } from "@components/ui/PageHeading";
import { adminPages } from "constants/admin";
import { useRouter } from "next/navigation";
import { useUserGroups } from "contexts/UserGroupsContext";

const AdminItem: React.FC<{ item: (typeof adminPages)[0] }> = ({ item }) => {
  const router = useRouter();
  const toolsClickHandler = useCallback(async () => {
    router.push(item.href);
  }, [item.href, router]);

  return (
    <div>
      <div
        onClick={toolsClickHandler}
        className=" hover:bg-blue-50 bg-white rounded-lg border border-gray-300 p-5 w-[300px] cursor-pointer"
      >
        <Flex direction="column" wrap="nowrap" gap="1rem">
          <h1 className="text-lg">{item.name}</h1>
          <p className="text-xs">{item.subtext}</p>
          <ArrowLongRightIcon
            className="h-5 w-5 flex-shrink-0 text-gray-900 cursor-pointer justify-end items-end"
            aria-hidden="true"
          />
        </Flex>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { isSuperAdmin } = useUserGroups();

  if (!isSuperAdmin) {
    return <PageHeading title="No Access" />;
  }

  return (
    <div className="m-6">
      <PageHeading title="Admin Settings" />
      <div className="mt-5">
        <Collection
          items={adminPages}
          type="list"
          direction="row"
          gap="20px"
          wrap="nowrap"
        >
          {(item, index) => <AdminItem key={index} item={item} />}
        </Collection>
      </div>
    </div>
  );
};

export default memo(AdminPage);
