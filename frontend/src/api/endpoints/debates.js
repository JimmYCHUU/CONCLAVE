import client from '../client'

export const getDebate = (sessionId) => client.get(`/debates/${sessionId}`).then(r => r.data)
export const getDebates = (conclaveId, page = 1) => client.get(`/conclaves/${conclaveId}/debates?page=${page}`).then(r => r.data)
export const getBranches = (sessionId) => client.get(`/debates/${sessionId}/branches`).then(r => r.data)
export const resolvePrediction = (predictionId, outcome) => client.patch(`/predictions/${predictionId}/resolve`, { outcome }).then(r => r.data)
