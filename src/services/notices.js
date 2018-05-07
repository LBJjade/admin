import { stringify } from 'qs';
import request from '../utils/request';

export async function getInformation(params) {
  return request(`/api/classes/Notices?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function putInformation(params) {
  const editid = params.objectId;
  const data = params.fields;
  request(`/api/classes/Notices/${editid}`, {
    method: 'PUT',
    body: data,
  });
}

