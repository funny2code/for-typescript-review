"use client";

import {
  DocumentTextIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  SparklesIcon,
  TrashIcon,
  UsersIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { ICompany, IConfirmDialog } from "interfaces";
import {
  deleteCompanyAction,
  setCompanyAction,
  setCompanyIdAction,
  setNewCompanyAction,
} from "@redux/actions/companyAction";

import { Button } from "@aws-amplify/ui-react";
import ConfirmDialog from "./ui/ConfirmDialog";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useClient } from "contexts/ClientContext";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompanyGridProps {
  companies: ICompany[];
  userId: any;
}

const SelectCompanyComponent: React.FC<CompanyGridProps> = ({
  companies,
  userId,
}) => {
  const router = useRouter();
  const dataClient = useClient();
  const [showMessage, setShowMessage] = useState<IConfirmDialog | null>(null);

  const dispatch = useDispatch();

  const handleBrandlensCompany = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/brand-lens`);
  };

  const handleEditCompany = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/brand-lens`);
  };

  const handleTeamManagement = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/companies/teams`);
  };

  const handleAIEditor = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/ai-editor`);
  };

  const handleFileManager = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/file-manager`);
  };

  const handleCreateNewCompany = () => {
    // router.push(`/companies/new`);
    dispatch(setNewCompanyAction(""));
    router.push("/brand-lens");
  };

  const handleTools = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/companies/tools`);
  };
  const handleContentEngine = (id: string, company: ICompany) => () => {
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    router.push(`/companies/content-engine`);
  };

  const handleDeleteCompany = (id: string, company: ICompany) => () => {
    setShowMessage({
      open: true,
      title: "Deleting a company",
      content: `Would you like to delete the company - ${company.companyName}?`,
      isConfirm: true,
      handleConfirm: async () => {
        // delete a company
        const { errors: deleteCompanyError } =
          await dataClient.models.Company.delete({
            id: id as string,
          });

        if (deleteCompanyError) {
          return;
        }

        toast.success("Company deleted successfully", {
          duration: 3000,
          position: "bottom-center",
        });

        dispatch(deleteCompanyAction(company));
        sessionStorage.setItem("companyId", "");

        router.push(`/companies`);
      },
    });
  };

  return (
    <>
      <ul role="list" className="grid grid-cols-1 gap-5 mt-5">
        {companies.map((company) => (
          <li
            key={company.id}
            className="col-span-1 rounded-lg bg-white border border-gray-300"
          >
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-lg font-bold text-[#171717] ">
                      {company.companyName || "Company Name"}
                    </h3>
                    <span className="inline-flex flex-shrink-0 items-center rounded bg-blue-50 text-[#174D80] px-2 py-1 text-xs font-medium text-green-700">
                      {company?.members
                        ? company.members[0] === userId
                          ? "Owner"
                          : "Member"
                        : "Member"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCompany(company.id, company)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    >
                      <PencilSquareIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      onClick={handleDeleteCompany(company.id, company)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    >
                      <TrashIcon className="h-5 w-5 " aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">
                  Total Members: {company.members?.length}
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-px flex flex-col gap-4 md:flex-row ">
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleBrandlensCompany(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <SparklesIcon className="h-5 w-5 " aria-hidden="true" />
                    Brand Lens
                  </button>
                </div>
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleTools(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <WrenchIcon className="h-5 w-5 " aria-hidden="true" />
                    Tools
                  </button>
                </div>
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleContentEngine(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <WrenchIcon className="h-5 w-5 " aria-hidden="true" />
                    Content Engine
                  </button>
                </div>
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleAIEditor(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <DocumentTextIcon className="h-5 w-5 " aria-hidden="true" />
                    AI Editor
                  </button>
                </div>
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleFileManager(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <RectangleStackIcon
                      className="h-5 w-5 "
                      aria-hidden="true"
                    />
                    File Manager
                  </button>
                </div>
                <div className="-ml-px flex flex-1 rounded-lg bg-gray-100">
                  <button
                    onClick={handleTeamManagement(company.id, company)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3  py-4 text-sm font-semibold  active:bg-gray-200 hover:bg-[#E9F2FE] rounded-lg"
                  >
                    <UsersIcon className="h-5 w-5 " aria-hidden="true" />
                    Team Management
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}

        {companies.length === 0 ? (
          <li className="">
            <p className="mb-5">
              No companies yet! To begin using powerful AI tools, create a new
              company.
            </p>
            <Button
              variation="primary"
              size="small"
              onClick={handleCreateNewCompany}
              className="flex gap-2"
            >
              <PlusCircleIcon className="h-5 w-5 " aria-hidden="true" />
              Create company
            </Button>
          </li>
        ) : null}
      </ul>
      {showMessage && (
        <ConfirmDialog
          open={showMessage.open}
          title={showMessage.title}
          content={showMessage.content}
          handleClose={() => {
            setShowMessage(null);
          }}
          isConfirm={showMessage.isConfirm}
          handleConfirm={() => showMessage.handleConfirm()}
        />
      )}
    </>
  );
};

export default SelectCompanyComponent;
