<template>
    <div class="flex h-screen w-full overflow-hidden bg-white">
        
        <!-- 左侧侧边栏 -->
        <aside class="w-72 border-r border-gray-100 flex flex-col hidden md:flex bg-[#f8f9fa]">
            <div class="p-5 space-y-3">
                <!-- 通用对话入口 -->
                <button @click="startGeneralChat" 
                        :class="['w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border group shadow-sm', 
                                currentView === 'chat' && !isAgentMode ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400']">
                    <i class="ri-chat-smile-2-line text-lg"></i>
                    <span class="text-sm font-semibold">通用对话</span>
                </button>
                
                <!-- 智能体中心入口 -->
                <button @click="currentView = 'agents'" 
                        :class="['w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all border group shadow-sm', 
                                currentView === 'agents' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400']">
                    <span class="text-sm font-semibold">智能体中心</span>
                    <i class="ri-apps-2-line text-gray-400 group-hover:text-black" :class="{'group-hover:text-white': currentView === 'agents'}"></i>
                </button>
            </div>

            <nav class="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
                <div class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2">最近对话</div>
                <div v-for="i in 2" :key="i" 
                     @click="currentView = 'chat'"
                     class="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-sm hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100">
                    <i class="ri-history-line text-gray-400"></i>
                    <span class="flex-1 truncate text-gray-600 font-medium">历史会话记录 #{{ i }}</span>
                </div>
            </nav>

            <div class="p-5 border-t border-gray-100">
                <div class="flex items-center gap-3 p-2 rounded-2xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-100">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">A</div>
                    <div class="flex-1 overflow-hidden text-sm">
                        <p class="font-bold text-gray-800 truncate">Alex Chen</p>
                        <p class="text-[10px] text-gray-400 font-medium tracking-tight">PRO ACCOUNT</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 flex flex-col relative overflow-hidden bg-white">
            
            <transition name="fade" mode="out-in">
                <!-- 场景 1: 智能体中心 (发现页) -->
                <div v-if="currentView === 'agents'" key="agents" class="flex-1 overflow-y-auto no-scrollbar p-8 md:p-16">
                    <div class="max-w-5xl mx-auto">
                        <header class="mb-12">
                            <h1 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">探索智能体</h1>
                            <p class="text-lg text-gray-500 max-w-2xl leading-relaxed">选择一个具有特定领域知识的助手，在写作、编程、设计或法律等专业任务中获得更好的表现。</p>
                        </header>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="agent in agents" :key="agent.name" 
                                 @click="selectAgent(agent)"
                                 class="agent-card-zoom group p-7 rounded-[2rem] border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:border-gray-200 cursor-pointer transition-all">
                                <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-8 text-white shadow-xl', agent.color]">
                                    <i :class="[agent.icon, 'text-3xl']"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-black transition-colors">{{ agent.name }}</h3>
                                <p class="text-sm text-gray-500 leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2">{{ agent.longDesc }}</p>
                                <div class="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
                                    立即启用 <i class="ri-arrow-right-up-line ml-2"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 场景 2: 对话界面 (通用 & 智能体共用) -->
                <div v-else-if="currentView === 'chat'" key="chat" class="flex-1 flex flex-col relative h-full">
                    <!-- 顶部导航 -->
                    <header class="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0 bg-white/80 backdrop-blur-md z-10">
                        <div class="flex items-center gap-4">
                            <!-- 只有在智能体模式下显示返回按钮 -->
                            <button v-if="isAgentMode" @click="currentView = 'agents'" class="p-2 -ml-2 text-gray-400 hover:text-black transition-colors" title="回到列表">
                                <i class="ri-arrow-left-s-line text-2xl"></i>
                            </button>
                            <div class="flex items-center gap-3">
                                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm', isAgentMode ? currentAgent.color : 'bg-black']">
                                    <i :class="isAgentMode ? currentAgent.icon : 'ri-chat-smile-2-fill'" class="text-xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-sm font-bold text-gray-900 leading-none">{{ isAgentMode ? currentAgent.name : '通用对话' }}</h2>
                                    <p class="text-[10px] text-gray-400 mt-1 font-medium">{{ isAgentMode ? '专业模式已激活' : '标准智能引擎' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button @click="clearMessages" class="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-red-500 rounded-xl transition-all" title="重置会话"><i class="ri-refresh-line"></i></button>
                            <button class="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-black rounded-xl transition-all"><i class="ri-share-line"></i></button>
                        </div>
                    </header>

                    <!-- 消息列表 -->
                    <div ref="scrollBox" class="flex-1 overflow-y-auto no-scrollbar pt-8 pb-44">
                        <div class="max-w-3xl mx-auto px-6 space-y-10">
                            <!-- 欢迎提示 (仅空消息时显示) -->
                            <div v-if="messages.length === 0" class="py-20 text-center space-y-4">
                                <div :class="['w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl mb-6', isAgentMode ? currentAgent.color : 'bg-black']">
                                    <i :class="isAgentMode ? currentAgent.icon : 'ri-chat-smile-2-fill'" class="text-3xl"></i>
                                </div>
                                <h3 class="text-xl font-bold text-gray-900">有什么我可以帮您的？</h3>
                                <p class="text-gray-400 text-sm max-w-xs mx-auto">输入任何问题，开启与 {{ isAgentMode ? currentAgent.name : 'AI' }} 的智能对话。</p>
                            </div>

                            <transition-group name="message">
                                <div v-for="(msg, index) in messages" :key="index" 
                                     :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                                    <div :class="['flex gap-5 max-w-[88%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
                                        <div class="flex-shrink-0 mt-1">
                                            <div v-if="msg.role === 'assistant'" :class="['w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md', isAgentMode ? currentAgent.color : 'bg-black']">
                                                <i :class="isAgentMode ? currentAgent.icon : 'ri-chat-smile-2-fill'" class="text-lg"></i>
                                            </div>
                                            <div v-else class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                <i class="ri-user-fill text-lg"></i>
                                            </div>
                                        </div>
                                        <div :class="['flex flex-col gap-2', msg.role === 'user' ? 'items-end' : 'items-start']">
                                            <div :class="[
                                                'px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all border',
                                                msg.role === 'user' 
                                                    ? 'bg-black text-white border-black rounded-tr-none' 
                                                    : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                                            ]">
                                                {{ msg.content }}
                                            </div>
                                            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">{{ msg.time }}</span>
                                        </div>
                                    </div>
                                </div>
                            </transition-group>

                            <div v-if="isTyping" class="flex justify-start items-center gap-4 animate-pulse">
                                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center text-white opacity-40', isAgentMode ? currentAgent.color : 'bg-black']">
                                    <i :class="isAgentMode ? currentAgent.icon : 'ri-chat-smile-2-fill'"></i>
                                </div>
                                <span class="text-xs text-gray-300 font-bold tracking-widest uppercase italic">Thinking...</span>
                            </div>
                        </div>
                    </div>

                    <!-- 输入区域 -->
                    <div class="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
                        <div class="max-w-3xl mx-auto pointer-events-auto">
                            <div class="input-blur-bg rounded-[2rem] border border-gray-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-2.5 flex items-end gap-2 focus-within:border-gray-400 transition-all">
                                <button class="p-3 text-gray-400 hover:text-black transition-colors"><i class="ri-attachment-line text-2xl"></i></button>
                                <textarea 
                                    v-model="input"
                                    @keydown.enter.prevent="handleSend"
                                    rows="1"
                                    @input="autoResize"
                                    ref="inputArea"
                                    :placeholder="isAgentMode ? `向 ${currentAgent.name} 提问...` : '输入您的问题...'"
                                    class="flex-1 py-3 px-1 bg-transparent border-none focus:ring-0 text-[15px] resize-none max-h-48 no-scrollbar outline-none text-gray-800 placeholder-gray-300 font-medium"
                                ></textarea>
                                <button 
                                    @click="handleSend"
                                    :disabled="!input.trim() || isTyping"
                                    :class="[
                                        'w-12 h-12 rounded-2xl transition-all flex items-center justify-center mb-0.5 mr-0.5',
                                        input.trim() && !isTyping ? 'bg-black text-white hover:bg-gray-800 shadow-lg' : 'bg-gray-50 text-gray-200'
                                    ]"
                                >
                                    <i class="ri-arrow-up-line text-2xl font-bold"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getAgents, sendGeneralMessage, sendAgentMessage, resetSession } from './api/index.js'

const currentView = ref('chat')
const isAgentMode = ref(false)
const input = ref('')
const isTyping = ref(false)
const scrollBox = ref(null)
const inputArea = ref(null)
const agents = ref([])
const currentAgent = ref(null)
const messages = ref([
    {
        role: 'assistant',
        content: '您好，新会话已开启。我是您的通用智能助手，有什么我可以帮您的？',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
])

// 加载智能体列表
onMounted(async () => {
    try {
        const response = await getAgents()
        agents.value = response.data.agents
    } catch (error) {
        console.error('加载智能体列表失败:', error)
        // 如果 API 失败，使用默认数据
        agents.value = [
            { name: '写作大师', desc: '文案创作', longDesc: '擅长撰写博客、小说、周报及各类创意文案，为您提供无限灵感与精准表达。', icon: 'ri-quill-pen-fill', color: 'bg-orange-500' },
            { name: '架构专家', desc: '编程调试', longDesc: '精通多门编程语言，为您优化代码结构、排查 Bug 并提供工业级的技术方案。', icon: 'ri-terminal-box-fill', color: 'bg-blue-600' },
            { name: '美学助手', desc: '图像设计', longDesc: '理解审美潮流，辅助您进行色彩搭配、UI 设计建议及 Stable Diffusion 提示词生成。', icon: 'ri-palette-fill', color: 'bg-purple-500' },
            { name: '逻辑大脑', desc: '数据分析', longDesc: '高效处理复杂表格与逻辑问题，为您提供清晰直观的数据洞察与决策支持。', icon: 'ri-brain-fill', color: 'bg-emerald-500' },
            { name: '翻译专家', desc: '多语互译', longDesc: '提供信达雅的专业翻译服务，支持数十种语言的实时地道互译与文化润色。', icon: 'ri-global-fill', color: 'bg-rose-500' },
            { name: '法律助手', desc: '合同研读', longDesc: '快速解析法律条文，提供合同建议与合规评估，是您的随身法律顾问。', icon: 'ri-scales-3-fill', color: 'bg-cyan-600' }
        ]
    }
})

// 切换到通用对话
const startGeneralChat = async () => {
    isAgentMode.value = false
    currentAgent.value = null
    currentView.value = 'chat'
    
    try {
        await resetSession(null)
    } catch (error) {
        console.error('重置会话失败:', error)
    }
    
    messages.value = [{
        role: 'assistant',
        content: '您好！我是通用智能助手。今天想聊点什么？',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
    scrollToBottom()
}

// 选择特定智能体
const selectAgent = async (agent) => {
    currentAgent.value = agent
    isAgentMode.value = true
    
    try {
        await resetSession(agent.name)
    } catch (error) {
        console.error('重置会话失败:', error)
    }
    
    messages.value = [{
        role: 'assistant',
        content: `你好！我是 [${agent.name}]。我已经准备好为您提供专业领域的深度支持了。`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]
    currentView.value = 'chat'
    scrollToBottom()
}

const autoResize = () => {
    const el = inputArea.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
}

const scrollToBottom = async () => {
    await nextTick()
    if (scrollBox.value) {
        scrollBox.value.scrollTop = scrollBox.value.scrollHeight
    }
}

const handleSend = async () => {
    if (!input.value.trim() || isTyping.value) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    messages.value.push({
        role: 'user',
        content: input.value,
        time: timeStr
    })

    const userQuery = input.value
    input.value = ''
    if (inputArea.value) inputArea.value.style.height = 'auto'
    
    scrollToBottom()
    await sendMessage(userQuery)
}

const sendMessage = async (query) => {
    isTyping.value = true
    try {
        let response
        if (isAgentMode.value) {
            response = await sendAgentMessage(currentAgent.value.name, query)
        } else {
            response = await sendGeneralMessage(query)
        }
        
        isTyping.value = false
        const prefix = isAgentMode.value ? `[${currentAgent.value.name}] ` : ''
        messages.value.push({
            role: 'assistant',
            content: response.data.message || `${prefix}已收到您的消息："${query}"。我将基于当前的知识库为您生成最佳回答...`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
    } catch (error) {
        isTyping.value = false
        console.error('发送消息失败:', error)
        const prefix = isAgentMode.value ? `[${currentAgent.value.name}] ` : ''
        messages.value.push({
            role: 'assistant',
            content: `${prefix}抱歉，处理您的消息时出现了错误。请稍后重试。`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
    }
}

const clearMessages = async () => {
    if (isAgentMode.value) {
        await selectAgent(currentAgent.value)
    } else {
        await startGeneralChat()
    }
}
</script>

