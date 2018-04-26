import request, { requestParams2Url } from '../utils/request';
import _ from 'lodash';

export async function getIntention(params) {
  return request((`/api/classes/Intention${requestParams2Url(params)}`), {
    method: 'GET',
  });
}

export async function getAnalysisField(params) {
  return request((`/api/classes/AnalysisField${requestParams2Url(params)}`), {
    method: 'GET',
  });
}

export async function getAnalysisRule(params) {
  return request((`/api/classes/AnalysisRule${requestParams2Url(params)}`), {
    method: 'GET',
  });
}

export async function postAnalysisRule(params) {
  return request(('/api/classes/AnalysisRule'), {
    method: 'POST',
    body: params,
  });
}

export async function putAnalysisRule(params) {
  const param = _.clone(params);
  const objectId = param.objectId;
  delete param.objectId;
  return request((`/api/classes/AnalysisRule/${objectId}`), {
    method: 'PUT',
    body: param,
  });
}

export async function deleteAnalysisRule(params) {
  return request((`/api/classes/AnalysisRule/${params.objectId}`), {
    method: 'DELETE',
  });
}
