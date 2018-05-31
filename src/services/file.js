import _ from 'lodash';
import request, { requestParams2Url } from '../utils/request';

export async function deleteFileStorage(fileName) {
  return request((`/api/files/${fileName}`), {
    method: 'DELETE',
  });
}

// --------------------------
export async function getFile(params) {
  const url = requestParams2Url(params);
  return request(`/api/classes/File${url}`, {
    method: 'GET',
  });
}

export async function postFile(params) {
  return request('/api/classes/File', {
    method: 'POST',
    body: params,
  });
}

export async function putFile(params) {
  const param = _.clone(params);
  const { objectId } = param;
  delete param.objectId;
  return request(`/api/classes/File/${objectId}`, {
    method: 'PUT',
    body: param,
  });
}

export async function deleteFile(params) {
  return request(`/api/classes/File/${params.objectId}`, {
    method: 'DELETE',
  });
}
