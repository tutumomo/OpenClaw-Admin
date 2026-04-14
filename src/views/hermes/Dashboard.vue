<template>
  <div class="hermes-dashboard">
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Hermes Agent Dashboard</h2>
        </div>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <n-card class="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
          <div class="text-center">
            <n-statistic label="Active Sessions" :value="sessionCount" />
          </div>
        </n-card>
        <n-card class="bg-gradient-to-br from-green-50 to-green-100 border-none">
          <div class="text-center">
            <n-statistic label="Enabled Skills" :value="skillCount" />
          </div>
        </n-card>
        <n-card class="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
          <div class="text-center">
            <n-statistic label="Available Models" :value="modelCount" />
          </div>
        </n-card>
      </div>
      
      <div class="space-y-4">
        <n-card title="Recent Activity">
          <n-list>
            <n-list-item v-for="activity in recentActivities" :key="activity.id">
              <template #prefix>
                <n-avatar round>{{ activity.icon }}</n-avatar>
              </template>
              <template #header>
                {{ activity.title }}
              </template>
              <template #description>
                {{ activity.description }}
              </template>
              <template #suffix>
                <n-text depth="3">{{ activity.time }}</n-text>
              </template>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hermesApiClient } from '@/api/hermes/client';

const sessionCount = ref(0);
const skillCount = ref(0);
const modelCount = ref(0);
const recentActivities = ref([
  {
    id: 1,
    icon: '💬',
    title: 'Chat Session Started',
    description: 'New chat session created',
    time: '10 minutes ago'
  },
  {
    id: 2,
    icon: '🔧',
    title: 'Skill Enabled',
    description: 'Web Search skill enabled',
    time: '30 minutes ago'
  },
  {
    id: 3,
    icon: '📦',
    title: 'Model Loaded',
    description: 'Hermes model loaded successfully',
    time: '1 hour ago'
  }
]);

async function loadDashboardData() {
  try {
    // 获取模型数量
    const models = await hermesApiClient.getModels();
    modelCount.value = models.data.length;
    
    // 获取技能数量
    const skills = await hermesApiClient.getSkills();
    skillCount.value = skills.filter(skill => skill.enabled).length;
    
    // 获取会话数量
    const sessions = await hermesApiClient.getSessions();
    sessionCount.value = sessions.length;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.hermes-dashboard {
  padding: 20px;
}
</style>
