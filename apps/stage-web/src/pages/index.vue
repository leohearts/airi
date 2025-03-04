<script setup lang="ts">
import { WidgetStage } from '@proj-airi/stage-ui/components'
import { ref } from 'vue'

import InteractiveArea from '../components/Layouts/InteractiveArea.vue'
import MobileInteractiveArea from '../components/Layouts/MobileInteractiveArea.vue'

const paused = ref(false)

function handleSettingsOpen(open: boolean) {
  paused.value = open
}
</script>

<template>
  <div relative flex="~ 1 row gap-y-0 gap-x-2 <md:col">
    <WidgetStage flex-1 min-w="1/2" :paused="paused" />
    <InteractiveArea class="flex <md:hidden" flex-1 max-w="500px" min-w="30%" />
    <MobileInteractiveArea class="hidden <md:block" mx2 mb2 @settings-open="handleSettingsOpen" />
  </div>
</template>
