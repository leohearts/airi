import type { BrowserWindowConstructorOptions } from 'electron'
import { join } from 'node:path'
import { env } from 'node:process'
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'

export function createWindow(page: string, options: BrowserWindowConstructorOptions = {}): BrowserWindow {
  const window = new BrowserWindow({
    width: 640,
    height: 480,
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, '..', 'preload', 'index.js'),
      sandbox: false,
    },
    ...options,
  })

  window.on('ready-to-show', window.show)
  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  window.show()

  if (is.dev && env.ELECTRON_RENDERER_URL) {
    window.loadURL(join(env.ELECTRON_RENDERER_URL, page))
  }
  else {
    window.loadFile(join(import.meta.dirname, '..', '..', 'out', 'renderer', 'index.html'), { hash: page })
  }

  return window
}
