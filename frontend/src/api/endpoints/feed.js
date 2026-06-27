import client from '../client'

export const getFeed = (page = 1) => client.get(`/feed/?page=${page}`).then(r => r.data)
export const followConclave = (conclaveId) => client.post(`/feed/${conclaveId}/follow`).then(r => r.data)
