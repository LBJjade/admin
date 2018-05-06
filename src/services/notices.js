import { stringify } from 'qs';
import request from '../utils/request';

export async function getInformation(params) {
  return request(`/api/classes/notices?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function putInformation(params) {
  const editid = params.ojId;
  const data = params.fields;
  request(`/api/classes/notices/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

