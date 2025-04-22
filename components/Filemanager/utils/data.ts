import { IFile } from "interfaces";
/**
 * Calculate file size by bytes in human readable format
 * @param {Number} bytes
 * @returns {String}
 */
/* 

export const getHumanFileSize = (bytes: number): string => {
  const e = (Math.log(bytes) / Math.log(1e3)) | 0;
  return (
    +(bytes / Math.pow(1e3, e)).toFixed(2) +
    " " +
    ("kMGTPEZY"[e - 1] || "") +
    "B"
  );
};

export const debounce = <T extends (...args: any[]) => ReturnType<T>>(
  callback: T,
  timeout: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, timeout);
  };
};



 */
export const truncateStr = (str: string, n = 22) =>
  str.length > n ? str.substring(0, n) + "...." : str;

export const isNameExits = (folderArr: [] = [], name: string) =>
  folderArr.some((folder: IFile) => folder.name === name);