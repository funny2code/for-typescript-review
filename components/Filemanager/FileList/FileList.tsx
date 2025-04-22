"use client";
import File from "../File/File";
import { useState } from "react";
import FileListEmptyMessage from "./FileListEmptyMessage";
import "./FileList.css";
import { IFile, IID } from "interfaces"

const FileList = ({ fileList = [], handleOnOpenFolder }: { fileList: IFile[]; handleOnOpenFolder: (folder: IFile, index: number)=>void; }) => {
  const [sourceFile, setSourceFile] = useState<IFile | null>(null);
  const [targetId, setTargetId] = useState<IID | null>(null);
  const fileListComponent = fileList.map((file, idx) => {
    return <File file={file} handleOnOpenFolder={handleOnOpenFolder} key={file.id} index={idx} sourceFile={sourceFile} setSourceFile={setSourceFile} targetId={targetId} setTargetId={setTargetId} />;
  });

  return (
    <>
      {fileListComponent.length ? (
        <div className="files-panel"> {fileListComponent} </div>
      ) : (
        <FileListEmptyMessage />
      )}
    </>
  );
};

export default FileList;
