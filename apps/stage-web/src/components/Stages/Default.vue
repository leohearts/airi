<script setup lang="ts">
import { useDark } from '@vueuse/core'

import Cross from '../components/Backgrounds/Cross.vue'
import AnimatedBackground from '../components/Layouts/AnimatedBackground.vue'

const dark = useDark()
</script>

<template>
  <Cross>
    <AnimatedBackground :fill-color="dark ? '#563544' : '#f8e8f2'">
      <slot />
    </AnimatedBackground>
  </Cross>
</template>
