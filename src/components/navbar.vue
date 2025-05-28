<script setup lang="ts">
import Container from "@/components/container.vue";
import IconSettings from "@/components/icons/settings.vue";
import Button from "@/components/ui/button.vue";
import { useRouter } from "vue-router";
import { ROUTE_NAMES } from "@/router";

const router = useRouter();

const navigateToSettings = () => {
  router.push({ name: ROUTE_NAMES.SETTINGS });
};
</script>

<template>
  <header class="flex items-center justify-between border-b pb-2">
    <Container>
      <template #default>
        <div class="flex flex-row items-center justify-between">
          <h1 class="text-xl font-bold">GhostBar</h1>
          <div @click="navigateToSettings">
            <Button variant="ghost" size="icon">
              <IconSettings class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </template>
    </Container>
  </header>
</template>
