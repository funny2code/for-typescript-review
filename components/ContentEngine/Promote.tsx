import { Card, Flex, Heading, Text, View } from "@aws-amplify/ui-react";

import Markdown from "react-markdown";
import React from "react";
import { Schema } from "amplify/data/resource";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

type Keyword = Schema["Keyword"]["type"];

interface PromoteComponentProps {
  keyword: Keyword;
}

const PromoteComponent: React.FC<PromoteComponentProps> = ({ keyword }) => {
  const parseSocialPosts = (posts: string | number | true | object | any[]) => {
    console.log("posts", posts);
    if (typeof posts === "string") {
      try {
        return JSON.parse(posts);
      } catch {
        return posts;
      }
    }
    return posts;
  };

  const genSocialPosts = parseSocialPosts(keyword.genSocialPosts || "");

  return (
    <Card className="mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Flex direction="column" gap="1.5rem">
        {keyword?.approvedTitle && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Approved Title
            </Heading>
            <Text className="text-gray-700">{keyword.approvedTitle}</Text>
          </View>
        )}

        {(keyword?.genTwitterPosts && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Twitter Posts
            </Heading>
            {Object.entries(JSON.parse(keyword?.genTwitterPosts as string)).map(
              ([key, tweet]) => (
                <View
                  key={key}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
                >
                  <Flex alignItems="center" className="mb-2">
                    <View className="w-12 h-12 bg-gray-500 rounded-full mr-3"></View>
                    <View>
                      <Text className="font-bold">Twitter User</Text>
                      <Text className="text-gray-500">@twitterhandle</Text>
                    </View>
                  </Flex>
                  <Text className="text-gray-800 mb-2">{String(tweet)}</Text>
                  <Flex className="text-gray-500 text-sm">
                    <Text className="mr-4">💬 0</Text>
                    <Text className="mr-4">🔁 0</Text>
                    <Text>❤️ 0</Text>
                  </Flex>
                </View>
              )
            )}
          </View>
        )) || (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Twitter Posts
            </Heading>
            <Text className="text-gray-700">No Twitter posts available.</Text>
          </View>
        )}

        {(keyword?.genLinkedinPosts && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Linkedin Post1
            </Heading>
            <View className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <Flex alignItems="center" className="mb-3">
                <View className="w-12 h-12 bg-gray-500 rounded-full mr-3"></View>
                <View>
                  <Text className="font-bold">LinkedIn User</Text>
                  <Text className="text-gray-500 text-sm">
                    Professional Title
                  </Text>
                </View>
              </Flex>
              <Text className="text-gray-800 whitespace-pre-wrap mb-3">
                {String(keyword.genLinkedinPosts)}
              </Text>
              <Flex className="text-gray-500 text-sm">
                <Text className="mr-4">👍 0</Text>
                <Text className="mr-4">💬 0</Text>
                <Text>↪️ 0</Text>
              </Flex>
            </View>
          </View>
        )) || (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Linkedin Post
            </Heading>
            <Text className="text-gray-700">No Linkedin posts available.</Text>
          </View>
        )}

        {(keyword?.genInstagramPosts && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Instagram Posts
            </Heading>
            <View className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <Flex
                alignItems="center"
                className="p-3 border-b border-gray-200"
              >
                <View className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full mr-3"></View>
                <Text className="font-bold">instagram_user</Text>
              </Flex>
              <View className="bg-gray-200 h-64 flex items-center justify-center">
                <Text className="text-gray-500">Image Placeholder</Text>
              </View>
              <View className="p-3">
                <Flex className="text-2xl mb-2">
                  <Text className="mr-4">❤️</Text>
                  <Text className="mr-4">💬</Text>
                  <Text>📤</Text>
                </Flex>
                <Markdown
                  remarkPlugins={[
                    remarkGfm,
                    remarkBreaks,
                    rehypeStringify,
                    remarkParse,
                    remarkRehype,
                  ]}
                  className="text-gray-800"
                >
                  {String(keyword?.genInstagramPosts)}
                </Markdown>
              </View>
            </View>
          </View>
        )) || (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Suggested Instagram Posts
            </Heading>
            <Text className="text-gray-700">No Instagram posts available.</Text>
          </View>
        )}

        {keyword?.genTiktokPosts ? (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              TikTok Content
            </Heading>
            <Markdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeStringify]}
              className="text-gray-700 whitespace-pre-wrap"
            >
              {keyword?.genTiktokPosts as string}
            </Markdown>
          </View>
        ) : (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              TikTok Content
            </Heading>
            <Text className="text-gray-700">No TikTok content available.</Text>
          </View>
        )}

        {(keyword?.genFacebookPosts && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Facebook Content
            </Heading>
            <Text className="text-gray-700 whitespace-pre-wrap">
              <Markdown
                remarkPlugins={[
                  remarkGfm,
                  remarkBreaks,
                  rehypeStringify,
                  remarkParse,
                  remarkRehype,
                ]}
              >
                {keyword?.genFacebookPosts as string}
              </Markdown>
            </Text>
          </View>
        )) || (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Heading level={4} className="text-xl font-semibold mb-3">
              Facebook Content
            </Heading>
            <Text className="text-gray-700">
              No Facebook content available.
            </Text>
          </View>
        )}
      </Flex>
    </Card>
  );
};

export default PromoteComponent;
