<template>
    <div class="flex h-screen w-full overflow-hidden bg-white text-gray-900">
        
        <!-- 左侧侧边栏 -->
        <aside :class="['sidebar-transition border-r border-gray-100 flex flex-col bg-[#f8f9fa] relative z-20', isSidebarCollapsed ? 'w-20' : 'w-72']">
            <button @click="isSidebarCollapsed = !isSidebarCollapsed" 
                    class="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-black shadow-sm z-30 transition-all">
                <i :class="isSidebarCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'"></i>
            </button>

            <div class="p-4 space-y-4">
                <button @click="startGeneralChat" 
                        :class="['w-full flex items-center rounded-2xl transition-all border group shadow-sm overflow-hidden', 
                                isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                                currentView === 'chat' && !isAgentMode ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400']">
                    <i class="ri-chat-smile-2-line text-xl"></i>
                    <span v-if="!isSidebarCollapsed" class="text-sm font-semibold whitespace-nowrap">通用对话</span>
                </button>
                
                <button @click="currentView = 'agents'" 
                        :class="['w-full flex items-center rounded-2xl transition-all border group shadow-sm overflow-hidden', 
                                isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3',
                                currentView === 'agents' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400']">
                    <div class="flex items-center gap-3">
                        <i class="ri-apps-2-line text-xl"></i>
                        <span v-if="!isSidebarCollapsed" class="text-sm font-semibold whitespace-nowrap">智能体中心</span>
                    </div>
                </button>
            </div>

            <nav class="flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
                <div v-if="!isSidebarCollapsed" class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center justify-between">
                    <span>最近对话</span>
                    <button @click.stop="loadSessions" class="text-gray-300 hover:text-gray-500 transition-colors" title="刷新">
                        <i class="ri-refresh-line text-xs"></i>
                    </button>
                </div>
                <div v-for="session in sessions" :key="session.id" 
                     @click="loadSession(session.id)"
                     class="group flex items-center rounded-xl cursor-pointer transition-all text-sm hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 relative"
                     :class="[
                         isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                         sessionId === session.id ? 'bg-white shadow-sm border-gray-200' : ''
                     ]">
                    <i class="ri-history-line text-gray-400 flex-shrink-0"></i>
                    <div v-if="!isSidebarCollapsed" class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="flex-1 truncate text-gray-600 font-medium">{{ session.title || '未命名会话' }}</span>
                            <button @click.stop="openEditTitleModal(session)" 
                                    class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-600 transition-all flex-shrink-0" 
                                    title="编辑标题">
                                <i class="ri-edit-line text-xs"></i>
                            </button>
                            <button @click.stop="handleDeleteSession(session.id)" 
                                    class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0" 
                                    title="删除">
                                <i class="ri-delete-bin-line text-xs"></i>
                            </button>
                        </div>
                        <p v-if="session.updated_at" class="text-[10px] text-gray-400 mt-0.5 truncate">{{ formatTime(session.updated_at) }}</p>
                    </div>
                </div>
                <div v-if="sessions.length === 0 && !isSidebarCollapsed" class="px-4 py-8 text-center">
                    <p class="text-xs text-gray-400">暂无会话记录</p>
                </div>
            </nav>

            <div class="p-4 border-t border-gray-100">
                <div class="flex items-center rounded-2xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-gray-100"
                     :class="isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-2'">
                    <div class="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">A</div>
                    <div v-if="!isSidebarCollapsed" class="flex-1 overflow-hidden text-sm">
                        <p class="font-bold text-gray-800 truncate">Alex Chen</p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pro</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 flex flex-col relative overflow-hidden bg-white">
            
            <transition name="fade" mode="out-in">
                <!-- 场景 1: 智能体中心 (卡片广场) -->
                <div v-if="currentView === 'agents'" key="agents" class="flex-1 overflow-y-auto no-scrollbar p-8 md:p-16">
                    <div class="max-w-5xl mx-auto">
                        <header class="mb-12 flex justify-between items-end">
                            <div>
                                <h1 class="text-4xl font-black text-gray-900 mb-4 tracking-tight">探索智能体</h1>
                                <p class="text-lg text-gray-500 max-w-2xl leading-relaxed font-medium">选择专门的助手，针对特定领域进行深度优化和高效协作。</p>
                            </div>
                        </header>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- 新建智能体按钮卡片 -->
                            <div @click="showCreateModal = true"
                                 class="group p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-4">
                                <div class="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-black group-hover:bg-white group-hover:shadow-md transition-all">
                                    <i class="ri-add-line text-3xl"></i>
                                </div>
                                <div class="space-y-1">
                                    <h3 class="text-lg font-bold text-gray-400 group-hover:text-black">新建智能体</h3>
                                    <p class="text-xs text-gray-300 font-medium">定制您的专属助手</p>
                                </div>
                            </div>

                            <!-- 智能体列表 -->
                            <div v-for="agent in agents" :key="agent.id" 
                                 class="group p-8 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all transform hover:-translate-y-1 relative">
                                <div @click="selectAgent(agent)" class="cursor-pointer">
                                    <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg', getAgentColor(agent.id)]">
                                        <i :class="[getAgentIcon(agent.id), 'text-3xl']"></i>
                                    </div>
                                    <div class="flex items-center gap-2 mb-2">
                                        <h3 class="text-xl font-bold text-gray-900">{{ agent.name }}</h3>
                                        <span :class="[
                                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                            agent.is_system 
                                                ? 'bg-blue-100 text-blue-600' 
                                                : 'bg-purple-100 text-purple-600'
                                        ]">
                                            {{ agent.is_system ? '系统' : '自定义' }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-400 leading-relaxed mb-8 h-10 overflow-hidden line-clamp-2 font-medium">{{ agent.description || '暂无描述' }}</p>
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-black transition-colors">
                                            进入对话 <i class="ri-arrow-right-up-line ml-2"></i>
                                        </div>
                                        <div v-if="agent.has_tools" class="flex items-center gap-1 text-xs text-gray-300">
                                            <i class="ri-tools-line"></i>
                                            <span>{{ agent.tool_count }}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- 编辑和删除按钮（仅自定义智能体显示） -->
                                <div v-if="!agent.is_system" class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click.stop="openEditAgentModal(agent)" 
                                            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                                            title="编辑">
                                        <i class="ri-edit-line"></i>
                                    </button>
                                    <button @click.stop="handleDeleteAgent(agent.id)" 
                                            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                            title="删除">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 场景 2: 对话界面 -->
                <div v-else-if="currentView === 'chat'" key="chat" class="flex-1 flex flex-col h-full overflow-hidden">
                    <header class="h-16 flex items-center justify-between px-6 shrink-0 z-20 border-b border-gray-50">
                        <div class="flex items-center gap-4">
                            <div v-if="messages.length > 0" class="flex items-center gap-3">
                                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm', isAgentMode && currentAgent ? getAgentColor(currentAgent.id) : 'bg-black']">
                                    <i :class="isAgentMode && currentAgent ? getAgentIcon(currentAgent.id) : 'ri-chat-smile-2-fill'" class="text-base"></i>
                                </div>
                                <h2 class="text-sm font-bold text-gray-900 leading-none tracking-tight">{{ isAgentMode && currentAgent ? currentAgent.name : '通用对话' }}</h2>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button v-if="messages.length > 0" @click="clearMessages" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"><i class="ri-refresh-line"></i></button>
                            <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-all"><i class="ri-more-2-line"></i></button>
                        </div>
                    </header>

                    <!-- 消息列表区域 - 可滚动 -->
                    <div ref="scrollBox" class="flex-1 overflow-y-auto no-scrollbar min-h-0">
                        <div class="max-w-3xl mx-auto px-6 py-6">
                            <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-8 py-12 min-h-[60vh]">
                                <div :class="['w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl animate-bounce-subtle', isAgentMode && currentAgent ? getAgentColor(currentAgent.id) : 'bg-black']">
                                    <i :class="isAgentMode && currentAgent ? getAgentIcon(currentAgent.id) : 'ri-chat-smile-2-fill'" class="text-4xl"></i>
                                </div>
                                <div class="space-y-3">
                                    <h3 class="text-2xl font-black text-gray-900 tracking-tight">你好，我是您的 AI 助手</h3>
                                    <p class="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                                        您可以直接在这里开始对话，或者选择下方推荐的专业智能体以获得更好的体验。
                                    </p>
                                </div>
                                <div class="grid grid-cols-2 gap-3 w-full max-w-md pt-4">
                                    <div v-for="agent in agents.slice(0, 4)" :key="agent.id" 
                                         @click="selectAgent(agent)"
                                         class="agent-card-mini flex items-center gap-3 p-3 rounded-2xl border border-gray-100 cursor-pointer transition-all">
                                        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white', getAgentColor(agent.id)]">
                                            <i :class="getAgentIcon(agent.id)" class="text-sm"></i>
                                        </div>
                                        <span class="text-xs font-bold text-gray-700">{{ agent.name }}</span>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="space-y-10 pb-6">
                                <transition-group name="message">
                                    <div v-for="(msg, index) in messages" :key="index" 
                                         :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']">
                                        <div :class="['flex gap-4 max-w-[88%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
                                            <div class="flex-shrink-0 mt-1">
                                                <div v-if="msg.role === 'assistant'" :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md', isAgentMode && currentAgent ? getAgentColor(currentAgent.id) : 'bg-black']">
                                                    <i :class="isAgentMode && currentAgent ? getAgentIcon(currentAgent.id) : 'ri-chat-smile-2-fill'" class="text-base"></i>
                                                </div>
                                                <div v-else class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                    <i class="ri-user-line"></i>
                                                </div>
                                            </div>
                                            <div :class="['flex flex-col gap-1.5', msg.role === 'user' ? 'items-end' : 'items-start']">
                                                <div :class="[
                                                    'px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all',
                                                    msg.role === 'user' 
                                                        ? 'bg-black text-white rounded-tr-none' 
                                                        : 'bg-[#f3f4f6] text-gray-800 rounded-tl-none'
                                                ]">
                                                    {{ msg.content }}
                                                </div>
                                                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{{ msg.time }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </transition-group>
                                <div v-if="isTyping" class="flex justify-start items-center gap-4 animate-pulse pb-4">
                                    <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-40', isAgentMode ? currentAgent.color : 'bg-black']">
                                        <i :class="isAgentMode ? currentAgent.icon : 'ri-chat-smile-2-fill'"></i>
                                    </div>
                                    <span class="text-[10px] text-gray-300 font-bold tracking-widest uppercase italic">AI Processing...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 输入框区域 - 固定在底部 -->
                    <div class="shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-md p-6">
                        <div class="max-w-3xl mx-auto">
                            <div class="input-blur-bg rounded-[2rem] border border-gray-200 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] p-2.5 flex items-end gap-2 focus-within:border-gray-400 transition-all">
                                <button class="p-3 text-gray-400 hover:text-black transition-colors"><i class="ri-add-line text-2xl"></i></button>
                                <textarea 
                                    v-model="input"
                                    @keydown.enter.prevent="handleSend"
                                    rows="1"
                                    @input="autoResize"
                                    ref="inputArea"
                                    :placeholder="isAgentMode ? `咨询 ${currentAgent.name}...` : '输入您的问题...'"
                                    class="flex-1 py-3 px-1 bg-transparent border-none focus:ring-0 text-[15px] resize-none max-h-48 no-scrollbar outline-none text-gray-800 placeholder-gray-300 font-medium"
                                ></textarea>
                                <button 
                                    @click="handleSend"
                                    :disabled="!input.trim() || isTyping"
                                    :class="[
                                        'w-11 h-11 rounded-2xl transition-all flex items-center justify-center mb-0.5 mr-0.5 shadow-sm',
                                        input.trim() && !isTyping ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-50 text-gray-200'
                                    ]"
                                >
                                    <i class="ri-arrow-up-line text-xl font-bold"></i>
                                </button>
                            </div>
                            <p class="text-[10px] text-gray-300 text-center mt-4 font-bold uppercase tracking-widest">AI generated content may be incorrect</p>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 新建/编辑智能体弹窗 -->
            <transition name="fade">
                <div v-if="showCreateModal || showEditAgentModal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6" @click.self="showCreateModal = false; showEditAgentModal = false; resetNewAgent()">
                    <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div class="p-8 space-y-8">
                            <header class="flex justify-between items-center">
                                <h3 class="text-2xl font-black text-gray-900">{{ showEditAgentModal ? '编辑智能体' : '创建智能体' }}</h3>
                                <button @click="showCreateModal = false; showEditAgentModal = false; resetNewAgent()" class="text-gray-400 hover:text-black"><i class="ri-close-line text-2xl"></i></button>
                            </header>

                            <div class="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">名称 <span class="text-red-500">*</span></label>
                                    <input v-model="newAgent.name" type="text" placeholder="给智能体起个名字" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black transition-all outline-none font-medium">
                                </div>

                                <div class="space-y-2">
                                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">描述</label>
                                    <textarea v-model="newAgent.description" rows="2" placeholder="简短描述，用于列表展示" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black transition-all outline-none font-medium resize-none"></textarea>
                                    <p class="text-[9px] text-gray-300 ml-1">简短描述，用于列表展示</p>
                                </div>

                                <div class="space-y-2">
                                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">系统提示词 <span class="text-red-500">*</span></label>
                                    <textarea v-model="newAgent.system_prompt" rows="6" placeholder="你是一位专业的...（定义智能体人设）" class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black transition-all outline-none font-medium resize-none"></textarea>
                                    <p class="text-[9px] text-gray-300 ml-1">定义智能体的人设和行为方式</p>
                                </div>

                                <div class="space-y-3">
                                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">温度参数</label>
                                    <div class="space-y-2">
                                        <input v-model.number="newAgent.temperature" type="range" min="0" max="1" step="0.1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                                        <div class="flex items-center justify-between text-xs text-gray-400">
                                            <span>严谨 (0.0)</span>
                                            <span class="font-bold text-gray-700">{{ newAgent.temperature }}</span>
                                            <span>创意 (1.0)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex gap-3 pt-4">
                                <button @click="showCreateModal = false; showEditAgentModal = false; resetNewAgent()" 
                                        class="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-4 font-bold hover:bg-gray-200 transition-all">
                                    取消
                                </button>
                                <button @click="showEditAgentModal ? updateAgentInfo() : createNewAgent()" 
                                        :disabled="!newAgent.name || !newAgent.system_prompt"
                                        class="flex-1 bg-black text-white rounded-2xl py-4 font-bold hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none">
                                    {{ showEditAgentModal ? '保存修改' : '创建智能体' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 编辑会话标题弹窗 -->
            <transition name="fade">
                <div v-if="showEditTitleModal" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6" @click.self="showEditTitleModal = false">
                    <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div class="p-8 space-y-8">
                            <header class="flex justify-between items-center">
                                <h3 class="text-2xl font-black text-gray-900">编辑会话标题</h3>
                                <button @click="showEditTitleModal = false; editingSession = null; editTitleInput = ''" class="text-gray-400 hover:text-black"><i class="ri-close-line text-2xl"></i></button>
                            </header>

                            <div class="space-y-6">
                                <div class="space-y-2">
                                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">标题</label>
                                    <input v-model="editTitleInput" 
                                           @keydown.enter.prevent="handleUpdateTitle"
                                           type="text" 
                                           placeholder="输入会话标题" 
                                           class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black transition-all outline-none font-medium">
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <button @click="showEditTitleModal = false; editingSession = null; editTitleInput = ''" 
                                        class="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-4 font-bold hover:bg-gray-200 transition-all">
                                    取消
                                </button>
                                <button @click="handleUpdateTitle" 
                                        :disabled="!editTitleInput.trim()"
                                        class="flex-1 bg-black text-white rounded-2xl py-4 font-bold hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none">
                                    保存
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
import { 
    getAgents, 
    getAgentDetail,
    createAgent,
    updateAgent,
    deleteAgent,
    streamChat, 
    createSession, 
    getSessions, 
    getSessionDetail, 
    getSessionMessages, 
    updateSessionTitle, 
    deleteSession 
} from './api/index.js'

const currentView = ref('chat')
const isAgentMode = ref(false)
const isSidebarCollapsed = ref(false)
const showCreateModal = ref(false)
const showEditAgentModal = ref(false)
const showEditTitleModal = ref(false)
const editingSession = ref(null)
const editingAgent = ref(null)
const editTitleInput = ref('')
const input = ref('')
const isTyping = ref(false)
const scrollBox = ref(null)
const inputArea = ref(null)
const agents = ref([])
const currentAgent = ref(null)
const messages = ref([])
const sessionId = ref(null)
const sessions = ref([])
const isLoadingSessions = ref(false)
let scrollTimer = null

const colorPresets = ['bg-orange-500', 'bg-blue-600', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-600', 'bg-indigo-500', 'bg-gray-900']

// 智能体图标映射
const getAgentIcon = (agentId) => {
    const iconMap = {
        'general': 'ri-chat-smile-2-fill',
        'coder': 'ri-terminal-box-fill',
        'writer': 'ri-quill-pen-fill',
        'designer': 'ri-palette-fill',
        'analyst': 'ri-brain-fill',
        'translator': 'ri-global-fill',
        'lawyer': 'ri-scales-3-fill'
    }
    return iconMap[agentId] || 'ri-robot-2-fill'
}

// 智能体颜色映射
const getAgentColor = (agentId) => {
    const colorMap = {
        'general': 'bg-gray-900',
        'coder': 'bg-blue-600',
        'writer': 'bg-orange-500',
        'designer': 'bg-purple-500',
        'analyst': 'bg-emerald-500',
        'translator': 'bg-rose-500',
        'lawyer': 'bg-cyan-600'
    }
    return colorMap[agentId] || 'bg-indigo-500'
}

const newAgent = ref({
    name: '',
    description: '',
    system_prompt: '',
    temperature: 0.7
})

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 加载会话列表
const loadSessions = async () => {
    isLoadingSessions.value = true
    try {
        const response = await getSessions()
        sessions.value = response.data?.sessions || response.data || []
        // 按更新时间排序
        sessions.value.sort((a, b) => {
            const timeA = new Date(a.updated_at || a.created_at || 0)
            const timeB = new Date(b.updated_at || b.created_at || 0)
            return timeB - timeA
        })
    } catch (error) {
        console.error('加载会话列表失败:', error)
        sessions.value = []
    } finally {
        isLoadingSessions.value = false
    }
}

// 加载会话详情和消息历史
const loadSession = async (id) => {
    try {
        sessionId.value = id
        currentView.value = 'chat'
        
        // 加载会话详情
        const detailResponse = await getSessionDetail(id)
        const sessionDetail = detailResponse.data?.session || detailResponse.data
        
        // 根据会话信息设置智能体模式
        if (sessionDetail?.agent_name) {
            const agent = agents.value.find(a => a.name === sessionDetail.agent_name)
            if (agent) {
                currentAgent.value = agent
                isAgentMode.value = true
            } else {
                isAgentMode.value = false
                currentAgent.value = null
            }
        } else {
            isAgentMode.value = false
            currentAgent.value = null
        }
        
        // 加载消息历史
        const messagesResponse = await getSessionMessages(id)
        const historyMessages = messagesResponse.data?.messages || messagesResponse.data || []
        
        // 转换消息格式
        messages.value = historyMessages.map(msg => ({
            role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
            content: msg.content || msg.message || msg.text || '',
            time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        
        scrollToBottom()
    } catch (error) {
        console.error('加载会话失败:', error)
        messages.value = []
    }
}

// 创建新会话
const createNewSession = async (agentId = null, agentName = null) => {
    try {
        const sessionData = {
            title: agentName ? `${agentName} 对话` : '新对话'
        }
        
        // 如果传入了 agent_id，添加到请求中（默认使用 "general"）
        if (agentId) {
            sessionData.agent_id = agentId
        } else {
            // 如果没有指定，使用默认的通用助手
            sessionData.agent_id = 'general'
        }
        
        const response = await createSession(sessionData)
        const newSession = response.data?.session || response.data
        const newSessionId = newSession.id || newSession.session_id || newSession._id
        if (newSessionId) {
            // 添加到会话列表顶部
            sessions.value.unshift({
                id: newSessionId,
                title: newSession.title || (agentName ? `${agentName} 对话` : '新对话'),
                updated_at: newSession.updated_at || newSession.created_at || new Date().toISOString(),
                created_at: newSession.created_at || new Date().toISOString(),
                agent_id: newSession.agent_id || agentId || 'general',
                agent_name: agentName
            })
            return newSessionId
        }
        throw new Error('无法获取会话ID')
    } catch (error) {
        console.error('创建会话失败:', error)
        // 如果创建失败，生成一个临时ID（但后端可能无法识别）
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        return tempId
    }
}

// 更新会话标题
const handleUpdateTitle = async () => {
    if (!editingSession.value || !editTitleInput.value.trim()) return
    
    try {
        await updateSessionTitle(editingSession.value.id, editTitleInput.value.trim())
        // 更新本地会话列表
        const session = sessions.value.find(s => s.id === editingSession.value.id)
        if (session) {
            session.title = editTitleInput.value.trim()
        }
        showEditTitleModal.value = false
        editingSession.value = null
        editTitleInput.value = ''
    } catch (error) {
        console.error('更新会话标题失败:', error)
        alert('更新标题失败，请重试')
    }
}

// 显示编辑标题弹窗
const openEditTitleModal = (session) => {
    editingSession.value = session
    editTitleInput.value = session.title || ''
    showEditTitleModal.value = true
}

// 删除会话
const handleDeleteSession = async (id) => {
    if (!confirm('确定要删除这个会话吗？')) return
    
    try {
        await deleteSession(id)
        // 从列表中移除
        sessions.value = sessions.value.filter(s => s.id !== id)
        // 如果删除的是当前会话，创建新会话
        if (sessionId.value === id) {
            await startGeneralChat()
        }
    } catch (error) {
        console.error('删除会话失败:', error)
        alert('删除失败，请重试')
    }
}

// 加载智能体列表
onMounted(async () => {
    try {
        const response = await getAgents()
        // 新 API 直接返回数组
        agents.value = Array.isArray(response.data) ? response.data : (response.data?.agents || [])
    } catch (error) {
        console.error('加载智能体列表失败:', error)
        // 如果 API 失败，使用默认数据（兼容新格式）
        agents.value = [
            { id: 'general', name: '通用助手', description: '一个乐于助人的 AI 助理，可以回答各种问题、进行日常对话', has_tools: false, tool_count: 0, is_system: true }
        ]
    }
    
    // 加载会话列表
    await loadSessions()
})

// 重置新智能体表单
const resetNewAgent = () => {
    newAgent.value = {
        name: '',
        description: '',
        system_prompt: '',
        temperature: 0.7
    }
}

// 创建新智能体
const createNewAgent = async () => {
    if (!newAgent.value.name || !newAgent.value.system_prompt) return
    
    try {
        const response = await createAgent({
            name: newAgent.value.name,
            description: newAgent.value.description || null,
            system_prompt: newAgent.value.system_prompt,
            temperature: newAgent.value.temperature || 0.7
        })
        
        const createdAgent = response.data
        // 添加到列表顶部
        agents.value.unshift(createdAgent)
        showCreateModal.value = false
        resetNewAgent()
    } catch (error) {
        console.error('创建智能体失败:', error)
        alert(error.response?.data?.detail || '创建智能体失败，请重试')
    }
}

// 打开编辑智能体弹窗
const openEditAgentModal = async (agent) => {
    try {
        // 获取智能体详情（包含 system_prompt 和 temperature）
        const response = await getAgentDetail(agent.id)
        editingAgent.value = response.data
        newAgent.value = {
            name: editingAgent.value.name,
            description: editingAgent.value.description || '',
            system_prompt: editingAgent.value.system_prompt || '',
            temperature: editingAgent.value.temperature || 0.7
        }
        showEditAgentModal.value = true
    } catch (error) {
        console.error('获取智能体详情失败:', error)
        alert('获取智能体详情失败，请重试')
    }
}

// 更新智能体
const updateAgentInfo = async () => {
    if (!editingAgent.value || !newAgent.value.name || !newAgent.value.system_prompt) return
    
    try {
        const response = await updateAgent(editingAgent.value.id, {
            name: newAgent.value.name,
            description: newAgent.value.description || null,
            system_prompt: newAgent.value.system_prompt,
            temperature: newAgent.value.temperature || 0.7
        })
        
        // 更新列表中的智能体
        const index = agents.value.findIndex(a => a.id === editingAgent.value.id)
        if (index !== -1) {
            agents.value[index] = { ...agents.value[index], ...response.data }
        }
        
        showEditAgentModal.value = false
        editingAgent.value = null
        resetNewAgent()
    } catch (error) {
        console.error('更新智能体失败:', error)
        alert(error.response?.data?.detail || '更新智能体失败，请重试')
    }
}

// 删除智能体
const handleDeleteAgent = async (agentId) => {
    if (!confirm('确定要删除这个智能体吗？删除后无法恢复。')) return
    
    try {
        await deleteAgent(agentId)
        // 从列表中移除
        agents.value = agents.value.filter(a => a.id !== agentId)
        // 如果删除的是当前使用的智能体，切换到通用对话
        if (currentAgent.value && currentAgent.value.id === agentId) {
            await startGeneralChat()
        }
    } catch (error) {
        console.error('删除智能体失败:', error)
        alert(error.response?.data?.detail || '删除智能体失败，请重试')
    }
}

// 切换到通用对话
const startGeneralChat = async () => {
    isAgentMode.value = false
    currentAgent.value = null
    currentView.value = 'chat'
    // 创建新会话，使用默认的 general agent_id
    sessionId.value = await createNewSession('general', '通用助手')
    messages.value = []
    scrollToBottom()
}

// 选择特定智能体
const selectAgent = async (agent) => {
    currentAgent.value = agent
    isAgentMode.value = true
    currentView.value = 'chat'
    // 创建新会话，传入 agent_id 和 agent_name
    sessionId.value = await createNewSession(agent.id, agent.name)
    messages.value = []
    scrollToBottom()
}

const autoResize = () => {
    const el = inputArea.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
}

const scrollToBottom = async (force = false) => {
    await nextTick()
    if (scrollBox.value) {
        // 节流滚动，避免频繁滚动
        if (scrollTimer) {
            clearTimeout(scrollTimer)
        }
        scrollTimer = setTimeout(() => {
            if (scrollBox.value) {
                const isNearBottom = scrollBox.value.scrollHeight - scrollBox.value.scrollTop - scrollBox.value.clientHeight < 100
                if (force || isNearBottom) {
                    scrollBox.value.scrollTop = scrollBox.value.scrollHeight
                }
            }
        }, force ? 0 : 50)
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
    await sendChatMessage(userQuery)
}

const sendChatMessage = async (query) => {
    // 获取 agent_id（如果处于智能体模式）
    const agentId = isAgentMode.value && currentAgent.value ? currentAgent.value.id : null
    
    // 创建临时的 assistant 消息用于流式更新
    const assistantMessageIndex = messages.value.length
    messages.value.push({
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    isTyping.value = true
    
    try {
        // 使用流式接口（不传 sessionId 让后端自动创建）
        await streamChat(
            query,
            sessionId.value, // 可能为 null，让后端创建新会话
            agentId, // 传递 agent_id
            // onUpdate: 实时更新消息内容
            (update) => {
                if (update.type === 'content') {
                    messages.value[assistantMessageIndex].content = update.content
                    // 流式更新时使用节流滚动
                    scrollToBottom(false)
                } else if (update.type === 'session') {
                    // 处理会话信息（包含 session_id, agent_id, agent_name, is_new_session）
                    if (update.session_id) {
                        sessionId.value = update.session_id
                        
                        // 如果是新会话，更新会话列表
                        if (update.is_new_session) {
                            // 可以在这里添加到会话列表
                            loadSessions()
                        }
                    }
                    
                    // 如果返回了智能体信息，更新当前智能体
                    if (update.agent_id && update.agent_name) {
                        // 查找或创建智能体对象
                        let agent = agents.value.find(a => a.id === update.agent_id)
                        if (!agent) {
                            agent = {
                                id: update.agent_id,
                                name: update.agent_name,
                                description: ''
                            }
                        }
                        currentAgent.value = agent
                        isAgentMode.value = true
                    }
                }
            },
            // onDone: 流式完成
            async (fullContent) => {
                isTyping.value = false
                messages.value[assistantMessageIndex].content = fullContent
                
                // 发送消息后，更新会话列表中的更新时间
                const session = sessions.value.find(s => s.id === sessionId.value)
                if (session) {
                    session.updated_at = new Date().toISOString()
                    // 如果会话没有标题，使用第一条消息作为标题
                    if (!session.title || session.title === '新对话' || session.title.includes('对话')) {
                        const shortTitle = query.length > 20 ? query.substring(0, 20) + '...' : query
                        try {
                            await updateSessionTitle(sessionId.value, shortTitle)
                            session.title = shortTitle
                        } catch (error) {
                            console.error('自动更新标题失败:', error)
                        }
                    }
                }
                
                // 完成后强制滚动到底部
                scrollToBottom(true)
            },
            // onError: 错误处理
            (error) => {
                isTyping.value = false
                console.error('流式请求错误:', error)
                const prefix = isAgentMode.value ? `[${currentAgent.value.name}] ` : ''
                const errorMessage = error.message || '抱歉，处理您的消息时出现了错误。请稍后重试。'
                messages.value[assistantMessageIndex].content = `${prefix}${errorMessage}`
                scrollToBottom(true)
            }
        )
    } catch (error) {
        isTyping.value = false
        console.error('发送消息失败:', error)
        const prefix = isAgentMode.value ? `[${currentAgent.value.name}] ` : ''
        const errorMessage = error.message || '抱歉，处理您的消息时出现了错误。请稍后重试。'
        messages.value[assistantMessageIndex].content = `${prefix}${errorMessage}`
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

