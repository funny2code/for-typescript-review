import { Input } from "@aws-amplify/ui-react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { setNewCompanyAction } from "@redux/actions/companyAction";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const JoinCompanyComponent: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleJoinNewCompany = () => {
    // console.log("handleCreateNewCompany");
    dispatch(setNewCompanyAction(""));
    router.push(`/companies/new`);
  };

  return (
    <div className="mt-4">
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <li className="col-span-1 divide-y divide-gray-200 rounded-lg  shadow bg-white">
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            {/* <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  Join Company
                </h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Join Company
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                Click to join a company
              </p>
            </div> */}

            <Input placeholder="Enter Join Code" />
          </div>
          <div>
            <div className="-mt-px flex ">
              <div className="flex w-0 flex-1">
                <button
                  onClick={handleJoinNewCompany}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 py-4 text-sm font-semibold text-gray-900 hover:text-gray-100"
                >
                  <PlusCircleIcon
                    className="h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                  Join Company
                </button>
              </div>
              {/* <div className="-ml-px flex w-0 flex-1">
              <a className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                <PhoneIcon
                  className="h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Edit
              </a>
            </div> */}
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default JoinCompanyComponent;
