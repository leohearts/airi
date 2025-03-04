<script setup lang="ts">
import { useSettings } from '@proj-airi/stage-ui/stores'
import { useDark } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import MenuItemIcon from '../components/Menu/MenuItemIcon.vue'

const { t } = useI18n()
const settings = storeToRefs(useSettings())
const router = useRouter()
const route = useRoute()

const dark = useDark({ disableTransition: false })

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  to.meta.transition = toDepth < fromDepth ? 'slide-backward' : 'slide-forward'
})

function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  settings.language.value = target.value
}

const isMainSettingsView = computed(() => route.path === '/settings')
</script>

<template>
  <div text="neutral-700 dark:neutral-300" class="settings-container relative" flex="~ col" gap-4>
    <!-- Back button and title for sub-pages -->
    <div v-if="!isMainSettingsView" mb-4 flex items-center gap-2>
      <button text="neutral-800/80 dark:neutral-200/80" @click="router.back()">
        <div i-solar:alt-arrow-left-bold-duotone />
      </button>
    </div>
    <!-- Title for main settings page -->
    <div v-else flex="~ col gap-4">
      <div flex="~ col gap-4">
        <h2 text="neutral-800/80 dark:neutral-200/80 xl" font-bold>
          {{ route.meta.title || t('settings.title') }}
        </h2>
        <div flex="~ col" gap-2>
          <MenuItemIcon
            to="/settings/modules" title="Modules"
            description="Configure for speech synthesis, transcription, gaming modules." icon="i-lucide:blocks"
          />
          <MenuItemIcon
            to="/settings/models" title="Models" description="Live2D, VRM models."
            icon="i-lucide:person-standing"
          />
        </div>
      </div>
      <div flex="~ col gap-4">
        <h2 text="neutral-800/80 dark:neutral-200/80 xl" font-bold>
          {{ t('settings.general-settings.title') }}
        </h2>
        <div>
          <!-- Model Providers Navigation Item -->
          <div class="space-y-2">
            <RouterLink
              grid="~ cols-[150px_1fr]" bg="neutral-200 dark:neutral-800"
              hover="bg-neutral-300 dark:bg-neutral-700" transition="all ease-in-out duration-250" cursor-pointer
              items-center gap-1.5 rounded-lg px-4 py-3 to="/settings/providers"
            >
              <div text="sm">
                <span>{{ t('settings.model-provider.title') }}</span>
              </div>
              <div flex="~ row" w-full justify-end text="sm">
                <div i-solar:alt-arrow-right-bold-duotone />
              </div>
            </RouterLink>
            <!-- Language Setting -->
            <div
              grid="~ cols-[150px_1fr]" bg="neutral-200 dark:neutral-800" hover="bg-neutral-300 dark:bg-neutral-700"
              transition="all ease-in-out duration-250" items-center gap-1.5 rounded-lg px-4 py-3
            >
              <div text="sm">
                <span>{{ t('settings.language.title') }}</span>
              </div>
              <div flex="~ row" w-full justify-end>
                <select
                  class="w-32" bg="transparent" text="sm right neutral-800 dark:neutral-100"
                  transition="all ease-in-out duration-250" outline="none" @change="handleLanguageChange"
                >
                  <option value="en-US">
                    {{ t('settings.language.english') }}
                  </option>
                  <option value="zh-CN">
                    {{ t('settings.language.chinese') }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Theme Setting -->
            <label
              bg="neutral-200 dark:neutral-800" hover="bg-neutral-300 dark:bg-neutral-700"
              transition="all ease-in-out duration-250" w-full flex cursor-pointer rounded-lg px-4 py-3
            >
              <input
                v-model="dark" text="neutral-800 dark:neutral-100" :checked="dark" :aria-checked="dark"
                type="checkbox" hidden appearance-none outline-none
              >
              <div flex="~ row" w-full items-center gap-1.5>
                <div text="sm" w-full flex-1>
                  <span>{{ t('settings.theme') }}</span>
                </div>
                <div select-none>
                  <Transition name="slide-away" mode="out-in">
                    <div v-if="dark" i-solar:moon-stars-bold-duotone transition="all ease-in-out duration-250" />
                    <div v-else i-solar:sun-fog-bold-duotone transition="all ease-in-out duration-250" />
                  </Transition>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
    <!-- Sub-pages use RouterView with transitions -->
    <div class="router-view-container" relative>
      <RouterView v-slot="{ Component }">
        <Transition name="fade">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<style>
/* Container styles */
.settings-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.router-view-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  min-height: 300px;
  /* Ensure there's enough space for the animation */
}

/* Forward navigation transitions */
.slide-forward-enter-active,
.slide-forward-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-forward-enter-from {
  transform: translateX(100%);
}

.slide-forward-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

/* Backward navigation transitions */
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}

.slide-backward-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}

.slide-backward-leave-to {
  transform: translateX(100%);
}
</style>
