"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader, Tabs, useAuthenticator } from "@aws-amplify/ui-react";
import BrandPersonasSection from "@components/BrandLens/BrandPersonasSection";
import BrandPillarsSection from "@components/BrandLens/BrandPillarsSection";
import BrandAssetsForm from "@components/BrandLens/BrandAssetsForm";
import BrandDetailsForm from "@components/BrandLens/BrandDetailsForm";
import BrandPromiseSection from "@components/BrandLens/BrandPromiseSection";
import BrandToneSection from "@components/BrandLens/BrandToneSection";
import BrandValuePropositionSection from "@components/BrandLens/BrandValuePropositionSection";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import NextStepFooter from "@components/BrandLens/NextStepFooter";
import TabNavigation from "@components/BrandLens/TabNavigation";

import { IConfirmDialog, IPersona, IPillar, ICompanyState, ICompany } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { sendGTMEvent } from "@next/third-parties/google";
import { useClient } from "contexts/ClientContext";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { toast } from "sonner";
import { Button } from "@components/shadcn/ui/button";
import { setCompaniesAction, setCompanyAction, setCompanyByIdAction, updateCompanyStateOriginAction } from "@redux/actions/companyAction";

interface IExtendedConfirmDialog extends IConfirmDialog {
  handleClose: () => void;
}

const SetupBrandLensPage = () => {
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany: brandLens, companies } = companyState;
  const dispatch = useDispatch();
  const router = useRouter();
  const client = useClient();
  const [tab, setTab] = useState("brand-details");
  
  const [showConfirmDialog, setShowConfirmDialog] =
    useState<IExtendedConfirmDialog | null>(null);

  const { user } = useAuthenticator((context) => [context.user]);
  const [noAccess, setNoAccess] = useState<boolean>(false);
  
  const [channelId, setChannelId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const [brandlensBrandDetailsLoading, setBrandlensBrandDetailsLoading] =
    useState<boolean>(false);
  const [brandlensBrandPromiseLoading, setBrandlensBrandPromiseLoading] =
    useState<boolean>(false);
  const [brandlensBrandToneLoading, setBrandlensBrandToneLoading] =
    useState<boolean>(false);
  const [brandlensBrandValueLoading, setBrandlensBrandValueLoading] =
    useState<boolean>(false);
  const [brandlensBrandPersonasLoading, setBrandlensBrandPersonasLoading] =
    useState<boolean>(false);
  const [
    brandlensBrandContentPillarsLoading,
    setBrandlensBrandContentPillarsLoading,
  ] = useState<boolean>(false);

  const [saveBrandDetailsLoading, setSaveBrandDetailsLoading] =
    useState<boolean>(false);

  const [saveBrandPromiseLoading, setSaveBrandPromiseLoading] =
    useState<boolean>(false);

  const [saveBrandToneLoading, setSaveBrandToneLoading] =
    useState<boolean>(false);

  const [saveBrandValueLoading, setSaveBrandValueLoading] =
    useState<boolean>(false);

  const [saveBrandPillarLoading, setSaveBrandPillarLoading] =
    useState<boolean>(false);

  const [generatingSinglePersonaLoading, setGeneratingSinglePersonaLoading] =
    useState<boolean>(false);

  const [generatingSinglePillarLoading, setGeneratingSinglePillarLoading] =
    useState<boolean>(false);

  const [isUpdateFromDB, setIsUpdateFromDB] = useState<boolean>(false);

  enum Status {
    Generating = "generating",
    Generated = "generated",
    Error = "error",
    Initated = "initated",
    Saved = "saved",
    Completed = "completed",
    Created = "created"
  }

  enum GenType {
    BrandDetails = "brand-details",
    BrandPromise = "brand-promise",
    BrandTone = "brand-tone",
    BrandValue = "brand-value",
    BrandPersonas = "brand-personas",
    BrandContentPillars = "brand-content-pillars",
    BrandPersonasSingle = "brand-personas-single",
    BrandContentPillarsSingle = "brand-content-pillars-single",
  }

  const loadingStateSetters = {
    [GenType.BrandDetails]: setBrandlensBrandDetailsLoading,
    [GenType.BrandPromise]: setBrandlensBrandPromiseLoading,
    [GenType.BrandTone]: setBrandlensBrandToneLoading,
    [GenType.BrandValue]: setBrandlensBrandValueLoading,
    [GenType.BrandPersonas]: setBrandlensBrandPersonasLoading,
    [GenType.BrandContentPillars]: setBrandlensBrandContentPillarsLoading,
    [GenType.BrandPersonasSingle]: setBrandlensBrandPersonasLoading,
    [GenType.BrandContentPillarsSingle]: setBrandlensBrandContentPillarsLoading,
  };

  const actionDescriptions: Record<GenType, string> = {
    [GenType.BrandDetails]: "Brand Details",
    [GenType.BrandPromise]: "Brand Promise",
    [GenType.BrandTone]: "Brand Tone of Voice",
    [GenType.BrandValue]: "Brand Value Proposition",
    [GenType.BrandPersonas]: "Brand Personas",
    [GenType.BrandContentPillars]: "Content Pillars",
    [GenType.BrandPersonasSingle]: "Single Brand Persona",
    [GenType.BrandContentPillarsSingle]: "Single Content Pillar",
  };

  const getTabToSet = (genType: GenType): GenType => {
    switch (genType) {
      case GenType.BrandContentPillarsSingle:
        return GenType.BrandContentPillars;
      case GenType.BrandPersonasSingle:
        return GenType.BrandPersonas;
      default:
        return genType;
    }
  };

  const handleEventsDetails = async (status: Status, genType: GenType) => {
    const setLoadingState = loadingStateSetters[genType];
    const actionDescription = actionDescriptions[genType];

    if (!setLoadingState) {
      return;
    }

    switch (status) {
      case Status.Generating:
        setLoadingState(true);
        toast.success(`${actionDescription} generation in progress`, {
          duration: 3000,
          position: "bottom-center",
        });
        break;

      case Status.Generated:
        setLoadingState(false);
        setTab(getTabToSet(genType));
        sendGTMEvent({
          event: `generated-${actionDescription
            .toLowerCase()
            .replace(" ", "-")}`,
        });
        toast.success(`${actionDescription} generation Completed`, {
          duration: 3000,
          position: "bottom-center",
        });
        await client.models.Company.update({
          id: brandLens?.id as string,
          status: `${genType.toLowerCase()}#completed`,
        });

        if (genType === GenType.BrandPersonasSingle) {
          closePersonasDialog();
        }
        if (genType === GenType.BrandContentPillarsSingle) {
          closeContentPillarDialog();
        }
        break;

      case Status.Initated:
        setLoadingState(false);
        toast.success(`${actionDescription} generation Initiated`, {
          duration: 3000,
          position: "bottom-center",
        });
        break;

      case Status.Saved:
        toast.success(`${actionDescription} Saved`, {
          duration: 3000,
          position: "bottom-center",
        });
        await client.models.Company.update({
          id: brandLens?.id as string,
          status: `${genType.toLowerCase()}#completed`,
        });
        break;

      case Status.Created:
        toast.success(`${actionDescription} Created`, {
          duration: 3000,
          position: "bottom-center",
        });
        break;

      case Status.Completed:
        break;

      case Status.Error:
        setLoadingState(false);
        toast.error("Error generating brand lens " + actionDescription, {
          duration: 3000,
          position: "bottom-center",
        });
        if (genType === GenType.BrandPersonasSingle) {
          closePersonasDialog();
        }
        if (genType === GenType.BrandContentPillarsSingle) {
          closeContentPillarDialog();
        }
        break;
    }
  };

  const onUpdatePillars = async (updatedPillars: IPillar[]) => {
    setLoading(true);
    try {
      const { data: companyRecord, errors } =
        await client.models.Company.update({
          id: brandLens?.id as string,
          brandContentPillars: JSON.stringify(updatedPillars),
          status: "brand-content-pillars#generated",
        });

      if (errors) {
        toast.error("Error updating Content Pillars", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error updating Content Pillars", {
        duration: 3000,
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBrandPromise = async () => {
    toast.success("Saving Brand Promise", {
      duration: 3000,
      position: "bottom-center",
    });
    setSaveBrandPromiseLoading(true);
    const updatePromiseContent = brandLens?.brandPromise;
    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandPromise: updatePromiseContent,
      status: "brand-promise#saved",
    });

    if (companyRecord) {
      toast.success("Saved Brand Promise successfully.", {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error("Error saving brand promise", {
        duration: 3000,
        position: "bottom-center",
      });
    }
    setSaveBrandPromiseLoading(false);

    setLoading(false);
  };

  const saveBrandTone = async () => {
    // await saveKeywordsHandler();
    toast.success("Saving Brand Tone", {
      duration: 3000,
      position: "bottom-center",
    });
    setSaveBrandToneLoading(true);

    const updatedBrandTone = brandLens?.brandTone;
    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandTone: updatedBrandTone,
      brandToneKeywords: JSON.stringify(brandLens?.brandToneKeywords),
      status: "brand-tone#saved",
    });

    if (companyRecord) {
      setSaveBrandToneLoading(false);
    } else {
      setSaveBrandToneLoading(false);
      toast.error("Error saving brand tone", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  const onUpdatePersonas = async (updatedPersonas: IPersona[]) => {
    setLoading(true);
    try {
      const { data: companyRecord, errors } =
        await client.models.Company.update({
          id: brandLens?.id as string,
          brandPersonas: JSON.stringify(updatedPersonas),
          status: "brand-personas#generated",
        });

      if (errors) {
        toast.error("Error updating brand personas", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error updating brand personas", {
        duration: 3000,
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBrandValueProp = async () => {
    setSaveBrandValueLoading(true);
    toast.success("Saving Brand Value", {
      duration: 3000,
      position: "bottom-center",
    });

    const updatedBrandValueProp = brandLens?.brandValueProp; //brandValueRef.current?.getMarkdownContent();

    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandValueProp: updatedBrandValueProp,
      status: "brand-value#saved",
    });

    if (companyRecord) {
      setSaveBrandValueLoading(false);
    } else {
      setSaveBrandValueLoading(false);
      toast.error("Error saving brand value", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  const saveBrandPersona = async () => {
    setLoading(true);
    const updatedPersonas = brandLens?.brandPersonas;
    await client.models.Company.update({
      id: brandLens?.id as string,
      brandPersonas: JSON.stringify(updatedPersonas),
      status: "brand-personas#saved",
    });
    setLoading(false);
  };

  const saveBrandPillars = async () => {
    setLoading(true);
    setSaveBrandPillarLoading(true);
    toast.success("Saving Content Pillars", {
      duration: 3000,
      position: "bottom-center",
    });
    const updatedPillars = brandLens?.brandContentPillars;
    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandContentPillars: JSON.stringify(updatedPillars),
      status: "brand-content-pillars#completed",
    });
    if (companyRecord) {
      setSaveBrandPillarLoading(false);
      toast.success("Content Pillars Saved.", {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      setSaveBrandPillarLoading(false);
      toast.error("Error saving Content Pillars", {
        duration: 3000,
        position: "bottom-center",
      });
    }
    setLoading(false);
  };

  const saveAndGenerateBrandlensBrandPromiseHandler = async () => {
    await saveCompanyDetailsHandler();
    if (brandLens && brandLens.brandPromise && brandLens.brandPromise.length > 0) {
      setShowConfirmDialog({
        open: true,
        title: "Confirmation",
        content: `Would you like to overwrite the Brand Promise?`,
        isConfirm: true,
        handleClose: () => {
          setTab(getTabToSet(GenType.BrandPromise));
          setShowConfirmDialog(null);
        },
        handleConfirm: async () => {
          setBrandlensBrandPromiseLoading(true);
          await generateBrandlensHandler(GenType.BrandPromise);
        },
      });
    } else {
      setBrandlensBrandPromiseLoading(true);
      await generateBrandlensHandler(GenType.BrandPromise);
    }
  };

  /* const saveAndGenerateBrandlensBrandToneHandler = async () => {
    setBrandlensBrandToneLoading(true);
    await saveBrandPromise();
    generateBrandlensHandler("brand-tone");
  };
  const handleSaveAndGeneratePersonasAndPillars = async () => {
    await saveBrandValueProp();
    await generateBrandlensHandler(GenType.BrandPersonas);
    await generateBrandlensHandler(GenType.BrandContentPillars);
  }; */

  const handleSaveAndGeneratePersonas = async () => {
    await saveBrandValueProp();
    if (brandLens && brandLens.brandPersonas && brandLens.brandPersonas.length > 0) {
      setShowConfirmDialog({
        open: true,
        title: "Confirmation",
        content: `Would you like to overwrite the Brand Personas?`,
        isConfirm: true,
        handleClose: () => {
          setTab(getTabToSet(GenType.BrandPersonas));
          setShowConfirmDialog(null);
        },
        handleConfirm: async () => {
          setBrandlensBrandPersonasLoading(true);
          await generateBrandlensHandler(GenType.BrandPersonas);
        },
      });
    } else {
      setBrandlensBrandPersonasLoading(true);
      await generateBrandlensHandler(GenType.BrandPersonas);
    }
  };
  const handleSaveAndGeneratePillars = async () => {
    await saveBrandPersona();
    if (brandLens && brandLens.brandContentPillars && brandLens.brandContentPillars.length > 0) {
      setShowConfirmDialog({
        open: true,
        title: "Confirmation",
        content: `Would you like to overwrite the Content Pillars?`,
        isConfirm: true,
        handleClose: () => {
          setTab(getTabToSet(GenType.BrandContentPillars));
          setShowConfirmDialog(null);
        },
        handleConfirm: async () => {
          setBrandlensBrandContentPillarsLoading(true);
          await generateBrandlensHandler(GenType.BrandContentPillars);
        },
      });
    } else {
      setBrandlensBrandContentPillarsLoading(true);
      await generateBrandlensHandler(GenType.BrandContentPillars);
    }
  };

  const [brandPillarFeedback, setBrandPillarFeedback] = useState("");

  const savePillarFeedback = (newFeedback: string) => {
    setBrandPillarFeedback(newFeedback);
  };

  const addBrandContentPillarSingle = async () => {
    setGeneratingSinglePillarLoading(true);
    await generateBrandlensHandler(
      GenType.BrandContentPillarsSingle,
      brandPillarFeedback
    );
  };
  const [brandPersonaFeedback, setBrandPersonaFeedback] = useState("");
  const savePersonaFeedback = (newFeedback: string) => {
    setBrandPersonaFeedback(newFeedback);
  };
  const addPersonaSingle = async () => {
    setGeneratingSinglePersonaLoading(true);
    await generateBrandlensHandler(
      GenType.BrandPersonasSingle,
      brandPersonaFeedback
    );
  };

  const saveAndGenerateBrandValuePropHandler = async () => {
    await saveBrandTone();
    if (brandLens && brandLens.brandValueProp && brandLens.brandValueProp.length > 0) {
      setShowConfirmDialog({
        open: true,
        title: "Confirmation",
        content: `Would you like to overwrite the Brand Value Proposition?`,
        isConfirm: true,
        handleClose: () => {
          setTab(getTabToSet(GenType.BrandValue));
          setShowConfirmDialog(null);
        },
        handleConfirm: async () => {
          setBrandlensBrandValueLoading(true);
          generateBrandlensHandler(GenType.BrandValue);
        },
      });
    } else {
      setBrandlensBrandValueLoading(true);
      generateBrandlensHandler(GenType.BrandValue);
    }
  };

  const generateBrandlensHandler = async (
    action: GenType,
    feedback: string = ""
  ) => {
    const actionDescription = actionDescriptions[action];
    toast.info(`Initiating ${actionDescription} generation...`, {
      duration: 3000,
      position: "bottom-center",
    });
    setLoading(true);
    sendGTMEvent({
      event: `generating-${actionDescription.toLowerCase().replace(" ", "-")}`,
    });

    let currentChannelId = channelId;

    if (!currentChannelId) {
      currentChannelId = await saveAIRequest(action);
      if (currentChannelId) {
        setChannelId(currentChannelId);
      } else {
        toast.error("Failed to create AI request", {
          duration: 3000,
          position: "bottom-center",
        });
        setLoading(false);
        return;
      }
    }

    const { data: iterationRecord, errors: createIterationRecordErrors } =
      await client.models.Iteration.create({
        companyId: brandLens?.id,
        request: "brandlens -" + action,
        iterationFeedback: feedback,
      });

    if (createIterationRecordErrors) {
      // toast.error(
      //   `Error creating iteration record: ${
      //     createIterationRecordErrors[0]?.message || "Unknown error"
      //   }`
      // );
      setLoading(false);
      return;
    }

    if (!iterationRecord) {
      // toast.error("Failed to create iteration record");
      setLoading(false);
      return;
    }

    try {
      const { data, errors } = await client.mutations.brandLensSetup({
        companyId: brandLens?.id,
        action: action,
        reqId: currentChannelId,
        iterationId: iterationRecord.id,
      });

      if (errors) {
        toast.error(
          `Error generating ${actionDescription}: ${
            errors[0]?.message || "Unknown error"
          }`,
          {
            duration: 3000,
            position: "bottom-center",
          }
        );
        setLoading(false);
        return;
      }

      toast.success(`${actionDescription} generation in progress`, {
        duration: 3000,
        position: "bottom-center",
      });
    } catch (error) {
      toast.error(
        `Unexpected error during ${actionDescription} generation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          duration: 3000,
          position: "bottom-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyDetailsHandler = useCallback(async () => {
    
    if (!brandLens || brandLens.companyName == "" || brandLens.companyBackground == "") {
      return;
    }

    setSaveBrandDetailsLoading(true);
    toast.info("Saving company details...", {
      duration: 3000,
      position: "bottom-center",
    });

    const updatedCompanyBackground = brandLens.companyBackground;
    const updatedCompanyName = brandLens.companyName;
    const updatedCompanyWebsite = brandLens.companyWebsite;
    const updatedCompanySocials = brandLens.socials;

    if (brandLens.id == "new-company") {
      const { data: companyRecord } = await client.models.Company.create({
        companyName: updatedCompanyName,
        companyBackground: updatedCompanyBackground,
        companyWebsite: updatedCompanyWebsite,
        socials: JSON.stringify(updatedCompanySocials),
        status: "brand-details#created",
      });
      console.log("new company data: ", companyRecord, companies)
      const { data: newCompanyList } = await client.models.Company.list(
        {
          selectionSet: [
            "id", "companyName", "companyBackground", "companyWebsite", "socials", "status", "members", "companyType",// company details
            "brandPromise", "brandTone", "brandToneSentiments", "brandToneKeywords", "brandValueProp", "brandPersonas", "brandContentPillars", // brand variables
            "products.*", "iterations.*", "threads.*", "joinCodes.*", "AIrequests.*" // company relationships
          ]
        }
      );
      const companyList = newCompanyList.map(item => Object.fromEntries(
        Object.entries(item).map(([key, value]) => {
          if (key == "socials" || key == 'brandContentPillars' || key == 'brandPersonas' || key == 'brandToneKeywords') {
            if (typeof value === 'string') return [key, JSON.parse(value)];
            else return [key, key == 'brandToneKeywords'? {use: "", avoid: ""} : []];
          }
          return [key, value];
        })
      ));
      
      // storing the all companies in redux
      dispatch(setCompaniesAction(companyList));
      dispatch(updateCompanyStateOriginAction(true));
      dispatch(setCompanyByIdAction(companyRecord?.id));
      
      return companyRecord;
    } else {
      try {
        const { data: companyRecord } = await client.models.Company.update({
          id: brandLens.id,
          companyName: updatedCompanyName,
          companyBackground: updatedCompanyBackground,
          companyWebsite: updatedCompanyWebsite,
          socials: JSON.stringify(updatedCompanySocials),
          status: "brand-details#saved",
        });
        setSaveBrandDetailsLoading(false);
        /* toast.success("Saved Brand Details successfully.", {
          duration: 3000,
          position: "bottom-center",
        }); */
        return companyRecord;
      } catch (error) {
        toast.error("Error saving company details", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    }
  }, [brandLens]);

  const saveKeywordsHandler = async () => {
    setBrandlensBrandToneLoading(true);
    toast.info("Saving keywords...", {
      duration: 3000,
      position: "bottom-center",
    });
    /* const btKeywords = {
      use: brandLens.selectedPositiveKeywords.join(", "),
      avoid: brandLens.selectedNegativeKeywords.join(", "),
    }; */
    // console.log("updated btkeywords: ", btKeywords);
    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandToneKeywords: JSON.stringify(brandLens?.brandToneKeywords),
      status: "brand-tone#saved",
    });

    if (errors) {
      toast.error(
        `Error saving keywords: ${errors[0]?.message || "Unknown error"}`,
        {
          duration: 3000,
          position: "bottom-center",
        }
      );
      setBrandlensBrandToneLoading(false);
      return;
    }

    toast.success("Keywords saved successfully", {
      duration: 3000,
      position: "bottom-center",
    });
    setBrandlensBrandToneLoading(false);
  };

  const saveKeywordsAndGenerateBrandToneHandler = async () => {
    setBrandlensBrandToneLoading(true);
    toast.info("Saving keywords...", {
      duration: 3000,
      position: "bottom-center",
    });
    /* const btKeywords = {
      use: brandLens.selectedPositiveKeywords.join(", "),
      avoid: brandLens.selectedNegativeKeywords.join(", "),
    }; */
    // console.log("updated btkeywords: ", btKeywords);
    const { data: companyRecord, errors } = await client.models.Company.update({
      id: brandLens?.id as string,
      brandToneKeywords: JSON.stringify(brandLens?.brandToneKeywords),
      status: "brand-tone#generating",
    });

    if (errors) {
      toast.error(
        `Error saving keywords: ${errors[0]?.message || "Unknown error"}`,
        {
          duration: 3000,
          position: "bottom-center",
        }
      );
      setBrandlensBrandToneLoading(false);
      return;
    }

    toast.success("Keywords saved successfully", {
      duration: 3000,
      position: "bottom-center",
    });

    await generateBrandlensHandler(GenType.BrandTone);
  };

  const saveAIRequest = async (action: string) => {
    const variables = {
      type: action,
      userRequest: action,
      status: "pending",
      systemFeedback: "pending",
      user: user.username,
      route: "/brand-lens",
      company: brandLens,
    };
    try {
      const { data: aiReqResponse, errors } =
      await client.models.AIrequest.create(variables);
      
      if (!aiReqResponse) {
        return;
      }
      return aiReqResponse.id;
    } catch (error) {
      // console.log("ai request: ", error)
      toast.error("Error creating AI request");
    }
  };
  //TODO: Single function for both dialog. edge case multi user might cause an issue
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  const [isContentPillarDialogOpen, setIsContentPillarDialogOpen] =
    useState(false);

  const closePersonasDialog = () => {
    setIsPersonaDialogOpen(false);
    setGeneratingSinglePersonaLoading(false);
  };

  const closeContentPillarDialog = () => {
    setIsContentPillarDialogOpen(false);
  };

  useEffect(() => {
    if (brandLens && brandLens.id != "new-company") {
      const generationstatus = brandLens.status ? brandLens.status.split("#") : [];
      if (generationstatus) {
        handleEventsDetails(
          generationstatus[1] as Status,
          generationstatus[0] as GenType
        );
      }
    }
  }, [brandLens])

  useEffect(() => {
    if (!brandLens) {
      router.push("/companies");
    }
    setTab("brand-details");
  }, []);

  if (noAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center">
          <p className="text-xl font-bold">No Access</p>
          <p className="text-gray-500">
            You don&apos;t have access to this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="m-6">
        <Tabs.Container
          defaultValue="brand-details"
          value={tab}
          onValueChange={(tab) => setTab(tab)}
          justifyContent="center"
          spacing="relative"
          alignContent={"center"}
        >
          <TabNavigation
            currentTab={tab}
            onTabChange={setTab}
            tabList={[
              {
                name: "Brand Details",
                value: "brand-details",
                isDisabled: false,
                isLoading: false,
              },
              {
                name: "Brand Promise",
                value: "brand-promise",
                isDisabled:
                  !brandLens?.brandPromise || brandLens?.brandPromise === "",
                isLoading: brandlensBrandPromiseLoading,
              },
              {
                name: "Brand Tone of Voice",
                value: "brand-tone",
                isDisabled:
                  !brandLens?.brandTone || brandLens?.brandTone === "",
                isLoading: brandlensBrandToneLoading,
              },
              {
                name: "Brand Value Proposition",
                value: "brand-value",
                isDisabled:
                  !brandLens?.brandValueProp || brandLens?.brandValueProp === "",
                isLoading: brandlensBrandValueLoading,
              },
              {
                name: "Brand Personas",
                value: "brand-personas",
                isDisabled:
                  !brandLens?.brandPersonas || brandLens?.brandPersonas.length == 0,
                isLoading: brandlensBrandPersonasLoading,
              },
              {
                name: "Content Pillars",
                value: "brand-content-pillars",
                isDisabled:
                  !brandLens?.brandContentPillars || brandLens?.brandContentPillars.length == 0,
                isLoading: brandlensBrandContentPillarsLoading,
              },
            ]}
          />
          <Tabs.Panel value="brand-details">
            <div className="flex flex-col gap-5 md:flex-row">
              <BrandDetailsForm />
              <BrandAssetsForm />
            </div>
            {brandLens?.id == "new-company" ? (
              <Button onClick={() => {saveCompanyDetailsHandler();}}>Create</Button>
            ) : (
              <NextStepFooter
                nextFunction={async () =>
                  await saveAndGenerateBrandlensBrandPromiseHandler()
                }
                hasSave
                saveFunction={saveCompanyDetailsHandler}
                saveFunctionLoading={saveBrandDetailsLoading}
                title="Next step: Brand Promise"
                buttonText="Save and Continue"
                isLoading={brandlensBrandPromiseLoading}
                id="generate-brand-promise"
              />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="brand-promise">
            <BrandPromiseSection
              isLoading={brandlensBrandPromiseLoading}
            />

            <NextStepFooter
              nextFunction={async () => {
                await saveBrandPromise();
                setTab("brand-tone");
              }}
              hasSave
              saveFunction={saveBrandPromise}
              saveFunctionLoading={saveBrandPromiseLoading}
              title="Next step: Brand Tone Of Voice"
              buttonText="Save and Continue"
              isLoading={brandlensBrandToneLoading}
              id="generate-brand-tone"
            />
          </Tabs.Panel>

          <Tabs.Panel value="brand-tone">
            <BrandToneSection
              isLoading={brandlensBrandToneLoading}
              onGenerateTone={saveKeywordsAndGenerateBrandToneHandler}
            />

            <NextStepFooter
              nextFunction={async () => {
                // await saveBrandTone();
                saveAndGenerateBrandValuePropHandler();
              }}
              hasSave
              saveFunction={saveBrandTone}
              saveFunctionLoading={saveBrandToneLoading}
              title="Next step: Brand Value Proposition"
              buttonText="Save and Continue"
              isLoading={brandlensBrandValueLoading}
              enableNext={!brandLens?.brandTone || brandLens?.brandTone === ""}
              id="generate-brand-value"
            />
          </Tabs.Panel>

          <Tabs.Panel value="brand-value">
            <BrandValuePropositionSection
              isLoading={brandlensBrandValueLoading}
            />

            <NextStepFooter
              nextFunction={() => handleSaveAndGeneratePersonas()}
              hasSave
              saveFunction={saveBrandValueProp}
              saveFunctionLoading={saveBrandValueLoading}
              title="Next step: Brand Personas and Content Pillars"
              buttonText="Save and Continue"
              isLoading={brandlensBrandPersonasLoading}
              id="generate-brand-personas"
            />
          </Tabs.Panel>

          <Tabs.Panel value="brand-personas">
            <BrandPersonasSection
              isLoading={brandlensBrandPersonasLoading}
              onAddPersona={addPersonaSingle}
              addPersonaLoading={generatingSinglePersonaLoading}
              onFeedbackChange={savePersonaFeedback}
              onUpdatePersonas={onUpdatePersonas}
              isDialogOpen={isPersonaDialogOpen}
              setIsDialogOpen={setIsPersonaDialogOpen}
            />
            <NextStepFooter
              nextFunction={() => {
                handleSaveAndGeneratePillars();
              }}
              hasSave
              saveFunction={saveBrandPersona}
              title="Next step: Content Pillars"
              buttonText="Save and Continue"
              isLoading={brandlensBrandPersonasLoading}
              id="generate-brand-pillars"
            />
          </Tabs.Panel>

          <Tabs.Panel value="brand-content-pillars">
            <BrandPillarsSection
              isLoading={brandlensBrandContentPillarsLoading}
              onAddPillar={addBrandContentPillarSingle}
              onAddPillarLoading={generatingSinglePillarLoading}
              onFeedbackChange={savePillarFeedback}
              onUpdatePillars={onUpdatePillars}
              isDialogOpen={isContentPillarDialogOpen}
              setIsDialogOpen={setIsContentPillarDialogOpen}
            />
            <NextStepFooter
              nextFunction={async () => {
                await saveBrandPillars();
                router.push("/companies/tools");
              }}
              hasSave
              saveFunction={saveBrandPillars}
              saveFunctionLoading={saveBrandPillarLoading}
              title="Brand Lens Setup Complete!"
              buttonText="View Tools"
              isLoading={brandlensBrandPersonasLoading}
              id="view-tools"
            />
          </Tabs.Panel>
        </Tabs.Container>
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          open={showConfirmDialog.open}
          title={showConfirmDialog.title}
          content={showConfirmDialog.content}
          handleClose={() => {
            showConfirmDialog.handleClose();
          }}
          isConfirm={showConfirmDialog.isConfirm}
          handleConfirm={() => {
            showConfirmDialog.handleConfirm();
          }}
        />
      )}
    </Suspense>
  );
};

export default SetupBrandLensPage;
