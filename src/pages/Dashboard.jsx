import {
  UserGroupIcon,
  BookOpenIcon,
  ArrowPathIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

/** stat card (no border, soft shadow, rounded) */
const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm ring-1 ring-black/5">
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
  const activity = [
    {
      text: "Sarah Johnson joined the platform",
      time: "2 minutes ago",
      icon: UserPlusIcon,
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      text: 'Michael Chen completed "Mindfulness Basics"',
      time: "15 minutes ago",
      icon: CheckBadgeIcon,
      bg: "bg-emerald-50",
      fg: "text-emerald-600",
    },
    {
      text: "Emma Rodriguez logged in",
      time: "32 minutes ago",
      icon: ArrowRightOnRectangleIcon,
      bg: "bg-violet-50",
      fg: "text-violet-600",
    },
    {
      text: 'David Kim rated "Stress Management" 5 stars',
      time: "1 hour ago",
      icon: StarIcon,
      bg: "bg-orange-50",
      fg: "text-orange-500",
    },
    {
      text: "Lisa Thompson started a new journal entry",
      time: "2 hours ago",
      icon: PencilSquareIcon,
      bg: "bg-indigo-50",
      fg: "text-indigo-600",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      {/* OUTER PADDING (responsive) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Heading */}
        <header>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome to Carelia Admin Panel
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </section>

        {/* Recent Activity */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold">Recent Activity</h3>
          </div>

          <ul className="p-4 sm:p-5 space-y-3">
            {activity.map(({ text, time, icon: Icon, bg, fg }, i) => (
              <li
                key={i}
                className="rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-9 w-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${fg}`} />
                  </span>
                  <span className="text-gray-800 truncate">{text}</span>
                </div>
                <span className="ml-4 shrink-0 text-gray-500">{time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
