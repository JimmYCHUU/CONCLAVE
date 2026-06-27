import client from '../client'

export const addDocument = (conclaveId, data) => client.post(`/conclaves/${conclaveId}/documents`, data).then(r => r.data)
export const getDocuments = (conclaveId) => client.get(`/conclaves/${conclaveId}/documents`).then(r => r.data)
