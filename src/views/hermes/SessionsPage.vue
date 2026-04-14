<template>
  <div class="hermes-sessions-page">
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Session Management</h2>
          <n-button type="primary" @click="createSession">
            <template #icon>
              <n-icon><Plus /></n-icon>
            </template>
            New Session
          </n-button>
        </div>
      </template>
      
      <n-data-table
        :columns="columns"
        :data="sessions"
        :bordered="false"
        :single-line="false"
      >
        <template #body-cell="{ column, row }">
          <template v-if="column.key === 'actions'">
            <n-button-group>
              <n-button text @click="selectSession(row.id)">
                <template #icon>
                  <n-icon><Message /></n-icon>
                </template>
                Chat
              </n-button>
              <n-button text type="warning" @click="renameSession(row.id)">
                <template #icon>
                  <n-icon><Edit /></n-icon>
                </template>
                Rename
              </n-button>
              <n-button text type="error" @click="deleteSession(row.id)">
                <template #icon>
                  <n-icon><Trash /></n-icon>
                </template>
                Delete
              </n-button>
            </n-button-group>
          </template>
        </template>
      </n-data-table>
      
      <!-- Create Session Dialog -->
      <n-dialog v-model:show="showCreateDialog" title="Create New Session">
        <n-input v-model:value="newSessionName" placeholder="Session name" />
        <template #footer>
          <div class="flex justify-end space-x-2">
            <n-button @click="showCreateDialog = false">Cancel</n-button>
            <n-button type="primary" @click="confirmCreateSession">Create</n-button>
          </div>
        </template>
      </n-dialog>
      
      <!-- Rename Session Dialog -->
      <n-dialog v-model:show="showRenameDialog" title="Rename Session">
        <n-input v-model:value="renameSessionName" placeholder="New session name" />
        <template #footer>
          <div class="flex justify-end space-x-2">
            <n-button @click="showRenameDialog = false">Cancel</n-button>
            <n-button type="primary" @click="confirmRenameSession">Rename</n-button>
          </div>
        </template>
      </n-dialog>
      
      <!-- Delete Session Dialog -->
      <n-dialog v-model:show="showDeleteDialog" title="Delete Session" type="warning">
        <p>Are you sure you want to delete this session? This action cannot be undone.</p>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <n-button @click="showDeleteDialog = false">Cancel</n-button>
            <n-button type="error" @click="confirmDeleteSession">Delete</n-button>
          </div>
        </template>
      </n-dialog>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hermesApiClient } from '@/api/hermes/client';
import type { HermesSession } from '@/api/hermes/types';
import { Plus, Message, Edit, Trash } from '@vicons/ionicons5';

const sessions = ref<HermesSession[]>([]);
const showCreateDialog = ref(false);
const showRenameDialog = ref(false);
const showDeleteDialog = ref(false);
const newSessionName = ref('');
const renameSessionName = ref('');
const sessionToRename = ref('');
const sessionToDelete = ref('');

const columns = [
  {
    title: 'Name',
    key: 'name',
    width: 200
  },
  {
    title: 'Created At',
    key: 'created_at',
    width: 200,
    render: (row: HermesSession) => new Date(row.created_at).toLocaleString()
  },
  {
    title: 'Last Message',
    key: 'last_message_at',
    width: 200,
    render: (row: HermesSession) => new Date(row.last_message_at).toLocaleString()
  },
  {
    title: 'Message Count',
    key: 'message_count',
    width: 120
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 200
  }
];

async function loadSessions() {
  try {
    const loadedSessions = await hermesApiClient.getSessions();
    sessions.value = loadedSessions;
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

function createSession() {
  newSessionName.value = '';
  showCreateDialog.value = true;
}

async function confirmCreateSession() {
  if (!newSessionName.value.trim()) return;
  try {
    const newSession = await hermesApiClient.createSession(newSessionName.value.trim());
    sessions.value.push(newSession);
    showCreateDialog.value = false;
  } catch (error) {
    console.error('Failed to create session:', error);
  }
}

function renameSession(sessionId: string) {
  const session = sessions.value.find(s => s.id === sessionId);
  if (session) {
    renameSessionName.value = session.name;
    sessionToRename.value = sessionId;
    showRenameDialog.value = true;
  }
}

async function confirmRenameSession() {
  if (!renameSessionName.value.trim() || !sessionToRename.value) return;
  try {
    // 这里需要实现会话重命名的 API 调用
    const sessionIndex = sessions.value.findIndex(s => s.id === sessionToRename.value);
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex].name = renameSessionName.value.trim();
    }
    showRenameDialog.value = false;
  } catch (error) {
    console.error('Failed to rename session:', error);
  }
}

function deleteSession(sessionId: string) {
  sessionToDelete.value = sessionId;
  showDeleteDialog.value = true;
}

async function confirmDeleteSession() {
  if (!sessionToDelete.value) return;
  try {
    await hermesApiClient.deleteSession(sessionToDelete.value);
    sessions.value = sessions.value.filter(s => s.id !== sessionToDelete.value);
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

function selectSession(sessionId: string) {
  // 这里可以实现跳转到聊天页面并选择该会话
  console.log('Select session:', sessionId);
}

onMounted(() => {
  loadSessions();
});
</script>

<style scoped>
.hermes-sessions-page {
  padding: 20px;
}
</style>
