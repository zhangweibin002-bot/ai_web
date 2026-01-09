import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取智能体列表
export const getAgents = () => {
  return api.get('/agents')
}

// 获取单个智能体详情
export const getAgentDetail = (agentId) => {
  return api.get(`/agents/${agentId}`)
}

// 创建新智能体
export const createAgent = (data) => {
  return api.post('/agents', data)
}

// 更新智能体
export const updateAgent = (agentId, data) => {
  return api.put(`/agents/${agentId}`, data)
}

// 删除智能体
export const deleteAgent = (agentId) => {
  return api.delete(`/agents/${agentId}`)
}

// 流式发送消息（SSE）
export const streamChat = async (message, sessionId, agentId = null, onUpdate, onDone, onError) => {
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    const apiBase = baseURL || '/api/v1'
    const body = { message }
    if (sessionId) {
      body.session_id = sessionId
    }
    if (agentId) {
      body.agent_id = agentId
    }
    
    const response = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理最后的数据
        if (buffer.trim()) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content') {
                  fullContent += data.content || ''
                  if (onUpdate) {
                    onUpdate({ type: 'content', content: fullContent, delta: data.content })
                  }
                }
              } catch (e) {
                console.error('解析最后数据错误:', e)
              }
            }
          }
        }
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine === '') continue
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6) // 移除 'data: ' 前缀
            const data = JSON.parse(jsonStr)
            
            if (data.type === 'session') {
              // 会话信息更新（包含 session_id, agent_id, agent_name, is_new_session）
              if (onUpdate) {
                onUpdate({ 
                  type: 'session', 
                  session_id: data.session_id,
                  agent_id: data.agent_id,
                  agent_name: data.agent_name,
                  is_new_session: data.is_new_session
                })
              }
            } else if (data.type === 'content') {
              fullContent += data.content || ''
              // 实时更新 UI
              if (onUpdate) {
                onUpdate({ type: 'content', content: fullContent, delta: data.content })
              }
            } else if (data.type === 'done') {
              if (onDone) {
                onDone(fullContent)
              }
              return fullContent
            } else if (data.type === 'error') {
              throw new Error(data.error || '流式响应错误')
            }
          } catch (parseError) {
            // 如果不是 JSON，可能是纯文本数据
            if (trimmedLine.startsWith('data: ')) {
              const textContent = trimmedLine.slice(6)
              if (textContent) {
                fullContent += textContent
                if (onUpdate) {
                  onUpdate({ type: 'content', content: fullContent, delta: textContent })
                }
              }
            } else {
              console.error('解析流式数据错误:', parseError, '原始数据:', trimmedLine)
            }
          }
        }
      }
    }

    if (onDone) {
      onDone(fullContent)
    }
    return fullContent
  } catch (error) {
    console.error('流式请求错误:', error)
    if (onError) {
      onError(error)
    }
    throw error
  }
}

// 会话管理接口
// 创建新会话
export const createSession = (data = {}) => {
  return api.post('/sessions', data)
}

// 获取会话列表
export const getSessions = () => {
  return api.get('/sessions')
}

// 获取会话详情
export const getSessionDetail = (sessionId) => {
  return api.get(`/sessions/${sessionId}`)
}

// 获取会话消息历史
export const getSessionMessages = (sessionId) => {
  return api.get(`/sessions/${sessionId}/messages`)
}

// 更新会话标题
export const updateSessionTitle = (sessionId, title) => {
  return api.patch(`/sessions/${sessionId}`, { title })
}

// 删除会话
export const deleteSession = (sessionId) => {
  return api.delete(`/sessions/${sessionId}`)
}

// 健康检查（如果健康检查不在 /api/v1 下，需要单独配置）
export const healthCheck = () => {
  // 如果健康检查在根路径，使用 axios 直接请求
  return axios.get('/health')
}

export default api

