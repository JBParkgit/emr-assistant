import koffi from 'koffi'

const user32 = koffi.load('user32.dll')
const kernel32 = koffi.load('kernel32.dll')

// GetForegroundWindow returns HWND as an opaque pointer
export const GetForegroundWindow = user32.func('void* __stdcall GetForegroundWindow()')
export const SetForegroundWindow = user32.func('int __stdcall SetForegroundWindow(void *hwnd)')
export const IsWindow = user32.func('int __stdcall IsWindow(void *hwnd)')

// Thread management for focus switching
export const GetWindowThreadProcessId = user32.func(
  'uint32 __stdcall GetWindowThreadProcessId(void *hwnd, _Out_ uint32 *pid)'
)
export const AttachThreadInput = user32.func(
  'int __stdcall AttachThreadInput(uint32 idAttach, uint32 idAttachTo, int fAttach)'
)
export const GetCurrentThreadId = kernel32.func('uint32 __stdcall GetCurrentThreadId()')

// keybd_event - simpler than SendInput, no struct union issues
export const keybd_event = user32.func(
  'void __stdcall keybd_event(uint8 bVk, uint8 bScan, uint32 dwFlags, uintptr_t dwExtraInfo)'
)

// Constants
export const KEYEVENTF_KEYUP = 0x0002
export const VK_CONTROL = 0x11
export const VK_V = 0x56
