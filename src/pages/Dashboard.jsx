import {
  UserGroupIcon,
  BookOpenIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/** stat card (no border, soft shadow, rounded) */
const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-md">
    <div className="p-2 rounded-xl bg-violet-50">
      <Icon className="h-6 w-6 text-violet-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-emerald-600 mt-1">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div
      className="
        space-y-6
        bg-gray-50                 /* light page background like the mock */
        min-h-[calc(100vh-3rem)]
        -m-6 p-6                   /* stretch background edge-to-edge inside main */
      "
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome to Carelia Admin Panel
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            icon={UserGroupIcon}
            label="Total Users"
            value="2,847"
            sub="+12% from last month"
          />
          <StatCard
            icon={BookOpenIcon}
            label="Active Courses"
            value="24"
            sub="+3 this week"
          />
          <StatCard
            icon={ArrowPathIcon}
            label="Recent Logins"
            value="156"
            sub="last 24 hours"
          />
        </div>

        {/* Recent Activity card: no border, soft drop + faint purple glow */}
        <div className="mt-6 bg-white rounded-2xl shadow-md shadow-violet-200/40">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <ul className="p-4 space-y-3">
            {[
              ["Sarah Johnson joined the platform", "2 minutes ago"],
              ['Michael Chen completed "Mindfulness Basics"', "15 minutes ago"],
              ["Emma Rodriguez logged in", "32 minutes ago"],
              ['David Kim rated "Stress Management" 5 stars', "1 hour ago"],
              ["Lisa Thompson started a new journal entry", "2 hours ago"],
            ].map(([text, time], i) => (
              <li
                key={i}
                className="bg-gray-50 rounded-xl px-4 py-3 text-sm flex items-center justify-between"
              >
                <span className="text-gray-800">{text}</span>
                <span className="text-gray-500">{time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
