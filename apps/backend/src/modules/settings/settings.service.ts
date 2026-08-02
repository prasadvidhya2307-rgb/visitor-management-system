import { SettingsRepository } from "./settings.repository.js";

export class SettingsService {
    constructor(private readonly repository: SettingsRepository) {}
    public getSettings() { return this.repository.get(); }
    public updateSettings(data: Parameters<SettingsRepository["update"]>[0]) { return this.repository.update(data); }
}
