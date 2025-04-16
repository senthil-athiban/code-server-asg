import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import "../../App.css";
import { buildFileTree, Directory, File, findFileByName, Type } from "../../utils/file-manager";
import Sidebar from "../sidebar";
import { FileTree } from "../filetree";
import { Code } from "./code";
import { Socket } from "socket.io-client";

interface FilePanelProps {
  files: any[];
  setfiles: React.Dispatch<React.SetStateAction<File[]>>;
  socket: Socket | undefined;
}
const FilePanel: React.FC<FilePanelProps> = ({ files, setfiles , socket}) => {

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  const onSelectFile = (file: File) => {
    socket?.emit('fetchFile', file.path);
    socket?.on('fileContent', (data) => {
      if(data.success) {
        setfiles((p) => {
          const updatedFiles = [...p];
          const fileIndex = updatedFiles.findIndex((f) => f.path === data.path);
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            content: data.content
          }
          return updatedFiles;
        })
        file.content = data.content;
        setSelectedFile(file);
      }
    }); 
  }

  const onSelectDir = (file: File) => { 
    socket?.emit('fetchDir', file.path);
    socket?.on('dirContent', (data) => {
      setfiles((p) => {
        const updatedFiles = [...p, ...data.files];
        return updatedFiles.filter((file, index, self) => index === self.findIndex((f) => f.path === file.path))
      })
    })
  }

  const onSelect = (file: File) => {
    if(file.type === Type.DIRECTORY) {
      onSelectDir(file);
    } else if (file.type === Type.FILE) {
      onSelectFile(file)
    }
  }

  const updateFileContent = (value: string) => {
    socket?.emit('updateFile', {
      filePath: selectedFile?.path,
      content: value
    })
  }

  useEffect(() => {
    if(!selectedFile) {
      if(rootDir.files[0]) onSelect(rootDir.files[0]);
    }
  },[selectedFile, rootDir])

  return (
    <div>
      <Main>
        <Sidebar>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>
        <Code selectedFile={selectedFile} updateFile={updateFileContent} />
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;

export default FilePanel;
