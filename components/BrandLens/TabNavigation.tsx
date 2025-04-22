import { Loader, Tabs } from "@aws-amplify/ui-react";

import React from "react";

interface TabItem {
  name: string;
  value: string;
  isDisabled: boolean;
  isLoading: boolean;
}

interface TabNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  tabList: TabItem[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  currentTab,
  onTabChange,
  tabList,
}) => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden w-full mb-5 bg-white rounded-lg p-2 border border-gray-300">
      <Tabs.List spacing="equal" alignItems={"stretch"}>
        {tabList.map((tab) => (
          <Tabs.Item
            className="text-xs"
            key={tab.value}
            value={tab.value}
            isDisabled={tab.isDisabled}
          >
            {tab.isLoading && <Loader size="large" variation="linear" />}
            <h1 className={`text-xs ${tab.isDisabled && "text-gray-300"}`}>
              {!tab.isLoading && tab.name}
            </h1>
          </Tabs.Item>
        ))}
      </Tabs.List>
    </div>
  );
};

export default TabNavigation;
