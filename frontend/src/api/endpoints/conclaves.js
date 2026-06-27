import client from '../client'

export const createConclave = (data) => client.post('/conclaves/', data).then(r => r.data)
export const getMyConclave = () => client.get('/conclaves/my').then(r => r.data)
export const getBrief = (id) => client.get(`/conclaves/${id}/brief`).then(r => r.data)
export const getBriefHistory = (id, page = 1) => client.get(`/conclaves/${id}/brief/history?page=${page}`).then(r => r.data)
export const injectScenario = (id, scenario) => client.post(`/conclaves/${id}/inject`, { scenario }).then(r => r.data)
export const updateConclave = (id, data) => client.patch(`/conclaves/${id}`, data).then(r => r.data)
