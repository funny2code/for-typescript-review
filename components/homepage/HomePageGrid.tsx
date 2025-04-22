import { CheckboxField, Image, Link, SliderField } from "@aws-amplify/ui-react";
import { useEffect, useMemo, useState } from "react";

import { sendGTMEvent } from "@next/third-parties/google";
import { getFileList } from "@redux/reducers/helper";
import { useClient } from "contexts/ClientContext";
import { ICompanyState } from "interfaces";
import { useSelector } from "react-redux";
import { selectCompanyState } from "@redux/reducers/companyReducer";

type StepType = {
  title: string;
  description: string;
  completed: boolean;
  link: string;
  value: number;
};

const HomepageGrid: React.FC = () => {
  const client = useClient();
  const [steps, setSteps] = useState<StepType[]>([]);
  const [threadExist, setThreadExist] = useState<boolean>(false);
  const [usedAIEditor, setUsedAIEditor] = useState<boolean>(false);
  const companyState: ICompanyState = useSelector(selectCompanyState);
  const { companies, selectedCompany } = companyState;

  useEffect(() => {
    const fetchData = async () => {
      const { data: fetchedThreads } = await client.models.Thread.list();
      setThreadExist(fetchedThreads.length > 0);
      
      for (let i = 0; i < companies.length; ++i) {
        const path = `company/${companies[i].id}/`;
        const ownFiles = await getFileList(path);        
        if (ownFiles.length > 0) {
          setUsedAIEditor(true);
          break;
        }
      }
    };

    fetchData();
  }, [client]);

  const handleSchedule = () => {
    sendGTMEvent({
      event: "schedule_clicked",
    });

    const url = "https://fomo.ai/schedule";
    window.open(url, "_blank");
  };

  const initialSteps = useMemo(() => {
    return [
      {
        title: "Create your company",
        description: "",
        completed: companies.length > 0,
        value: 33.3,
        link: "/brand-lens",
      },
      {
        title: "Use your first tool",
        description: "",
        completed: threadExist,
        value: 33.3,
        link: selectedCompany
          ? `/companies/tools`
          : "/companies",
      },
      {
        title: "Use the AI text editor",
        description: "",
        completed: usedAIEditor,
        value: 33.3,
        link: selectedCompany ? `/ai-editor` : "/",
      },
    ];
  }, [usedAIEditor, threadExist]);

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const sliderValue = steps.reduce((total, step) => {
    return step.completed ? total + step.value : total;
  }, 0);
  const finalSliderValue = steps.every((step) => step.completed)
    ? 100
    : sliderValue;

  return (
    <div>
      <div className="px-4 mt-4 pb-4 sm:mt-6 sm:pb-6 sm:px-6">
        <div className="grid gap-4 grid-flow-row-dense grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 grid-rows-2 sm:grid-flow-row">
          <div className="bg-white rounded-2xl border border-gray-300">
            <div className=" p-8">
              <div>
                <div className=" mt-3 ">
                  <span className="font-dm text-3xl font-bold text-fomoblack-300">
                    Onboarding Checklist
                  </span>
                  <span className="ml-2">
                    <Image
                      src="/Rocket.svg"
                      alt="Fomo.ai"
                      height={20}
                      width={20}
                      className="h-auto w-auto"
                    />
                  </span>
                </div>
                <div></div>
                <div className="flex w-full items-center justify-between mt-4">
                  <div className="flex-1 h-14">
                    <SliderField
                      label="Slider"
                      max={100}
                      step={4}
                      value={finalSliderValue}
                      size="small"
                      trackSize="10px"
                      emptyTrackColor="#D9D9D9"
                      filledTrackColor="#171717"
                      // thumbColor="white"
                      isValueHidden
                      labelHidden
                      isDisabled
                    />
                  </div>
                </div>

                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex items-center justify-between my-4"
                  >
                    <div>
                      <CheckboxField
                        label={step.title}
                        name={step.title}
                        value="yes"
                        onChange={() => {
                          setSteps((prevSteps) =>
                            prevSteps.map((s, i) =>
                              i === index
                                ? { ...s, completed: !s.completed }
                                : s
                            )
                          );
                        }}
                        checked={step.completed}
                      />
                      <p className="text-xs text-left ml-6">
                        {step.description}
                      </p>
                      <p className="text-xs text-right">
                        {step.link && (
                          <Link
                            className=""
                            style={{
                              display: "flex",
                              fontSize: "smaller",
                              color: "#438AE8",
                            }}
                            href={step.link}
                          >
                            {" "}
                            {step.title}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 ml-1 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </Link>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[471px] bg-white rounded-2xl border border-gray-300 flex justify-center items-center flex-col">
            <div className=" mb-3 ">
              <span className="font-dm text-3xl font-bold text-fomoblack-300">
                Talk to FOMO.ai
              </span>
            </div>
            <ul className="list-none hover:list-disc">
              <li className="py-2">- Done-for-you AI Marketing</li>
              <li className="py-2">- Other AI SEO/Content needs</li>
              <li className="py-2">- Enterprise relationships</li>
              <li className="py-2">- Custom AI solutions</li>
              <li className="py-2">- AI training and workshops</li>
            </ul>
            <div className="w-full flex justify-center ">
              <button
                className="text-center w-[216px] h-[47px] mt-4 bg-[#171717] text-white rounded-lg"
                onClick={handleSchedule}
              >
                Schedule Today
              </button>
            </div>
            {/* <div className="text-center p-8">
              <h1 className="text-2xl font-dm font-bold">Help Us Improve!</h1>
              <h5 className="text-base font-dm">
                Share Your Feedback Today &#10024;
              </h5>

              <div className="w-full flex justify-center ">
                <button className="text-center w-[216px] h-[47px] mt-4 bg-[#171717] text-white rounded-lg">
                  Give us your Feedback
                </button>
              </div>
            </div> */}
          </div>
          {/* <div className="h-[471px] bg-white rounded-2xl border border-gray-300">
            <div className="h-full w-full flex flex-col items-center">
              <div className="flex justify-center items-center">
                <div className="text-center p-8 mt-2">
                  <h1 className="font-dm text-3xl font-bold text-fomoblack-300 mb-6">
                    AI Accelerator Program 🚀
                  </h1>
                  <p className="max-w-[600px]">
                    With an extensive library of resources on digital marketing, business fundamentals, and AI, Kajabi has everything you ened to grow your business. Join an active community of creators and get access to live, 24/7 support.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 max-w-[600px] p-6 rounded-xl">
                <div className="flex justify-center items-center">
                  <Image
                    src="/kajabi_logo.svg"
                    alt="Fomo.ai"
                    className="h-auto w-auto max-w-64 p-6"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <button className="w-[175px] h-[47px] px-5 py-3 mb-6 rounded-[10px] gap-2 bg-[#438AE8] text-white">
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div> */}
          {/* <div className="h-[471px] bg-white rounded-2xl border border-gray-300">
            <div className="text-center p-8">
              <div className="rounded-lg h-[411px] w-full mb-4 relative">
                <iframe
                  src="https://www.loom.com/embed/c264cb8ad2c84607903991f7ebce828c?sid=349a2d56-e911-480c-96ba-56e07cc436c1"
                  frameBorder="0"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  className="rounded-lg"
                ></iframe>
              </div>
              <h1 className="text-fomoblack-300 text-lg font-dm leading-7 font-bold text-left">
                Figma ipsum
              </h1>
              <p className="text-fomoblack-300  font-normal  text-left mt-2">
                Netus at faucibus erat urna morbi sit nec praesent varius ac
                tincidunt volutpat aliquet lorem est pellentesque morbi volutpat
                praesent.
              </p>
            </div>
          </div> */}
        </div>
      </div>
      {/* Add your JSX code here */}
    </div>
  );
};

export default HomepageGrid;
