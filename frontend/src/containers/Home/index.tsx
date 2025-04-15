import styled from '@emotion/styled'
import axios from 'axios';
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { BACKEND_DOMAIN } from '../../config/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Div = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #282c34;
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  `;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  row-gap: 10px;
  `;

  const Button = styled.button`
  background-color: #61dafb;
  color: #282c34;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #21a1f1;
  }
  `;

  
const HomePage = () => {
    const [projectTitle, setProjectTitle] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const projectId = uuidv4(); 
        const language = (e.target as HTMLFormElement).language.value;
        const data = {
            projectTitle,
            projectId,
            language
        }
        
        try {
            const res = await axios.post(`${BACKEND_DOMAIN}/api/v1/machine/create`, data);
            if (res.status === 200) {
                navigate(`/coding/${projectId}`);
                toast.success('Project created successfully');
            }
        } catch (error) {
            toast.error('Error creating project');
            console.error('Error creating project:', error);
        }
    }

    return (
        <Div>
            <h2>WelCome to Pro Code</h2>
            <FormContainer onSubmit={onSubmit}>
                    
                    <input type="text" placeholder='project title' onChange={(e) => setProjectTitle(e.target.value)} />
                    <select name="language" id="lang">
                        <option value="python">Python</option>
                        <option value="javascript">Javascript</option>
                        <option value="node-js">Node js</option>
                    </select>
                    <Button type="submit">Create project</Button>
            </FormContainer>
        </Div>
    )
}

export default HomePage