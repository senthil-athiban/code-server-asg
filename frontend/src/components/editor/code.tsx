import React from 'react'
import Editor from "@monaco-editor/react";
import styled from "@emotion/styled";
import { File } from '../../utils/file-manager';

interface CodeProps {
  selectedFile: File | undefined;
  updateFile: (value: string) => void;
}
export const Code = ({ selectedFile, updateFile }: CodeProps) => {
  if (!selectedFile)
    return null

  const code = selectedFile.content
  let language = selectedFile.name.split('.').pop()

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"

  

  console.log('selected file:', selectedFile.content);

  return (
    <Div>
      <Editor
        height="100vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(val) => updateFile(val)}
      />
    </Div>
  )
}

const Div = styled.div`
  width: calc(100% - 250px);
  margin: 0;
  font-size: 16px;
`
