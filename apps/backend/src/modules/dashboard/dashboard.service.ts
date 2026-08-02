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
            todayCheckIns,
            checkedOutToday,
            activeVisitors,
            expectedToday,
            recent,
            visits,
        ] = await Promise.all([
            this.dashboardRepository.getTotalVisitors(),
            this.dashboardRepository.getTodayCheckIns(startOfDay, endOfDay),
            this.dashboardRepository.getTodayCheckOuts(startOfDay, endOfDay),
            this.dashboardRepository.getActiveVisitors(),
            this.dashboardRepository.getExpectedToday(startOfDay, endOfDay),
            this.dashboardRepository.getRecentActivities(),
            this.dashboardRepository.getVisitsSince(new Date(today.getFullYear(), today.getMonth() - 5, 1)),
        ])

        const dayKey = (date: Date) => date.toISOString().slice(0, 10);
        const daily = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(); date.setDate(date.getDate() - 6 + index);
            const rows = visits.filter(visit => dayKey(visit.checkInAt) === dayKey(date));
            return { day: date.toLocaleDateString("en-US", { weekday: "short" }), checkIns: rows.length, checkOuts: rows.filter(row => row.checkOutAt).length };
        });

        const activity = recent.map(visit => ({
            id: visit.id,
            type: visit.checkOutAt ? "check_out" : "check_in",
            visitorId: visit.visitor.id,
            visitorCode: visit.visitor.visitorCode,
            visitorName: [visit.visitor.firstName, visit.visitor.lastName].filter(Boolean).join(" "),
            hostName: [visit.hostEmployee.firstName, visit.hostEmployee.lastName].join(" "),
            timestamp: visit.checkOutAt || visit.checkInAt,
            message: `${[visit.visitor.firstName, visit.visitor.lastName].filter(Boolean).join(" ")} ${visit.checkOutAt ? "checked out" : "checked in"}`,
        }));

        return {
            stats: { totalVisitors, todayCheckIns, checkedOutToday, activeVisitors, expectedToday },
            daily,
            activity,
        }
    }

}
