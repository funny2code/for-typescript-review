import React, { useState } from 'react';
import { CustomTreeItem } from "@components/Filemanager/FolderTree/CustomeTreeView"
import { IFile } from 'interfaces';
import { FolderTwoTone, FolderOpenTwoTone } from '@mui/icons-material';
const FolderTree = ({ folder, index, handleOnOpenFolder, handleContextMenu }: { 
    folder: IFile;
    index: number;
    handleOnOpenFolder: (folder: IFile, index: number)=>void;
    handleContextMenu: (event: React.MouseEvent, folder: IFile) => void;
}) => {
    const [isExpand, setIsExpand] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, isFolder: boolean) => {
        e.stopPropagation();

        setIsExpand(pre=>!pre);
        handleOnOpenFolder(folder, index);
    }

    if (folder.isFolder) {
       return (
            <CustomTreeItem 
                itemId={folder.id as string} 
                label={folder.name} 
                onClick={(event) => handleClick(event, folder.isFolder)}
                labelIcon={isExpand? FolderOpenTwoTone : FolderTwoTone}
                onContextMenu={(e) => handleContextMenu(e, folder)}
            >
                {folder.children?.map((folder:any, idx:number) => (
                    <div key={folder.id}>
                        <FolderTree
                            key={folder.id}
                            index={idx}
                            folder={folder}
                            handleOnOpenFolder={handleOnOpenFolder}
                            handleContextMenu={handleContextMenu}
                        />
                    </div>
                ))}
            </CustomTreeItem>
       )
    }
};

export default FolderTree;