import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, MessageSquare } from "lucide-react";

export default function Settings() {
  const [whatsappConfig, setWhatsappConfig] = useState({
    apiKey: "",
    apiUrl: "https://wasenderapi.com/api/v1/send",
    phoneNumber: "",
    isEnabled: false,
  });

  const { data: config, isLoading } = trpc.settings.getWhatsAppConfig.useQuery();

  const saveWhatsAppConfig = trpc.settings.setWhatsAppConfig.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعدادات واتساب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  useEffect(() => {
    if (config) {
      setWhatsappConfig({
        apiKey: config.apiKey || "",
        apiUrl: config.apiUrl || "https://wasenderapi.com/api/v1/send",
        phoneNumber: config.phoneNumber || "",
        isEnabled: config.isEnabled || false,
      });
    }
  }, [config]);

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppConfig.mutate(whatsappConfig);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-gray-600">إدارة إعدادات الموقع والإشعارات</p>
      </div>

      {/* WhatsApp Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <CardTitle>إعدادات واتساب</CardTitle>
          </div>
          <CardDescription>
            قم بإعداد API واتساب لاستلام إشعارات فورية عند وصول شكوى جديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveWhatsApp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={whatsappConfig.apiKey}
                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, apiKey: e.target.value })}
                placeholder="أدخل API Key من wasenderapi.com"
                dir="ltr"
              />
              <p className="text-xs text-gray-500">
                يمكنك الحصول على API Key من{" "}
                <a
                  href="https://wasenderapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  wasenderapi.com
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                type="url"
                value={whatsappConfig.apiUrl}
                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, apiUrl: e.target.value })}
                placeholder="https://wasenderapi.com/api/v1/send"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">رقم الواتساب</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={whatsappConfig.phoneNumber}
                onChange={(e) =>
                  setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })
                }
                placeholder="07xxxxxxxxx"
                dir="ltr"
              />
              <p className="text-xs text-gray-500">
                رقم الواتساب الذي سيستقبل الإشعارات (بدون + أو 00)
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isEnabled" className="font-semibold">
                  تفعيل إشعارات واتساب
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  عند التفعيل، سيتم إرسال إشعار واتساب عند كل شكوى جديدة
                </p>
              </div>
              <Switch
                id="isEnabled"
                checked={whatsappConfig.isEnabled}
                onCheckedChange={(checked) =>
                  setWhatsappConfig({ ...whatsappConfig, isEnabled: checked })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saveWhatsAppConfig.isPending}
            >
              {saveWhatsAppConfig.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات عامة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">اسم الموقع</p>
              <p className="font-semibold">HarthHDR</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">الإصدار</p>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">حالة النظام</p>
              <p className="font-semibold text-green-600">نشط</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">آخر تحديث</p>
              <p className="font-semibold">{new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">ملاحظة مهمة</h4>
            <p className="text-sm text-purple-800">
              للحصول على أفضل تجربة مع إشعارات واتساب، تأكد من إدخال API Key صحيح ورقم
              واتساب نشط. يمكنك اختبار الإشعارات بإرسال شكوى تجريبية من الصفحة الرئيسية.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

