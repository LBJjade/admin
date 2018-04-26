// import { stringify } from 'qs';
import request from '../utils/request';

export async function getActivities() {
  return request('/api/classes/activities', {
    method: 'GET',
  });
}
