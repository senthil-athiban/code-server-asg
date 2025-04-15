import React, { useState } from "react";
import styled from "@emotion/styled";
import "../../App.css";
import { Directory, File, findFileByName, Type } from "../../utils/file-manager";
import { useFilesFromSandbox } from "../../utils";
import Sidebar from "../sidebar";
import { FileTree } from "../filetree";
import { Code } from "./code";

const CURRENT_SANDBOX_ID = "ww9kis";

const dummyDir: Directory = {
  id: "1",
  name: "loading...",
  type: Type.DUMMY,
  parentId: undefined,
  depth: 0,
  dirs: [],
  files: []
};

const FilePanel = () => {
  const [rootDir, setRootDir] = useState(dummyDir);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  console.log('rootDir', rootDir);
  useFilesFromSandbox(CURRENT_SANDBOX_ID, (root) => {
    console.log('root:', root);
    if (!selectedFile) {
      setSelectedFile(findFileByName(root, "index.tsx"));
    }
    setRootDir(root);
  });

  const onSelect = (file: File) => setSelectedFile(file);

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
        <Code selectedFile={selectedFile} />
      </Main>
    </div>
  );
};

const Main = styled.main`
  display: flex;
`;

export default FilePanel;
