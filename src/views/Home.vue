<script setup lang="ts">
import Container from '@/components/container.vue'
import { ExternalLink } from 'lucide-vue-next'
</script>

<template>
  <Container class="pt-4">
    <template #default>
      <h2 class="text-sm leading-none font-semibold text-foreground mb-2">Intructions</h2>

      <a
        class="cursor-pointer underline text-sm text-blue-500 leading-none font-medium"
        href="https://ghostbar.ai/docs/getting-started/setup"
        target="_blank"
      >
        How to set up your Ghostbar
        <ExternalLink name="lucide:external-link" class="w-3 h-3 inline-block" />
      </a>
    </template>
  </Container>
</template>
