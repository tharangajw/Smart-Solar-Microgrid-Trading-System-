import operatorApi from './operatorApi';

/** Authenticates a user and persists the returned session details. */
export const loginUser = async (email, password) => {
  const response = await operatorApi.post('/auth/login', { email, password });
  const { token, userId, role, fullName } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({ userId, email, role, fullName }));
  return response;
};
