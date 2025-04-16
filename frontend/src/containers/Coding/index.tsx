import React, { useEffect, useMemo, useState } from 'react'
import useSocket from '../../hooks/useSocket'
import { useParams } from 'react-router-dom'
import FilePanel from '../../components/editor/file-panel';
import { File } from '../../utils/file-manager';

const CodingPage = () => {
  const { projectId } = useParams();
  const [files, setfiles] = useState<Array<File>>([]);
  const socket = useSocket(projectId as string);

  useEffect(() => {
    if (!socket) return;
    socket.on('project', (data) => {
      setfiles(data.root);
    });
  }, [socket]);

  return (
    <><FilePanel files={files} setfiles={setfiles} socket={socket} /></>
  )
}

export default CodingPage