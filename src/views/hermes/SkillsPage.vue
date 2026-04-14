<template>
  <div class="hermes-skills-page">
    <n-card>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Skill Management</h2>
        </div>
      </template>
      
      <n-data-table
        :columns="columns"
        :data="skills"
        :bordered="false"
        :single-line="false"
      >
        <template #body-cell="{ column, row }">
          <template v-if="column.key === 'enabled'">
            <n-switch v-model:value="row.enabled" @update:value="toggleSkill(row.id, $event)" />
          </template>
        </template>
      </n-data-table>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hermesApiClient } from '@/api/hermes/client';
import type { HermesSkill } from '@/api/hermes/types';

const skills = ref<HermesSkill[]>([]);

const columns = [
  {
    title: 'Name',
    key: 'name',
    width: 200
  },
  {
    title: 'Description',
    key: 'description',
    ellipsis: true
  },
  {
    title: 'Version',
    key: 'version',
    width: 100
  },
  {
    title: 'Author',
    key: 'author',
    width: 150
  },
  {
    title: 'Enabled',
    key: 'enabled',
    width: 100,
    align: 'center'
  }
];

async function loadSkills() {
  try {
    const loadedSkills = await hermesApiClient.getSkills();
    skills.value = loadedSkills;
  } catch (error) {
    console.error('Failed to load skills:', error);
  }
}

async function toggleSkill(skillId: string, enabled: boolean) {
  try {
    await hermesApiClient.toggleSkill(skillId, enabled);
  } catch (error) {
    console.error('Failed to toggle skill:', error);
    // 恢复原始状态
    const skill = skills.value.find(s => s.id === skillId);
    if (skill) {
      skill.enabled = !enabled;
    }
  }
}

onMounted(() => {
  loadSkills();
});
</script>

<style scoped>
.hermes-skills-page {
  padding: 20px;
}
</style>
