import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'
import type { MacroData, AppSettings, UserProfile } from '../renderer/src/types/macro'

const DEFAULT_DATA_PATH = join(__dirname, '../../data/macros.json')

export class MacroStore {
  private userDataDir: string
  private settingsPath: string
  private profilesPath: string
  private settings: AppSettings
  private profiles: UserProfile[]
  private currentData: MacroData

  constructor() {
    this.userDataDir = app.getPath('userData')
    this.settingsPath = join(this.userDataDir, 'settings.json')
    this.profilesPath = join(this.userDataDir, 'profiles.json')

    if (!existsSync(this.userDataDir)) {
      mkdirSync(this.userDataDir, { recursive: true })
    }

    this.profiles = this.loadJSON(this.profilesPath, [])
    this.settings = this.loadJSON(this.settingsPath, {
      pasteDelay: 100,
      opacity: 1.0,
      initialHeight: 700,
      activeUserId: ''
    })

    // Create default user if none exist
    if (this.profiles.length === 0) {
      const defaultUser: UserProfile = { id: 'default', name: '기본 사용자' }
      this.profiles = [defaultUser]
      this.saveProfiles()
      this.settings.activeUserId = 'default'
      this.saveSettings()
      // Copy default macros for default user
      this.initUserMacros('default')
    }

    // Ensure active user is valid
    if (!this.settings.activeUserId || !this.profiles.find((p) => p.id === this.settings.activeUserId)) {
      this.settings.activeUserId = this.profiles[0].id
      this.saveSettings()
    }

    this.currentData = this.loadUserMacros(this.settings.activeUserId)
  }

  private macroPathFor(userId: string): string {
    return join(this.userDataDir, `macros_${userId}.json`)
  }

  private initUserMacros(userId: string): void {
    const path = this.macroPathFor(userId)
    if (!existsSync(path)) {
      try {
        const defaultPath = existsSync(DEFAULT_DATA_PATH)
          ? DEFAULT_DATA_PATH
          : join(process.resourcesPath || '', 'data/macros.json')
        if (existsSync(defaultPath)) {
          copyFileSync(defaultPath, path)
        } else {
          writeFileSync(path, JSON.stringify({ macros: [] }, null, 2))
        }
      } catch {
        writeFileSync(path, JSON.stringify({ macros: [] }, null, 2))
      }
    }
  }

  private loadUserMacros(userId: string): MacroData {
    return this.loadJSON(this.macroPathFor(userId), { macros: [] })
  }

  private loadJSON<T>(path: string, fallback: T): T {
    try {
      const raw = readFileSync(path, 'utf-8')
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  private saveData(): void {
    const path = this.macroPathFor(this.settings.activeUserId)
    writeFileSync(path, JSON.stringify(this.currentData, null, 2), 'utf-8')
  }

  private saveSettings(): void {
    writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8')
  }

  private saveProfiles(): void {
    writeFileSync(this.profilesPath, JSON.stringify(this.profiles, null, 2), 'utf-8')
  }

  // --- Profiles ---

  getProfiles(): UserProfile[] {
    return this.profiles
  }

  addProfile(name: string): UserProfile {
    const id = Date.now().toString(36)
    const profile: UserProfile = { id, name }
    this.profiles.push(profile)
    this.saveProfiles()
    this.initUserMacros(id)
    return profile
  }

  renameProfile(id: string, name: string): void {
    const p = this.profiles.find((u) => u.id === id)
    if (p) {
      p.name = name
      this.saveProfiles()
    }
  }

  deleteProfile(id: string): boolean {
    if (this.profiles.length <= 1) return false
    this.profiles = this.profiles.filter((p) => p.id !== id)
    this.saveProfiles()
    // If deleting active user, switch to first
    if (this.settings.activeUserId === id) {
      this.settings.activeUserId = this.profiles[0].id
      this.saveSettings()
      this.currentData = this.loadUserMacros(this.settings.activeUserId)
    }
    return true
  }

  switchUser(userId: string): MacroData {
    this.settings.activeUserId = userId
    this.saveSettings()
    this.currentData = this.loadUserMacros(userId)
    return this.currentData
  }

  getActiveUserId(): string {
    return this.settings.activeUserId
  }

  // --- Macros ---

  getAll(): MacroData {
    return this.currentData
  }

  saveAll(data: MacroData): void {
    this.currentData = data
    this.saveData()
  }

  // --- Settings ---

  getSettings(): AppSettings {
    return this.settings
  }

  updateSettings(partial: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...partial }
    this.saveSettings()
  }

  exportData(userId?: string): string {
    if (userId && userId !== this.settings.activeUserId) {
      const data = this.loadUserMacros(userId)
      return JSON.stringify(data, null, 2)
    }
    return JSON.stringify(this.currentData, null, 2)
  }

  importData(json: string, userId?: string): MacroData {
    const parsed = JSON.parse(json) as MacroData
    if (!parsed.macros) {
      throw new Error('Invalid macro data format')
    }
    const targetId = userId || this.settings.activeUserId
    if (targetId === this.settings.activeUserId) {
      this.currentData = parsed
      this.saveData()
    } else {
      const path = this.macroPathFor(targetId)
      writeFileSync(path, JSON.stringify(parsed, null, 2), 'utf-8')
    }
    return parsed
  }
}
