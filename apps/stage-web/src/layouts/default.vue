<script setup lang="ts">
import { useScreenSafeArea } from '@vueuse/core'
import { DrawerContent, DrawerOverlay, DrawerPortal, DrawerRoot } from 'vaul-vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Header from '../components/Layouts/Header.vue'

const { top, right, bottom, left } = useScreenSafeArea()
const isSettingsOpen = ref(false)
const route = useRoute()
const router = useRouter()

// Open drawer when navigating to /settings
watch(() => route.path, (path) => {
  isSettingsOpen.value = path.startsWith('/settings')
}, { immediate: true })

// Close drawer and navigate back to home when drawer is closed
watch(isSettingsOpen, (open) => {
  if (!open && route.path.startsWith('/settings')) {
    router.push('/')
  }
})
</script>

<template>
  <div
    text="gray-700 dark:gray-200" h-full font-cuteen :style="{
      paddingTop: `${top}px`,
      paddingRight: `${right}px`,
      paddingBottom: `${bottom}px`,
      paddingLeft: `${left}px`,
    }"
  >
    <main>
      <div relative flex="~ col" z-2 h-100vh w-100vw of-hidden>
        <!-- header -->
        <div>
          <Header class="flex <md:hidden" p2 />
          <MobileHeader class="hidden <md:block" />
        </div>
        <!-- Main content view -->
        <RouterView />
        <!-- Settings drawer using named view -->
        <DrawerRoot v-model:open="isSettingsOpen" should-scale-background direction="right">
          <DrawerPortal>
            <DrawerOverlay fixed inset-0 z-50 bg-black:40 />
            <DrawerContent
              class="max-w-40% min-w-500px w-full" flex="~ col" bg="neutral-100 dark:neutral-900" fixed
              inset-y-4 right-4 z-50 of-hidden rounded-lg outline-none
            >
              <div flex="~ 1 col gap-2" of-y-scroll rounded-t-lg p-5>
                <RouterView v-slot="{ Component }" name="settings">
                  <Transition name="fade" mode="out-in">
                    <component :is="Component" />
                  </Transition>
                </RouterView>
              </div>
            </DrawerContent>
          </DrawerPortal>
        </DrawerRoot>
      </div>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
