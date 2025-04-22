import { Button, Flex, Text, TextAreaField, View } from "@aws-amplify/ui-react";

import { useState } from "react";

interface EditableOutlineComponentProps {
  initialData: any;
  onSave: (data: any) => void;
}

const EditableOutlineComponent: React.FC<EditableOutlineComponentProps> = ({
  initialData,
  onSave,
}) => {
  const [data, setData] = useState(initialData);

  const handleChange = (field: any, value: any, sectionIndex = -1) => {
    if (sectionIndex === -1) {
      setData({ ...data, [field]: value });
    } else {
      const newSections = [...data.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [field]: value,
      };
      setData({ ...data, sections: newSections });
    }
  };

  const handleSave = () => {
    onSave(data);
  };

  return (
    <View className="p-4 bg-white shadow-lg rounded-lg">
      <Text className="text-xl font-bold mb-4">Edit Outline</Text>

      <TextAreaField
        label="Thoughts"
        value={data.thoughts}
        onChange={(e) => handleChange("thoughts", e.target.value)}
        className="mb-4"
      />

      {data.sections &&
        data.sections.map(
          (
            section: {
              title: string;
              keyword: string;
              key_takeaways: string[];
              type: string;
              section_template: string;
            },
            index: number
          ) => (
            <View key={index} className="mb-6 p-4 bg-gray-50 rounded">
              <Text className="font-semibold mb-2">Section {index + 1}</Text>

              <TextAreaField
                label="Title"
                value={section.title}
                onChange={(e) => handleChange("title", e.target.value, index)}
                className="mb-2"
              />

              <TextAreaField
                label="Keyword"
                value={section.keyword}
                onChange={(e) => handleChange("keyword", e.target.value, index)}
                className="mb-2"
              />

              <TextAreaField
                label="Key Takeaways"
                // value={section.key_takeaways.join("\n") || "your key takeaways"}
                onChange={(e) =>
                  handleChange(
                    "key_takeaways",
                    e.target.value.split("\n"),
                    index
                  )
                }
                className="mb-2"
              />

              <Flex>
                <Text className="mr-2">Type:</Text>
                <Text>{section.type}</Text>
              </Flex>

              <Flex>
                <Text className="mr-2">Template:</Text>
                <Text>{section.section_template}</Text>
              </Flex>
            </View>
          )
        )}

      <Button onClick={handleSave}>Save Changes</Button>
    </View>
  );
};

export default EditableOutlineComponent;
