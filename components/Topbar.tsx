"use client";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@components/shadcn/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/shadcn/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/shadcn/ui/popover";
import { CircleUser, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@components/shadcn/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
// shadcn
import { useAuthenticator } from "@aws-amplify/ui-react";
import Link from "next/link";
import { setCompanyAction, setCompaniesAction, setCompanyIdAction, updateCompanyStateOriginAction, updateCompanyAction, setThreadAction, unsetCompanyAction, setNewCompanyAction } from "@redux/actions/companyAction";
import { ICompany, ICompanyState } from "interfaces";
import { useDispatch, useSelector } from "react-redux";
import { useClient } from "contexts/ClientContext";
import { selectCompanyState } from "@redux/reducers/companyReducer";
{
  /* @TODO: search */
}
{
  /* @TODO: Implement In App notifications */
}

interface TopBarProps {
  setSidebarOpen: (value: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({ setSidebarOpen }) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { signOut } = useAuthenticator((context: any) => [context.user]);
  const [hasCompanyAssigned, setHasCompanyAssigned] = useState(false);

  const dispatch = useDispatch();
  const client = useClient();

  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { companies, selectedCompany: company } = companyState;

  // setup companies
  useEffect(() => {
    // Subscribe to company list updates
    const listCompanySub = client.models.Company.observeQuery({
      selectionSet: [
        "id", "companyName", "companyBackground", "companyWebsite", "socials", "status", "members", "companyType",// company details
        "brandPromise", "brandTone", "brandToneSentiments", "brandToneKeywords", "brandValueProp", "brandPersonas", "brandContentPillars", // brand variables
        "products.*", "iterations.*", "threads.*", "joinCodes.*", "AIrequests.*" // company relationships
      ]
    }).subscribe({
      next: ({ items }: { items: any[] }) => {
        // Mapping the retrieved companies to ICompany Interface
        const companyList = items.map(item => Object.fromEntries(
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
      },
    });

    return () => {
      listCompanySub.unsubscribe();
    };
  }, []);


  const handleSelectCompany = (id: string, company: ICompany) => {
    const currentPath = pathname;
    // setting a company in redux store
    dispatch(setCompanyAction(company));
    dispatch(setCompanyIdAction(id));
    dispatch(setThreadAction(null));

    if (currentPath === "/") {
      router.push(`/`);
    }
  };

  const handleCreateNewCompany = () => {
    // router.push(`/companies/new`);
    dispatch(unsetCompanyAction(null));
    dispatch(setNewCompanyAction(""));
    
    router.push("/brand-lens");
  };
  const handleViewAllCompany = () => {
    router.push(`/companies`);
  };

  useEffect(() => {
    if (companies && companies.length > 0) {
      setHasCompanyAssigned(true);
    }
  }, [companies, company]);

  return (
    <div className="sticky top-0 z-40 flex justify-between items-center h-[72px] bg-white px-6 border-b border-gray-300 lg:justify-end">
      <Button
        variant={"outline"}
        size="icon"
        className="text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="company-select"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[200px] justify-between"
            >
              {(company && company.id != "new-company") ? company.companyName : "Select company..."}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandGroup heading="Your companies">
                <CommandList>
                  {companies &&
                    companies.map((company) => (
                      <CommandItem
                        key={company.id}
                        value={`${company.companyName}`}
                        onSelect={() => {
                          setOpen(false);
                          handleSelectCompany(company.id, company);
                        }}
                      >
                        {company.companyName}
                      </CommandItem>
                    ))}
                  {!hasCompanyAssigned && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        handleCreateNewCompany();
                      }}
                    >
                      Create new company
                    </CommandItem>
                  )}
                </CommandList>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  id="view-all-companies"
                  onSelect={() => {
                    handleViewAllCompany();
                    setOpen(false);
                  }}
                >
                  View all companies
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              id="user-menu-button"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { router.push("/settings"); }}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem id={"logout-btn"} onClick={signOut}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
