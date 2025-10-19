import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.complaints.stats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "إجمالي الشكاوى",
      value: stats?.total || 0,
      icon: MessageSquare,
      color: "bg-blue-500",
      link: "/admin/complaints",
    },
    {
      title: "قيد الانتظار",
      value: stats?.pending || 0,
      icon: Clock,
      color: "bg-yellow-500",
      link: "/admin/complaints?status=pending",
    },
    {
      title: "قيد المعالجة",
      value: stats?.inProgress || 0,
      icon: AlertCircle,
      color: "bg-orange-500",
      link: "/admin/complaints?status=in_progress",
    },
    {
      title: "تم الحل",
      value: stats?.resolved || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      link: "/admin/complaints?status=resolved",
    },
    {
      title: "مغلقة",
      value: stats?.closed || 0,
      icon: XCircle,
      color: "bg-gray-500",
      link: "/admin/complaints?status=closed",
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">مرحباً بك في نظام إدارة الشكاوى والدعم الفني</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`${card.color} p-2 rounded-full`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/complaints">
              <div className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <h3 className="font-semibold">إدارة الشكاوى</h3>
                <p className="text-sm text-gray-600">عرض وإدارة جميع الشكاوى المستلمة</p>
              </div>
            </Link>
            <Link href="/admin/pages">
              <div className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <h3 className="font-semibold">إدارة الصفحات</h3>
                <p className="text-sm text-gray-600">إنشاء وتعديل صفحات الموقع</p>
              </div>
            </Link>
            <Link href="/admin/settings">
              <div className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <h3 className="font-semibold">الإعدادات</h3>
                <p className="text-sm text-gray-600">إعدادات الموقع وإشعارات واتساب</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">اسم الموقع:</span>
              <span className="font-semibold">HarthHDR</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">الإصدار:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">حالة النظام:</span>
              <span className="text-green-600 font-semibold">نشط</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

