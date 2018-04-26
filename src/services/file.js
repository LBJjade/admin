import request from '../utils/request';

export async function deleteFile(fileName) {
  return request((`/api/files/${fileName}`), {
    method: 'DELETE',
  });
}
