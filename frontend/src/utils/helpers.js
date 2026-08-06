export const getErrorMessage = (error) => {
  return error.response?.data?.error || error.message || 'Error desconocido';
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));