import client from '../client'

export const getAgents = (conclaveId) => client.get(`/conclaves/${conclaveId}/agents`).then(r => r.data)
export const getAgent = (conclaveId, agentId) => client.get(`/conclaves/${conclaveId}/agents/${agentId}`).then(r => r.data)
export const messageAgent = (conclaveId, agentId, message) => client.post(`/conclaves/${conclaveId}/agents/${agentId}/message`, { message }).then(r => r.data)
