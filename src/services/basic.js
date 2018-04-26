/* eslint-disable no-plusplus,keyword-spacing,semi,prefer-template,no-template-curly-in-string,array-callback-return,max-len,prefer-const,no-unused-vars,prefer-destructuring,no-undef,import/no-named-as-default,import/no-duplicates,quotes,no-useless-concat */
import { stringify } from 'qs';
import request, { requestParams2Url } from '../utils/request';

export async function getBrand(params) {
  return request(`/api/classes/Brand?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function postBrand(params) {
  return request('/api/classes/Brand', {
    method: 'POST',
    body: params,
  });
}

export async function putBrand(params) {
  let editid = params.ojId;
  let data = params.fields;
  request(`/api/classes/Brand/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

export async function brandBatchDelete(params) {
  for(let i = 0; i < params.length; i++) {
    request(`/api/classes/Brand/${params[i]}`, {
      method: 'DELETE',
    });
  }
}

export async function deleteBrand(params) {
  return request('/api/classes/Brand/' + params, {
    method: 'DELETE',
  });
}

export async function brandRequireQuery(params) {
  let url = requestParams2Url(params);
  return request(`/api/classes/Brand${url}`, {
    method: 'GET',
  });
}

export async function uploadLogo(params) {
  let require = `'where={${stringify(params)}}'`;
  return request('/api/classes/Brand/', {
    method: 'GET',
    data: require,
  }, 'where');
}

export async function getRegion(params) {
  return request("/api/classes/Region?include=pointerBrand&" + `${stringify(params)}`, {
    method: 'GET',
  });
}

export async function postRegion(params) {
  let data = Object.assign(params.fields, params.pointerBrand);
  return request('/api/classes/Region', {
    method: 'POST',
    body: data,
  });
}

// export async function putRegion(params) {
//   let editid = params.ojId;
//   let data1 = params.fields;
//   // let data = Object.assign(params.fields, params.pointerBrand);
//   request(`/api/classes/Region/${editid}`, {
//     method: 'PUT',
//     body: data1,
//   });
// }

export async function putRegion(params) {
  let editid = params.ojId;
  // let data = params.fields;
  let data = Object.assign(params.fields, params.pointerBrand);
  request(`/api/classes/Region/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteRegion(params) {
  return request('/api/classes/Region/' + params, {
    method: 'DELETE',
  });
}

export async function regionRequireQuery(params) {
  let url = requestParams2Url(params);
  return request(`/api/classes/Region${url}`, {
    method: 'GET',
  });
}

export async function getDistrict(params) {
  return request("/api/classes/District?include=pointerBrand&include=pointerRegion&" + `${stringify(params)}`, {
    method: 'GET',
  });
}

export async function postDistrict(params) {
  let data = Object.assign(params.fields, params.pointerBrand, params.pointerRegion);
  return request('/api/classes/District', {
    method: 'POST',
    body: data,
  });
}

export async function putDistrict(params) {
  let editid = params.ojId;
  // let data = params.fields;
  let data = Object.assign(params.fields, params.pointerBrand, params.pointerRegion);
  request(`/api/classes/District/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

export async function districtBatchDelete(params) {
  for(let i = 0; i < params.length; i++) {
    request(`/api/classes/Brand/${params[i]}`, {
      method: 'DELETE',
    });
  }
}

export async function deleteDistrict(params) {
  return request('/api/classes/District/' + params, {
    method: 'DELETE',
  });
}

export async function districtRequireQuery(params) {
  let url = requestParams2Url(params);
  return request(`/api/classes/District${url}`, {
    method: 'GET',
  });
}

export async function getShop(params) {
  return request(`/api/classes/Shop?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function postShop(params) {
  return request('/api/classes/Shop', {
    method: 'POST',
    body: params,
  });
}

export async function putShop(params) {
  let editid = params.ojId;
  let data = params.fields;
  request(`/api/classes/Shop/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

export async function shopBatchDelete(params) {
  for(let i = 0; i < params.length; i++) {
    request(`/api/classes/Shop/${params[i]}`, {
      method: 'DELETE',
    });
  }
}

export async function deleteShop(params) {
  return request('/api/classes/Shop/' + params, {
    method: 'DELETE',
  });
}

export async function shopRequireQuery(params) {
  let url = requestParams2Url(params);
  return request(`/api/classes/Shop${url}`, {
    method: 'GET',
  });
}

export async function shopQuery(params) {
  return request(`/api/classes/Shop?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function shopAdd(params) {
  return request('/api/classes/Shop', {
    method: 'POST',
    body: params,
  });
}

export async function shopEdit(params) {
  let editid = params.eidtId;
  let data = params.fields;
  return request(`/api/classes/Shop/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

export async function shopDelete(params) {
  return request('/api/classes/Shop/' + params, {
    method: 'DELETE',
  });
}

