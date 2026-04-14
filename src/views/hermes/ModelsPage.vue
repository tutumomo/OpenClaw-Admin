<template>
  <div class="hermes-models-page">
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Model Management</h2>
        </div>
      </template>
      
      <n-data-table
        :columns="columns"
        :data="models"
        :bordered="false"
        :single-line="false"
      >
        <template #body-cell="{ column, row }">
          <template v-if="column.key === 'actions'">
            <n-button text @click="selectModel(row.id)">
              <template #icon>
                <n-icon><CheckmarkCircle /></n-icon>
              </template>
              Select
            </n-button>
          </template>
        </template>
      </n-data-table>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hermesApiClient } from '@/api/hermes/client';
import { CheckmarkCircle } from '@vicons/ionicons5';

const models = ref([]);

const columns = [
  {
    title: 'Model ID',
    key: 'id',
    width: 200
  },
  {
    title: 'Object',
    key: 'object',
    width: 120
  },
  {
    title: 'Created',
    key: 'created',
    width: 200,
    render: (row) => new Date(row.created * 1000).toLocaleString()
  },
  {
    title: 'Owned By',
    key: 'owned_by',
    width: 150
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100
  }
];

async function loadModels() {
  try {
    const response = await hermesApiClient.getModels();
    models.value = response.data;
  } catch (error) {
    console.error('Failed to load models:', error);
  }
}

function selectModel(modelId: string) {
  console.log('Select model:', modelId);
  // 这里可以实现选择模型的逻辑
}

onMounted(() => {
  loadModels();
});
</script>

<style scoped>
.hermes-models-page {
  padding: 20px;
}
</style>
