"use client";

import { Card, Flex, Heading, Text, View } from "@aws-amplify/ui-react";

import React from "react";
import { Schema } from "amplify/data/resource";

type Keyword = Schema["Keyword"]["type"];
type Product = Schema["Product"]["type"];
type Company = Schema["Company"]["type"];
type Draft = Schema["Draft"]["type"];
interface PublishComponentProps {
  keyword: Keyword;
  company: Company;
  product: Product;
}

const PublishComponent: React.FC<PublishComponentProps> = ({
  keyword,
  company,
  product,
}) => {
  return (
    <>
      <div>
        <Card className="mx-auto p-6 bg-white shadow-lg rounded-lg">
          <Flex direction="column" gap="1.5rem">
            <View className="bg-gray-50 p-4 rounded-lg space-y-4">
              {keyword?.approvedTitle && keyword?.approvedTitle.length > 0 && (
                <View className="bg-gray-50 p-4 rounded-lg">
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <Heading level={4} className="text-xl font-semibold mb-3">
                      Seo Title
                    </Heading>
                    <Text className="text-gray-700">
                      {keyword?.genSeoTitle}
                    </Text>
                  </View>
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <Heading level={4} className="text-xl font-semibold mb-3">
                      Seo Metadata
                    </Heading>
                    <Text className="text-gray-700">
                      {keyword?.genSeoMetaData}
                    </Text>
                  </View>
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <Heading level={4} className="text-xl font-semibold mb-3">
                      Key Takeaways
                    </Heading>
                    {keyword?.genKeyTakeAways &&
                      keyword?.genKeyTakeAways.length > 0 && (
                        <ul className="list-disc pl-5">
                          {keyword.genKeyTakeAways.map((takeaway, index) => (
                            <li key={index} className="text-gray-700">
                              {takeaway}
                            </li>
                          ))}
                        </ul>
                      )}
                  </View>
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <Heading level={4} className="text-xl font-semibold mb-3">
                      Alt Titles
                    </Heading>
                    {keyword?.genAltTitles &&
                      keyword?.genAltTitles.length > 0 && (
                        <ul className="list-disc pl-5">
                          {keyword.genAltTitles.map((altTitle, index) => (
                            <li key={index} className="text-gray-700">
                              {altTitle}
                            </li>
                          ))}
                        </ul>
                      )}
                  </View>
                </View>
              )}
            </View>
          </Flex>
        </Card>
      </div>
    </>
  );
};

export default PublishComponent;
