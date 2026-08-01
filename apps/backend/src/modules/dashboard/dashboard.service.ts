import { DashboardRepository } from "./dashboard.repository.js";

export class DashboardService {

    constructor(
        private readonly dashboardRepository: DashboardRepository
    ) { }

    public async getDashboard() {
        const today = new Date();

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(24, 0, 0, 0);

        const [
            totalVisitors,
            toatalCheckIns,
            toatalCheckOut,
            activeVisitors
        ] = await Promise.all([
            this.dashboardRepository.getActiveVisitors(),
            this.dashboardRepository.getTodayCheckIns(startOfDay, endOfDay),
            this.dashboardRepository.getTodayCheckOuts(startOfDay, endOfDay),
            this.dashboardRepository.getActiveVisitors()
        ])

        return {
            totalVisitors,
            toatalCheckIns,
            toatalCheckOut,
            activeVisitors
        }
    }

}