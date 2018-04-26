import request, { requestParams2Url } from '../utils/request';

export async function getUser(params) {
  const url = requestParams2Url(params);
  return request(`/api/users${url}`, {
    method: 'GET',
  });
}

