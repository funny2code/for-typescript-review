import { Dialog, Transition } from "@headlessui/react";
import {
  Battery100Icon,
  CheckBadgeIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  RectangleStackIcon,
  SparklesIcon,
  Squares2X2Icon,
  WrenchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Image } from "@aws-amplify/ui-react";
import Link from "next/link";
import { Fragment } from "react";
import { classNames } from "utils/utils";
import FeedbackCard from "./FeedbackCard";
import { selectCompanyState } from "@redux/reducers/companyReducer";
import { useSelector } from "react-redux";
import { ICompanyState } from "interfaces";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { selectedCompany } = companyState;
  const companyId = selectedCompany?.id;

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Squares2X2Icon,
      current: false,
      disabled: false,
    },
    {
      name: "Brand Lens",
      href: companyId ? `/brand-lens` : "/companies",
      // href: "/coming-soon",
      icon: SparklesIcon,
      current: false,
      disabled: false,
    },

    {
      name: "Tools",
      href: companyId ? `/companies/tools` : "/companies",
      icon: WrenchIcon,
      current: false,
      disabled: false,
    },
    {
      name: "AI Editor",
      href: companyId ? `/ai-editor` : "/companies",
      icon: DocumentTextIcon,
      current: false,
      disabled: false,
    },
    {
      name: "File Manager",
      href: companyId ? `/file-manager` : "/companies",
      icon: RectangleStackIcon,
      current: false,
      disabled: false,
    },
    {
      name: "Teams-ContentEngine",
      href: companyId ? `/companies/content-engine` : "/companies",
      icon: RectangleStackIcon,
      current: false,
      disabled: false,
    },

    {
      name: "SEO",
      // href: companyId ? `/company/${companyId}/seo` : "/",
      href: "/coming-soon",
      icon: EyeIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Content Review",
      // href: companyId ? `/company/${companyId}/content-review` : "/",
      href: "/coming-soon",
      icon: CheckBadgeIcon,
      current: false,
      disabled: true,
    },
    {
      name: "Production Status",
      // href: "/",
      href: "/coming-soon",

      icon: Battery100Icon,
      current: false,
      disabled: true,
    },
    {
      name: "Approvals",
      // href: "/",
      href: "/coming-soon",
      icon: CheckCircleIcon,
      current: false,
      disabled: true,
    },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link href={"/"} className={"mt-6"}>
                      <Image
                        src="/logo.svg"
                        alt="Fomo.ai"
                        width={125}
                        height={125}
                        className="h-8 w-auto"
                      />
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-5">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={classNames(
                                  item.disabled
                                    ? " cursor-not-allowed text-gray-300"
                                    : " text-fomored-500",
                                  item.current
                                    ? "bg-blue-50"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-blue-50",
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                  item.disabled
                                    ? "cursor-not-allowed pointer-events-none !text-gray-300"
                                    : " "
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.current
                                      ? "text-fomored-500"
                                      : "text-gray-700 group-hover:text-[#171717]",
                                    "h-6 w-6 shrink-0",
                                    item.disabled
                                      ? "cursor-not-allowed pointer-events-none !text-gray-300"
                                      : ""
                                  )}
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:w-72">
        <div
          className="flex flex-col gap-y-5 overflow-y-auto bg-white h-screen border-r border-gray-300"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Logo box */}
          <div className="flex h-[72px] shrink-0 items-center border-b">
            <Link href={"/"} className="flex items-center ml-6">
              <Image src="/logo.svg" alt="Fomo.ai" width={125} />
            </Link>
          </div>
          {/* Nav items */}
          <nav className="flex flex-1 flex-col px-6 pb-6">
            <ul role="list" className="flex flex-col gap-1 -mx-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    id={`sidenav_${item.name.toLowerCase().split(" ").join("_")}`}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-blue-50"
                        : "text-gray-700 hover:bg-blue-50 hover:text-gray-900",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                      item.disabled
                        ? " cursor-not-allowed pointer-events-none !text-gray-300"
                        : ""
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? ""
                          : "text-gray-700 group-hover:text-gray-900",
                        "h-6 w-6 shrink-0",
                        item.disabled
                          ? " cursor-not-allowed pointer-events-none !text-gray-300"
                          : ""
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <FeedbackCard />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
