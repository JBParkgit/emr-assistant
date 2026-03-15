import { BrowserWindow, clipboard } from 'electron'
import {
  GetForegroundWindow,
  SetForegroundWindow,
  GetWindowThreadProcessId,
  AttachThreadInput,
  GetCurrentThreadId,
  IsWindow,
  keybd_event,
  KEYEVENTF_KEYUP,
  VK_CONTROL,
  VK_V
} from './winApi'

export class PasteService {
  private lastExternalHwnd: any = null
  private myHwndPtr: bigint = 0n
  private trackingInterval: ReturnType<typeof setInterval> | null = null
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    // Read our HWND as a numeric value for comparison
    const buf = this.mainWindow.getNativeWindowHandle()
    this.myHwndPtr = buf.readBigUInt64LE(0)
  }

  private hwndToNum(hwnd: any): bigint {
    // koffi returns void* as an External object; extract address via koffi.address
    try {
      const koffi = require('koffi')
      return BigInt(koffi.address(hwnd))
    } catch {
      return 0n
    }
  }

  startTracking(): void {
    this.trackingInterval = setInterval(() => {
      try {
        const hwnd = GetForegroundWindow()
        if (!hwnd) return

        const addr = this.hwndToNum(hwnd)
        if (addr !== 0n && addr !== this.myHwndPtr) {
          this.lastExternalHwnd = hwnd
        }
      } catch {
        // Ignore errors during tracking
      }
    }, 200)
  }

  stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval)
      this.trackingInterval = null
    }
  }

  async pasteToLastWindow(text: string): Promise<boolean> {
    if (!this.lastExternalHwnd) return false

    try {
      // Check if the window still exists
      if (!IsWindow(this.lastExternalHwnd)) {
        this.lastExternalHwnd = null
        return false
      }

      // Copy text to clipboard
      clipboard.writeText(text)

      // Small delay for clipboard to update
      await this.delay(50)

      // Attach thread input to allow focus change
      const pid = [0]
      const targetThread = GetWindowThreadProcessId(this.lastExternalHwnd, pid)
      const currentThread = GetCurrentThreadId()

      if (targetThread !== currentThread) {
        AttachThreadInput(currentThread, targetThread, 1)
      }

      // Set focus to target window
      SetForegroundWindow(this.lastExternalHwnd)

      // Wait for focus to switch
      await this.delay(100)

      // Simulate Ctrl+V using keybd_event with delays
      keybd_event(VK_CONTROL, 0, 0, 0)         // Ctrl down
      await this.delay(30)
      keybd_event(VK_V, 0, 0, 0)               // V down
      await this.delay(30)
      keybd_event(VK_V, 0, KEYEVENTF_KEYUP, 0) // V up
      await this.delay(30)
      keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0) // Ctrl up

      // Detach thread input
      if (targetThread !== currentThread) {
        AttachThreadInput(currentThread, targetThread, 0)
      }

      return true
    } catch (err) {
      console.error('Paste failed:', err)
      return false
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
