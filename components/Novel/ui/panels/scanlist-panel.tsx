import React, { useContext, useEffect, useMemo, useState } from 'react';
import { interval, switchMap } from 'rxjs';

// import { fetchCopyleaksCheckRequest } from '@/lib/fetch-actions';
// import { AppContext } from "contexts/NovelEditorContext";
import type { JSONContent } from 'novel';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import { IAIEditorState } from 'interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { selectAIEditorState } from '@redux/reducers/aieditorReducer';
import { setAIEditorAction } from '@redux/actions/aieditorAction';

const getDetectedWords = (fulltext:string, comparison:any) => {
    const {starts, lengths} = comparison.identical.source.chars;
    let detectedWords = [];
    for (let i = 0; i < starts.length; ++ i) {
        detectedWords.push({
            highlight: fulltext.slice(starts[i], starts[i] + lengths[i]),
            range: {from: starts[i], to: starts[i] + lengths[i]},
            color: '#fd7366',
        })
    }
    const {starts: mstarts, lengths: mlengths} = comparison.minorChanges.source.chars;
    for (let i = 0; i < mstarts.length; ++ i) {
        detectedWords.push({
            highlight: fulltext.slice(mstarts[i], mstarts[i] + mlengths[i]), 
            range: {from: mstarts[i], to: mstarts[i] + mlengths[i]},
            color: '#FFB1B1',
        })
    }
    const {starts: rstarts, lengths: rlengths} = comparison.relatedMeaning.source.chars;
    for (let i = 0; i < rstarts.length; ++ i) {
        detectedWords.push({
            highlight: fulltext.slice(rstarts[i], rstarts[i] + rlengths[i]), 
            range: {from: rstarts[i], to: rstarts[i] + rlengths[i]},
            color: '#fed5a9',
        })
    }
    return detectedWords;
}
const getFoundTexts = (fulltext:string, comparison:any) => {
    const {starts, lengths} = comparison.identical.suspected.chars;
    let foundTexts = [];
    for (let i = 0; i < starts.length; ++ i) {
        foundTexts.push({
            highlight: fulltext.slice(starts[i], starts[i] + lengths[i]), 
            className: 'bg-[#fd7366]',
        })
    }
    const {starts: mstarts, lengths: mlengths} = comparison.minorChanges.suspected.chars;
    for (let i = 0; i < mstarts.length; ++ i) {
        foundTexts.push({
            highlight: fulltext.slice(mstarts[i], mstarts[i] + mlengths[i]), 
            className: 'bg-[#FFB1B1]',
        })
    }
    const {starts: rstarts, lengths: rlengths} = comparison.relatedMeaning.suspected.chars;
    for (let i = 0; i < rstarts.length; ++ i) {
        foundTexts.push({
            highlight: fulltext.slice(rstarts[i], rstarts[i] + rlengths[i]), 
            className: 'bg-[#fed5a9]',
        })
    }
    return foundTexts;
}

const ReportList = ({isReportVisible, setIsReportVisible, isPromptSetVisible, setIsPromptSetVisible, setIsFeatureVisible, setIsPromptListVisiable, fileName, fileContent}: {
    isReportVisible: boolean;
    setIsReportVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isPromptSetVisible: boolean;
    setIsPromptSetVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFeatureVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPromptListVisiable: React.Dispatch<React.SetStateAction<boolean>>;
    fileContent: JSONContent;
    fileName: string;
}) => {

    const toggleListVisibility = () => {
        if (!isReportVisible) {
            setIsPromptSetVisible(false);
            setIsFeatureVisible(false);
            setIsPromptListVisiable(false);
        }
        setIsReportVisible(!isReportVisible);
    };
    
    
    const [isReportDetail, setIsReportDetail] = useState(false);
    const aiEditorState: IAIEditorState = useSelector(selectAIEditorState);
    const { aiEditorData } = aiEditorState;
    const dispatch = useDispatch();
    const { 
        reports, 
        scanId, 
        novelEditor, 
        reportDetail, 
        isScanning 
    } = aiEditorData;
    const [report, setReport] = useState(null);
    const [highlights, setHighlights] = useState<string[]>([]);
    const [totalWords, setTotalWords] = useState(0);
    const [detailId, setDetailId] = useState('');
    const [totalScore, setTotalScore] = useState(0);
    const [isMarked, setIsMarked] = useState(true);
    const [detectedSource, setDetectedSource] = useState([]);

    const checkFileObservable = (fileName:string) => {
        // Define the polling interval
        const pollingInterval = 3000;
      
        // Create an Observable that emits every 5 seconds
        return interval(pollingInterval).pipe(
            // Use switchMap to call the API on each interval tick
            switchMap(() => {
                return fetch('/api/checkfile', {
                        method: "POST",
                        body: JSON.stringify({"fileName": fileName})
                }).then(r => r.json());
            })
        );
    };

    useEffect(() => {
        if (scanId != '') {
            // Subscribe to the Observable
            const fileName = `${scanId}.json`;
            const subscription = checkFileObservable(fileName).subscribe({
              next: async (data) => {
                if (data.exists) {
                    // The file exists, perform the action to retrieve the file
                    subscription.unsubscribe(); // Stop polling
                    const jsonData = await fetchJSON(fileName);
                    const scanResults = jsonData.jsonData.results.internet;
                    setTotalWords(jsonData.jsonData.scannedDocument.totalWords);
                    setTotalScore(jsonData.jsonData.results.score.aggregatedScore);
                    // setReports(scanResults);
                    // setIsScanning(false);
                    dispatch(setAIEditorAction({ key: "reports", value: scanResults }));
                    dispatch(setAIEditorAction({ key: "isScanning", value: false }));
                }
              },
              error: err => {/* console.error('Error:', err) */},
            });
        
            // Unsubscribe on component unmount
            return () => subscription.unsubscribe();
        }
    }, [scanId]);
    
    const fetchJSON = async (fileName:string) => {
        try {            
            const response = await fetch(`/api/getScanResult`, {
                method: "POST",
                body: JSON.stringify({ fileName: fileName })
            }); // Adjust the path according to your file's location
            const data = await response.json();
            return data;
        } catch (error) {
            // console.error('Error fetching the json file:', error);
        }
    };

    const fetchReportJSON = async (_scanId:any, _result:any) => {
        // setIsScanning(true);
        dispatch(setAIEditorAction({ key: "isScanning", value: true }));
        const fileName = `report_${_scanId}_${_result.id}.json`;
        setIsReportDetail(true);
        setReport(_result);
        // setReportDetail(null);
        dispatch(setAIEditorAction({ key: "reportDetail", value: null }));
       
        // Subscribe to the Observable
        const subscription = checkFileObservable(fileName).subscribe({
            next: async (data) => {
                if (data.exists) {
                    // The file exists, perform the action to retrieve the file
                    subscription.unsubscribe(); // Stop polling
                    /* const jsonData = await fetchJSON(fileName);
                    if (jsonData.jsonData.text.value)
                        setReportDetail(jsonData.jsonData);
                    const foundTexts = getFoundTexts(jsonData.jsonData.text.value, jsonData.jsonData.text.comparison);
                    const detectedWords = getDetectedWords(jsonData.jsonData.text.value, jsonData.jsonData.text.comparison);
                    setDetectedSource(detectedWords)
                    setHighlights(foundTexts);
                    setIsScanning(false);
                    // Highlighting the detected word in the editor
                    for (let i = 0; i < detectedWords.length; ++ i) {
                        const {range, color} = detectedWords[i];
                        novelEditor.commands.setTextSelection(range);
                        novelEditor.commands.setHighlight({ color });
                    }
                    novelEditor.commands.setTextSelection({from: 0, to: 0});
                    novelEditor.commands.unsetHighlight(); */
                }
            },
            error: err => {/* console.error('Error:', err) */},
        });
    
        // Unsubscribe on component unmount
        return () => subscription.unsubscribe();
    }

    const doMark = () => {
        if (isMarked) {
            for (let i = 0; i < detectedSource.length; ++ i) {
                const {range, color} = detectedSource[i];
                novelEditor.commands.setTextSelection(range);
                novelEditor.commands.setHighlight({ color: 'white' });
            }
            novelEditor.commands.setTextSelection({from: 0, to: 0});
        } else {
            // Highlighting the detected word in the editor
            for (let i = 0; i < detectedSource.length; ++ i) {
                const {range, color} = detectedSource[i];
                novelEditor.commands.setTextSelection(range);
                novelEditor.commands.setHighlight({ color });
            }
            novelEditor.commands.setTextSelection({from: 0, to: 0});
        }
        setIsMarked(!isMarked);
    }

    const goBackList = () => {
        // setReportDetail(null);
        dispatch(setAIEditorAction({ key: "reportDetail", value: null }));
        setIsReportDetail(false);
        setHighlights([]);
        setReport(null);
    }

    const copyleaksCheckRun = async () => {
        setIsFeatureVisible(false);
        setIsPromptListVisiable(false);
        setIsPromptSetVisible(false);
        setIsReportVisible(true);
        // setReports([]);
        // setIsScanning(true);
        dispatch(setAIEditorAction({ key: "reports", value: [] }));
        dispatch(setAIEditorAction({ key: "isScanning", value: true }));
        const scanId = Date.now();
        // for test
        // const scanId = '1711983110622';

        // setScanId(`${scanId}`);
        dispatch(setAIEditorAction({ key: "scanId", value: `${scanId}` }));
        const data = {
          scanId: `${scanId}`,
          fileName,
          fileContent
        }
        // await fetchCopyleaksCheckRequest(data);
    }

    const isCanScanByCopyleaks = useMemo(() => {
        return fileName !== "" && fileName !== "untitled.md" && fileContent.length > 0 && !isScanning;
    }, [fileName, fileContent]);

    return (
        <>
        {/* Show/Hide Button */}
        <button
            onClick={toggleListVisibility}
            className={`rounded-full h-6 w-6 bg-gray-300 hover:bg-gray-500 hover:text-white text-black flex 
                        items-center justify-center shadow-lg transition-all 
                        z-10 top-0 mb-2 ml-auto
                        ${isReportVisible ? "left-0" : "left-[-48px]"}`}
            title="Show/Hide Prompt Sets List"
        >
            {isReportVisible ? '<' : '>'}
        </button>
        {!isReportVisible && (
            <div className="[writing-mode:vertical-lr] font-bold  text-sm cursor-pointer" onClick={toggleListVisibility}>
                PLAGIARISMS
            </div>
        )}
        <div className={` ${isReportVisible ? '' : 'hidden'}`}>
            <h2 className="text-right text-2x font-bold mb-3 mr-5">
                { !isReportDetail ? (
                    <>
                        Matching Text Results ({reports.length})
                        <button 
                            className={`ml-2 cursor-pointer text-white rounded-s-lg py-1 px-2 text-xs ${isCanScanByCopyleaks ? 'bg-[#BD4C2A]' : 'bg-[#DA7658]'}`}
                            onClick={copyleaksCheckRun}
                            disabled = {!isCanScanByCopyleaks}
                        >
                            <span>COPYLEAKS SCAN</span>
                        </button>
                    </>
                ) : ``}

            </h2>
            {reports.length > 0 && (
                <div className="bg-white rounded-lg px-6 py-3 cursor-pointer hover:border-blue-500 border-2">
                    <p className='flex text-sm font-bold '>
                        Matched Text <span>({totalScore}%)</span>
                        {isReportDetail && (
                            <button
                                className='bg-blue-500 px-2 py-1 text-sm text-white font-bold rounded ml-auto mb-2'
                                onClick={doMark}
                            >
                                {isMarked ? "UnMark" : "Mark"}
                            </button>
                        )}
                    </p>
                    <div className="flex w-full bg-gray-300 rounded-full h-2.5 relative">
                        <div className="bg-[#fd7366] h-2.5 rounded-full" style={{width: `${totalScore}%`}}></div>
                    </div>                        
                </div>
            )}
            {isReportDetail && report && (
                {/* <>
                <div
                  key={report.id} 
                  className="bg-white rounded-lg px-6 py-3 cursor-pointer border-2 mb-2"
                >
                    <button 
                        type="button" 
                        className="ml-auto flex items-center justify-center w-1/2 px-2 py-1 text-sm text-gray-700 transition-colors duration-200 bg-gray-300 border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100"
                        onClick={goBackList}
                    >
                        <svg className="w-5 h-5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <h3 className="font-semibold text-lg mb-1 transition-colors">
                        {report.title}
                    </h3>
                    <p>
                        <span className='rounded-lg bg-blue-500 text-white text-xs px-2 text-center font-bold'> {(report.metadata.filename as string)} </span>
                    </p>
                    <a href={report.url} target="_blank" rel="noopener noreferrer" className='text-blue-700 underline underline-offset-1 text-sm mb-1'>
                            <p>{report.url.slice(0, 40)}... </p>
                    </a>
                    <div className="flex w-full bg-gray-300 rounded-full h-2.5 relative">
                        <div className="bg-[#fd7366] h-2.5 rounded-full" style={{width: `${report.identicalWords/totalWords*100}%`}}></div>
                        <div className="bg-[#FFB1B1] h-2.5 rounded-full" style={{width: `${report.similarWords/totalWords*100}%`}}></div>
                        <div className="bg-[#fed5a9] h-2.5 rounded-full" style={{width: `${report.paraphrasedWords/totalWords*100}%`}}></div>
                        <div className="absolute w-full left-0 -top-10 flex justify-center items-center h-full">
                            <div 
                                className={`${(detailId == report.id)? 'opacity-100': 'opacity-0'} transition-opacity duration-300 bg-gray-100/[.8] text-black text-xs rounded-lg py-2 px-4 z-10 border-2`}
                            >
                                <p><span>IDENTICALS: {(report.identicalWords/totalWords*100).toFixed(1)}%</span></p>
                                <p><span>SIMILARS: {(report.similarWords/totalWords*100).toFixed(1)}%</span></p>
                                <p><span>PARAPHRASES: {(report.paraphrasedWords/totalWords*100).toFixed(1)}%</span></p>
                            </div>
                        </div>
                    </div>
                    <span
                        id={report.id}
                        onMouseEnter={(e) => setDetailId((e.target as HTMLElement).id)}
                        onMouseLeave={() => setDetailId('')}
                    >
                        {((report.identicalWords+report.similarWords+report.paraphrasedWords)/totalWords*100).toFixed(1)}%
                    </span>
                </div>
                </> */}
            )}
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                {isScanning && (
                    <div className="w-full h-full fixed top-0 left-0 bg-white opacity-75 z-50">
                        <div className="flex justify-center items-center mt-[50vh]">
                            <div className="fas fa-circle-notch fa-spin fa-5x text-violet-600"></div>
                        </div>
                    </div>
                )}
                
                {(isReportDetail) ? (
                    <HighlightWithinTextarea
                        value={ reportDetail ? reportDetail.text.value : '' }
                        highlight={highlights}
                        readOnly
                    />
                ) : reports.map((_report) => (
                    <div
                        key={_report.id} 
                        className="bg-white rounded-lg px-6 py-3 cursor-pointer hover:border-blue-500 border-2"
                        onClick={() => fetchReportJSON(scanId, _report)}
                    >
                        <h3 className="font-semibold text-lg mb-1 transition-colors">
                            {_report.title}
                        </h3>
                        <p>
                            <span className='text-xs mr-2'>Internet Result:</span>
                            <span className='rounded-lg bg-blue-500 text-white text-sm px-2 font-bold'> 
                                    {(_report.metadata.filename as string) && (_report.metadata.filename as string).slice(0, 20)}
                            </span>
                        </p>
                        <a href={_report.url} target="_blank" rel="noopener noreferrer" className='text-blue-700 underline underline-offset-1 text-sm mb-1'>
                             <p>{_report.url.slice(0, 40)}... </p>
                        </a>
                        <div className="text-sm text-gray-700 py-1 font-mono">
                            <p>{_report.introduction}</p>
                        </div>
                        
                        <div className="flex w-full bg-gray-300 rounded-full h-2.5 relative">
                            <div className="bg-[#fd7366] h-2.5 rounded-full" style={{width: `${_report.identicalWords/totalWords*100}%`}}></div>
                            <div className="bg-[#FFB1B1] h-2.5 rounded-full" style={{width: `${_report.similarWords/totalWords*100}%`}}></div>
                            <div className="bg-[#fed5a9] h-2.5 rounded-full" style={{width: `${_report.paraphrasedWords/totalWords*100}%`}}></div>
                            <div className="absolute w-full left-0 -top-10 flex justify-center items-center h-full">
                                <div 
                                    className={`${(detailId == _report.id)? 'opacity-100': 'opacity-0'} transition-opacity duration-300 bg-gray-100/[.8] text-black text-xs rounded-lg py-2 px-4 z-10 border-2`}
                                >
                                    <p><span>IDENTICALS: {(_report.identicalWords/totalWords*100).toFixed(1)}%</span></p>
                                    <p><span>SIMILARS: {(_report.similarWords/totalWords*100).toFixed(1)}%</span></p>
                                    <p><span>PARAPHRASES: {(_report.paraphrasedWords/totalWords*100).toFixed(1)}%</span></p>
                                </div>
                            </div>
                        </div>
                        <span
                            id={_report.id}
                            onMouseEnter={(e) => setDetailId((e.target as HTMLElement).id)}
                            onMouseLeave={() => setDetailId('')}
                        >
                            {((_report.identicalWords+_report.similarWords+_report.paraphrasedWords)/totalWords*100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
};

export default ReportList;
