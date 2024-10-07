export const createPipeline = async (pipeline: any): Promise<any> => {
  const response = await fetch('/api/pipelines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pipeline),
  });
  return response.json();
};

export const deletePipeline = async (nodeId: string): Promise<any> => {
  const response = await fetch(`/api/pipelines/${nodeId}`, {
    method: 'DELETE',
  });
  return response.json();
};
