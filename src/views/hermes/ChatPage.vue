<template>
  <div class="hermes-chat-page">
    <n-card class="h-full flex flex-col">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Hermes Chat</h2>
          <n-select v-model:value="selectedSession" placeholder="Select Session" :options="sessions" option-label="name" option-value="id" />
        </div>
      </template>
      
      <div class="flex-1 overflow-auto p-4 bg-gray-50 rounded-lg mb-4">
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <div v-if="message.role === 'user'" class="flex justify-end">
            <div class="bg-blue-100 rounded-lg p-3 max-w-[80%]">
              <n-text>{{ message.content }}</n-text>
            </div>
          </div>
          <div v-else class="flex">
            <div class="bg-white rounded-lg p-3 max-w-[80%] border border-gray-200">
              <n-text>{{ message.content }}</n-text>
            </div>
          </div>
        </div>
        <div v-if="isStreaming" class="flex">
          <div class="bg-white rounded-lg p-3 max-w-[80%] border border-gray-200">
            <n-text>{{ streamingContent }}</n-text>
            <n-spin v-if="isStreaming" size="small" />
          </div>
        </div>
      </div>
      
      <div class="mt-auto">
        <n-input
          v-model:value="inputMessage"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          placeholder="Type your message..."
          @keyup.enter.exact="sendMessage"
        />
        <div class="flex justify-end mt-2">
          <n-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim() || isStreaming">
            Send
          </n-button>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hermesApiClient } from '@/api/hermes/client';
import type { HermesSession } from '@/api/hermes/types';

const sessions = ref<HermesSession[]>([]);
const selectedSession = ref<string>('');
const messages = ref([
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hello! I\'m Hermes, your AI assistant. How can I help you today?'
  }
]);
const inputMessage = ref('');
const isStreaming = ref(false);
const streamingContent = ref('');

async function loadSessions() {
  try {
    const loadedSessions = await hermesApiClient.getSessions();
    sessions.value = loadedSessions;
    if (loadedSessions.length > 0) {
      selectedSession.value = loadedSessions[0].id;
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isStreaming.value) return;

  const userMessage = inputMessage.value.trim();
  messages.value.push({
    id: Date.now().toString(),
    role: 'user' as const,
    content: userMessage
  });
  inputMessage.value = '';
  isStreaming.value = true;
  streamingContent.value = '';

  try {
    await hermesApiClient.streamChatCompletion(
      {
        model: 'hermes-agent',
        messages: messages.value.map(msg => ({ role: msg.role, content: msg.content }))
      },
      (chunk) => {
        if (chunk.choices[0].delta.content) {
          streamingContent.value += chunk.choices[0].delta.content;
        }
      },
      () => {
        isStreaming.value = false;
        messages.value.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: streamingContent.value
        });
        streamingContent.value = '';
      },
      (error) => {
        isStreaming.value = false;
        streamingContent.value = '';
        console.error('Error streaming chat completion:', error);
        messages.value.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `Error: ${error.message}`
        });
      }
    );
  } catch (error) {
    isStreaming.value = false;
    streamingContent.value = '';
    console.error('Error sending message:', error);
    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: `Error: ${(error as Error).message}`
    });
  }
}

onMounted(() => {
  loadSessions();
});
</script>

<style scoped>
.hermes-chat-page {
  padding: 20px;
  height: calc(100vh - 120px);
}
</style>
