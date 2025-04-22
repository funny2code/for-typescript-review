import { Schema } from "amplify/data/resource";
import { getStageAndButtonText } from "@components/ContentEngine/utls/keywordStages";
import { useClient } from "contexts/ClientContext";
import { useRouter } from "next/navigation";

type Keyword = Schema["Keyword"]["type"];
type Draft = Schema["Draft"]["type"];

export const useKeywordGeneration = () => {
  const client = useClient();
  const router = useRouter();

  const handleGenerateClick = async (keyword: Keyword, draft?: Draft) => {
    if (!keyword) return;
    const { stage, buttonText } = getStageAndButtonText(keyword);
    console.log("stage", stage);
    console.log("buttonText", buttonText);
    switch (stage) {
      case "Pre-Outline":
        if (buttonText === "Generate Pre-Outline") {
          await generatePreOutline(keyword.id);
        } else if (buttonText === "Approve Pre-Outline") {
          await approvePreOutline(keyword.id);
        } else if (buttonText === "Select Title") {
          console.log("please Select Title11");
          selectTitle(keyword.id);
        }
        break;
      case "Outline":
        if (buttonText === "Generate Outline") {
          await generateOutline(keyword.id);
        } else if (buttonText === "Review Outline") {
          await reviewOutline(keyword.id);
        } else if (buttonText === "Approve Outline") {
          await approveOutline(keyword.id);
        }
        break;
      case "SEO":
        if (buttonText === "Generate SEO Info") {
          await generateSEOData(keyword.id);
        } else if (buttonText === "Review Outline") {
          // await reviewOutline();
        } else if (buttonText === "Approve Outline") {
          // await approveOutline();
        }
        break;
      case "Socials":
        console.log("Socials");
        if (buttonText === "Generate Socials") {
          const { data: draftsData } = await client.models.Draft.list({
            filter: {
              keywordId: { eq: keyword.id },
            },
          });

          const draftId = draftsData[0].id;

          // const draftId = draft ? draft.id : "";
          await generateSocials(keyword.id, draftId);
        } else if (buttonText === "Review Outline") {
          // await reviewOutline();
        } else if (buttonText === "Approve Outline") {
          // await approveOutline();
        }
        break;
      // ... other cases ...
    }
  };

  const generateSocials = async (keywordId: string, draftId: string) => {
    try {
      const { data, errors } =
        await client.mutations.initContentEngineSocialsGen({
          keywordId: keywordId,
          draftId: draftId,
          genType: "ALL_SOCIALS",
        });
      if (errors) throw new Error(errors[0].message);
      console.log("Socials generated:", data);
      // Here you might want to update the keyword state or refetch it
    } catch (err) {
      console.error("Error generating SEO data:", err);
    } finally {
    }
  };

  const generateSEOData = async (keywordId: string) => {
    try {
      const { data: updatedKeyword } = await client.models.Keyword.update({
        id: keywordId,
        status: "DRAFT APPROVED - SEO INFORMATION GENERATION IN PROGRESS",
        marketingInfoStartApproval: true,
      });
      const { data, errors } = await client.mutations.generateContentEngine({
        keywordIds: [keywordId],
      });
      if (errors) throw new Error(errors[0].message);
      console.log("SEO data generated:", data);
      // Here you might want to update the keyword state or refetch it
    } catch (err) {
      console.error("Error generating SEO data:", err);
    } finally {
    }
  };

  const selectTitle = (keywordId: string) => {
    console.log("Select Title", keywordId);

    router.push(`/companies/content-engine/product/keyword/${keywordId}`);
    navigateToKeyword(keywordId); // Implementation
  };

  const generatePreOutline = async (keywordId: string) => {
    console.log("Generate Pre-Outline", keywordId);

    const { data: updatedKeyword } = await client.models.Keyword.update({
      id: keywordId,
      status: "KEYWORD APPROVED - GENERATION IN PROGRESS",
      preOutlineStartApproval: true,
    });

    const { data, errors } = await client.mutations.generateContentEngine({
      keywordIds: [keywordId],
    });
  };
  const navigateToKeyword = (keywordId: string) => {
    router.push(`/companies/content-engine/product/keyword/${keywordId}`);
  };

  const approvePreOutline = async (keywordId: string) => {
    console.log("Approve Pre-Outline", keywordId);

    const { data: updatedKeyword } = await client.models.Keyword.update({
      id: keywordId,
      status: "PREOUTLINE APPROVED - GENERATION IN PROGRESS",
      preOutlineResultApproved: true,
      outlineStartApproval: true,
    });

    const { data, errors } = await client.mutations.generateContentEngine({
      keywordIds: [keywordId],
    });
  };

  const generateOutline = async (keywordId: string) => {
    // Implementation
  };

  const reviewOutline = async (keywordId: string) => {
    const { data: draftsData } = await client.models.Draft.list({
      filter: {
        keywordId: { eq: keywordId },
      },
    });
    console.log("draftsData", draftsData);
    const firstDraftId = draftsData[0].id;
    router.push(
      `/companies/content-engine/product/keyword/${keywordId}/draft/${firstDraftId}`
    );
    // Implementation
  };

  const approveOutline = async (keywordId: string) => {
    // Implementation
  };

  // ... other helper functions ...

  return { handleGenerateClick };
};
