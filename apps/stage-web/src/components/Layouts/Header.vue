<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { useRouter } from 'vue-router'

import LogoDark from '../../assets/logo-dark.svg'
import Logo from '../../assets/logo.svg'

const router = useRouter()

function openSettings() {
  router.push('/settings')
}

const dark = useDark()
</script>

<template>
  <header mb-1 w-full gap-2>
    <a
      href="https://github.com/moeru-ai/airi" rel="noreferrer noopener" target="_blank" flex="~ 1" w-full items-center
      gap-2 px-2 text-nowrap text-2xl outline-none
    >
      <template v-if="dark">
        <img :src="LogoDark" h-8 w-8>
      </template>
      <template v-else>
        <img :src="Logo" h-8 w-8>
      </template>
      <div font-cute>
        <span>アイリ</span>
      </div>
    </a>
    <div flex="~" gap-2>
      <button
        bg="white dark:neutral-800" text="lg neutral-500 dark:neutral-400" max-h="[10lh]" min-h="[1lh]" m-1
        rounded-lg p-2 outline-none @click="openSettings"
      >
        <div i-solar:settings-minimalistic-bold-duotone />
      </button>
    </div>
  </header>
</template>
