<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/navbar.vue'

onMounted(async () => {
  await chrome.runtime.sendMessage({
    action: 'logAnalytics',
    name: 'page_view',
    params: {
      page_title: document.title,
      page_location: document.location.href
    }
  })
})
</script>

<template>
  <div class="flex flex-col py-4 border-b w-[350px] h-[400px] bg-gray-50/40 font-inter">
    <AppHeader />
    <RouterView />
  </div>
</template>
