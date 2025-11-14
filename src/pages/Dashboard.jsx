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
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  getDashboardStats,
  getDashboardActivity,
} from "../services/adminService";

/** stat card */
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
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      setLoadingActivity(true);
      try {
        const [s, a] = await Promise.all([
          getDashboardStats(),
          getDashboardActivity(),
        ]);
        setStats(s);
        setActivity(a || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoadingStats(false);
        setLoadingActivity(false);
      }
    };
    load();
  }, []);

  const activityMapped = useMemo(() => {
    const iconMap = {
      user_registered: {
        icon: UserPlusIcon,
        bg: "bg-blue-50",
        fg: "text-blue-600",
      },
      user_login: {
        icon: ArrowRightOnRectangleIcon,
        bg: "bg-violet-50",
        fg: "text-violet-600",
      },
      course_created: {
        icon: BookOpenIcon,
        bg: "bg-emerald-50",
        fg: "text-emerald-600",
      },
      lesson_created: {
        icon: CheckBadgeIcon,
        bg: "bg-emerald-50",
        fg: "text-emerald-600",
      },
      material_created: {
        icon: PencilSquareIcon,
        bg: "bg-indigo-50",
        fg: "text-indigo-600",
      },
      category_created: {
        icon: BookOpenIcon,
        bg: "bg-sky-50",
        fg: "text-sky-600",
      },
      user_blocked: {
        icon: ArrowPathIcon,
        bg: "bg-rose-50",
        fg: "text-rose-600",
      },
      user_unblocked: {
        icon: ArrowPathIcon,
        bg: "bg-emerald-50",
        fg: "text-emerald-600",
      },
    };

    return activity.map((a) => ({
      id: a._id,
      text: a.message,
      time: new Date(a.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...(iconMap[a.type] || {
        icon: ArrowPathIcon,
        bg: "bg-gray-50",
        fg: "text-gray-600",
      }),
    }));
  }, [activity]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Heading */}
        <header>
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-sm text-gray-500">{t("dashboard.subtitle")}</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={UserGroupIcon}
            label={t("stats.totalUsers.label")}
            value={stats ? stats.totalUsers : "—"}
            sub={t("stats.totalUsers.delta")}
          />
          <StatCard
            icon={BookOpenIcon}
            label={t("stats.activeCourses.label")}
            value={stats ? stats.activeCourses : "—"}
            sub={t("stats.activeCourses.delta")}
          />
          <StatCard
            icon={ArrowPathIcon}
            label={t("stats.recentLogins.label")}
            value={stats ? stats.recentLogins : "—"}
            sub={t("stats.recentLogins.delta")}
          />
        </section>

        {/* Recent Activity */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold">{t("dashboard.recentActivity")}</h3>
            {loadingActivity && (
              <span className="text-xs text-gray-400">
                {t("dashboard.loading")}
              </span>
            )}
          </div>

          <ul className="p-4 sm:p-5 space-y-3">
            {activityMapped.length === 0 && !loadingActivity && (
              <li className="text-sm text-gray-500 px-4 py-3">
                {t("dashboard.noActivity")}
              </li>
            )}

            {activityMapped.map(({ id, text, time, icon: Icon, bg, fg }) => (
              <li
                key={id}
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
