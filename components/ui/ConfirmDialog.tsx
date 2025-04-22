import { useState } from 'react';
import { Button } from "@components/shadcn/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@components/shadcn/ui/dialog";
  
import { IFile } from 'interfaces';
const ConfirmDialog = ({open, handleClose, title, content, isConfirm, handleConfirm}: {
    open: boolean;
    handleClose: () => void;
    title: string;
    content: string;
    isConfirm: boolean;
    handleConfirm: () => void;
}) => {
    return (
        <Dialog open={open} modal={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {content}
                    </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                    <Button variant={isConfirm? "default": "outline"} onClick={handleClose}>{isConfirm ? "Cancel" : "OK"}</Button>
                    {isConfirm && <Button variant="outline" onClick={() => {
                        handleConfirm(); handleClose();
                    }}>Confirm</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default ConfirmDialog;