// 网关状态管理
import { defineStore } from 'pinia';

export type GatewayType = 'openclaw' | 'hermes';

export const useGatewayStore = defineStore('gateway', () => {
  const currentGateway = ref<GatewayType>('openclaw');
  const isOpenClaw = computed(() => currentGateway.value === 'openclaw');
  const isHermes = computed(() => currentGateway.value === 'hermes');

  function setGateway(gateway: GatewayType) {
    currentGateway.value = gateway;
    localStorage.setItem('currentGateway', gateway);
  }

  function loadGatewayFromStorage() {
    const savedGateway = localStorage.getItem('currentGateway') as GatewayType | null;
    if (savedGateway && (savedGateway === 'openclaw' || savedGateway === 'hermes')) {
      currentGateway.value = savedGateway;
    }
  }

  // 初始化时从存储加载
  loadGatewayFromStorage();

  return {
    currentGateway,
    isOpenClaw,
    isHermes,
    setGateway,
    loadGatewayFromStorage
  };
});

// 导入必要的依赖
import { ref, computed } from 'vue';
