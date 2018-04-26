import { stringify } from 'qs';
import request, {requestParams2Url} from '../utils/request';
import _ from 'lodash';

export async function getCity(params) {
  return request(`/api/classes/City${requestParams2Url(params)}`, {
    method: 'GET',
  });
}
