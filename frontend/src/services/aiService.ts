import axios from 'axios';

const aiApi = axios.create({
  baseURL: 'http://localhost:8081/api/ai',
});

export const parseResumeAndMatch = async (jobId: number, resumeFile: File) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobId', jobId.toString());

  const response = await aiApi.post('/parse-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // Returns match score & parsed summary
};