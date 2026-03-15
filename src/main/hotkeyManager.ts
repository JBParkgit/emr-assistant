import { globalShortcut, BrowserWindow } from 'electron'

export class HotkeyManager {
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.register()
  }

  private register(): void {
    // Alt+Space: Toggle window visibility
    globalShortcut.register('Alt+Space', () => {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide()
      } else {
        this.mainWindow.show()
        this.mainWindow.focus()
      }
    })
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll()
  }
}
