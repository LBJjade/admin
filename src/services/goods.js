import _ from 'lodash';
import request, { requestParams2Url } from '../utils/request';

export async function getCategory(params) {
  const url = requestParams2Url(params);
  return request(`/api/classes/Category${url}`, {
    method: 'GET',
  });
}

export async function postCategory(params) {
  return request('/api/classes/Category', {
    method: 'POST',
    body: params,
  });
}

export async function putCategory(params) {
  const param = _.clone(params);
  const { objectId } = param;
  delete param.objectId;
  return request(`/api/classes/Category/${objectId}`, {
    method: 'PUT',
    body: param,
  });
}

export async function deleteCategory(params) {
  return request(`/api/classes/Category/${params.objectId}`, {
    method: 'DELETE',
  });
}

