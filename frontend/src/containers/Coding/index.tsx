import React, { useEffect, useState } from 'react'
import useSocket from '../../hooks/useSocket'
import { useParams } from 'react-router-dom'
import FilePanel from '../../components/editor/file-panel';

const CodingPage = () => {
  const { projectId } = useParams();
  const [files, setfiles] = useState([]);
  const socket = useSocket(projectId as string);

  useEffect(() => {
    if(!socket) return;
    socket.on('project', (data) => {  
      console.log('Project data:', data);
      setfiles(data.root);
    }
    )
  },[socket])
  return (
    <div><FilePanel /></div>
  )
}

export default CodingPage