import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取智能体列表
export const getAgents = () => {
  return api.get('/agents')
}

// 发送消息（通用对话）
export const sendGeneralMessage = (message) => {
  return api.post('/chat/general', { message })
}

// 发送消息（智能体模式）
export const sendAgentMessage = (agentName, message) => {
  return api.post('/chat/agent', { agentName, message })
}

// 重置会话
export const resetSession = (agentName) => {
  return api.post('/chat/reset', { agentName })
}

export default api

