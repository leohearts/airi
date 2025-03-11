import type { ChatProvider } from '@xsai-ext/shared-providers'
import type { AssistantMessage, Message } from '@xsai/shared-chat'

import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLlmmarkerParser } from '../composables/llmmarkerParser'
import SystemPromptV2 from '../constants/prompts/system-v2'
import { useLLM } from '../stores/llm'
import { asyncIteratorFromReadableStream } from '../utils/iterator'

export interface ErrorMessage {
  role: 'error'
  content: string
}

export const useChatStore = defineStore('chat', () => {
  const { stream } = useLLM()
  const { t } = useI18n()

  const sending = ref(false)

  const onBeforeMessageComposedHooks = ref<Array<(message: string) => Promise<void>>>([])
  const onAfterMessageComposedHooks = ref<Array<(message: string) => Promise<void>>>([])
  const onBeforeSendHooks = ref<Array<(message: string) => Promise<void>>>([])
  const onAfterSendHooks = ref<Array<(message: string) => Promise<void>>>([])
  const onTokenLiteralHooks = ref<Array<(literal: string) => Promise<void>>>([])
  const onTokenSpecialHooks = ref<Array<(special: string) => Promise<void>>>([])
  const onStreamEndHooks = ref<Array<() => Promise<void>>>([])
  const onAssistantResponseEndHooks = ref<Array<(message: string) => Promise<void>>>([])

  function onBeforeMessageComposed(cb: (message: string) => Promise<void>) {
    onBeforeMessageComposedHooks.value.push(cb)
  }

  function onAfterMessageComposed(cb: (message: string) => Promise<void>) {
    onAfterMessageComposedHooks.value.push(cb)
  }

  function onBeforeSend(cb: (message: string) => Promise<void>) {
    onBeforeSendHooks.value.push(cb)
  }

  function onAfterSend(cb: (message: string) => Promise<void>) {
    onAfterSendHooks.value.push(cb)
  }

  function onTokenLiteral(cb: (literal: string) => Promise<void>) {
    onTokenLiteralHooks.value.push(cb)
  }

  function onTokenSpecial(cb: (special: string) => Promise<void>) {
    onTokenSpecialHooks.value.push(cb)
  }

  function onStreamEnd(cb: () => Promise<void>) {
    onStreamEndHooks.value.push(cb)
  }

  function onAssistantResponseEnd(cb: (message: string) => Promise<void>) {
    onAssistantResponseEndHooks.value.push(cb)
  }

  const messages = ref<Array<Message | ErrorMessage>>([
    SystemPromptV2(
      t('prompt.prefix'),
      t('prompt.suffix'),
    ),
  ])

  const streamingMessage = ref<AssistantMessage>({ role: 'assistant', content: '' })

  async function send(sendingMessage: string, options: { model: string, chatProvider: ChatProvider }) {
    try {
      sending.value = true

      if (!sendingMessage)
        return

      for (const hook of onBeforeMessageComposedHooks.value) {
        await hook(sendingMessage)
      }

      streamingMessage.value = { role: 'assistant', content: '' }
      messages.value.push({ role: 'user', content: sendingMessage })
      messages.value.push(streamingMessage.value)
      const newMessages = messages.value.slice(0, messages.value.length - 1).map(msg => toRaw(msg))

      for (const hook of onAfterMessageComposedHooks.value) {
        await hook(sendingMessage)
      }

      for (const hook of onBeforeSendHooks.value) {
        await hook(sendingMessage)
      }

      const res = await stream(options.model, options.chatProvider, newMessages as Message[])

      for (const hook of onAfterSendHooks.value) {
        await hook(sendingMessage)
      }

      let fullText = ''

      const parser = useLlmmarkerParser({
        onLiteral: async (literal) => {
          for (const hook of onTokenLiteralHooks.value) {
            await hook(literal)
          }

          streamingMessage.value.content += literal
        },
        onSpecial: async (special) => {
          for (const hook of onTokenSpecialHooks.value) {
            await hook(special)
          }
        },
      })

      for await (const textPart of asyncIteratorFromReadableStream(res.textStream, async v => v)) {
        fullText += textPart
        await parser.consume(textPart)
      }

      await parser.end()

      for (const hook of onStreamEndHooks.value) {
        await hook()
      }

      for (const hook of onAssistantResponseEndHooks.value) {
        await hook(fullText)
      }

      // eslint-disable-next-line no-console
      console.debug('LLM output:', fullText)
    }
    finally {
      sending.value = false
    }
  }

  return {
    sending,
    messages,
    streamingMessage,
    send,
    onBeforeMessageComposed,
    onAfterMessageComposed,
    onBeforeSend,
    onAfterSend,
    onTokenLiteral,
    onTokenSpecial,
    onStreamEnd,
    onAssistantResponseEnd,
  }
})
