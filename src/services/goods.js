import _ from 'lodash';
import request, { requestParams2Url } from '../utils/request';

// Category API
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

// Spec API
export async function getSpec(params) {
  const url = requestParams2Url(params);
  return request(`/api/classes/Spec${url}`, {
    method: 'GET',
  });
}

export async function postSpec(params) {
  return request('/api/classes/Spec', {
    method: 'POST',
    body: params,
  });
}

export async function putSpec(params) {
  const param = _.clone(params);
  const { objectId } = param;
  delete param.objectId;
  return request(`/api/classes/Spec/${objectId}`, {
    method: 'PUT',
    body: param,
  });
}

export async function deleteSpec(params) {
  return request(`/api/classes/Spec/${params.objectId}`, {
    method: 'DELETE',
  });
}

// CategorySpec API
export async function getCategorySpec(params) {
  const url = requestParams2Url(params);
  return request(`/api/classes/CategorySpec${url}`, {
    method: 'GET',
  });
}

export async function postCategorySpec(params) {
  return request('/api/classes/CategorySpec', {
    method: 'POST',
    body: params,
  });
}

export async function putCategorySpec(params) {
  const param = _.clone(params);
  const { objectId } = param;
  delete param.objectId;
  return request(`/api/classes/CategorySpec/${objectId}`, {
    method: 'PUT',
    body: param,
  });
}

export async function deleteCategorySpec(params) {
  return request(`/api/classes/CategorySpec/${params.objectId}`, {
    method: 'DELETE',
  });
}

// Goods API
export async function getGoods(params) {
  const url = requestParams2Url(params);
  return request(`/api/classes/Goods${url}`, {
    method: 'GET',
  });
}
