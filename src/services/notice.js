import request from '../utils/request';

export async function getNotices(params) {
  return request(`/api/classes/Notices?where=${JSON.stringify(params)}&count=true`, {
    method: 'GET',
  });
}

export async function putNotice(params) {
  const { objectId, data } = params;
  return request(`/api/classes/Notices/${objectId}`, {
    method: 'PUT',
    headers: { 'X-Parse-Session-Token': localStorage.token },
    body: data,
  });
}
