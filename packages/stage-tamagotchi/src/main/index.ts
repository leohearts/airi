import { platform } from 'node:process'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import icon from '../../build/icon.png?asset'
import { createWindow } from './windows'

function createMainWindow(): void {
  const mainWindow = createWindow('/', {
    width: 300,
    height: 400,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    alwaysOnTop: true,
    ...(platform === 'linux' ? { icon } : {}),
  })

  ipcMain.on('move-window', (_, dx, dy) => {
    const [currentX, currentY] = mainWindow.getPosition()
    mainWindow.setPosition(currentX + dx, currentY + dy)
  })
}

let settingsWindow: BrowserWindow | null = null
function createSettingsWindow(): void {
  if (settingsWindow) {
    settingsWindow.show()
    return
  }

  settingsWindow = createWindow('#/settings')
  settingsWindow.on('close', () => {
    settingsWindow = null
  })
}

let motionSettingWindow: BrowserWindow | null = null
function createMotionSettingWindow(): void {
  if (motionSettingWindow) {
    motionSettingWindow.show()
    return
  }

  motionSettingWindow = createWindow('#/motion-setting')
  motionSettingWindow.on('close', () => {
    motionSettingWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'airi',
      role: 'appMenu',
      submenu: [
        {
          role: 'about',
        },
        {
          role: 'toggleDevTools',
        },
        {
          label: 'Settings',
          click: createSettingsWindow,
        },
        {
          label: 'Quit',
          click: app.quit,
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.github.moeru-ai.airi-tamagotchi')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // TODO: i18n
  ipcMain.on('quit', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Quit',
      message: 'Are you sure you want to quit?',
      buttons: ['Quit', 'Cancel'],
    }).then((result) => {
      if (result.response === 0) {
        app.quit()
      }
    })
  })

  ipcMain.on('open-settings', createSettingsWindow)
  ipcMain.on('open-motion-setting', createMotionSettingWindow)

  createMainWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
