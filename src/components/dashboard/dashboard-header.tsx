import { Zap } from 'lucide-react'

export function DashboardHeader() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="relative">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-10 w-10 text-yellow-300 drop-shadow-lg" />
                        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                            QA Dashboard
                        </h1>
                    </div>
                    <p className="text-blue-100 mt-2 text-lg">
                        Real-time insights into your quality assurance metrics and test execution trends
                    </p>
                </div>
            </div>
        </div>
    )
}
