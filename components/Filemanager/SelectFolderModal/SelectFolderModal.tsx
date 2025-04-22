import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import FolderTreePanel from "../FolderTree/FolderTreePanel";
import { IFile } from 'interfaces';
import { useState } from 'react';
import { v4 as uuidv4 } from "uuid";

const SelectFolderModal = ({open, handleClose, handleOnMove, treeData, from}: any) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };
    const handleOnOpenFolder = async (file: IFile, index: number) => {
        setTargetFile(file);
    };
    const [targetFile, setTargetFile] = useState<IFile>();

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Please select a target folder.
                </Typography>
                    <div id="modal-modal-description" style={{whiteSpace: 'nowrap', overflow: 'scroll', textOverflow: 'ellipsis'}}>
                        <FolderTreePanel 
                            explorerData = {treeData} 
                            handleOnOpenFolder={handleOnOpenFolder}
                            companyId={"modal"}
                            from={from}
                        />
                    </div>
                <Typography id="button-section">
                    <Button onClick={() => handleOnMove(targetFile)}>Okay</Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </Typography>
            </Box>
        </Modal>
    )
}
export default SelectFolderModal;