<script setup lang="ts">
import Container from "@/components/container.vue";
import IconSettings from "@/components/icons/settings.vue";
import Button from "@/components/ui/button.vue";
import { useRouter } from "vue-router";
import { ROUTE_NAMES } from "@/router";
</script>

<template>
  <header class="flex items-center justify-between border-b pb-2 px-2">
    <div class="flex flex-row items-center justify-between w-full">
      <nav>
        <router-link :to="{ name: ROUTE_NAMES.HOME }">
          <Button variant="ghost" class="cursor-pointer">
            <h1 class="text-xl font-bold">GhostBar</h1>
          </Button>
        </router-link>
      </nav>

      <nav class="pr-2">
        <router-link :to="{ name: ROUTE_NAMES.SETTINGS }">
          <Button variant="ghost" size="icon" class="cursor-pointer">
            <IconSettings class="w-5 h-5" />
          </Button>
        </router-link>
      </nav>
    </div>
  </header>
</template>
