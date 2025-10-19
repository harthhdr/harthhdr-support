import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

export default function Pages() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isPublished: false,
    showInMenu: true,
    menuOrder: 0,
  });

  const { data: pages, isLoading, refetch } = trpc.pages.list.useQuery();

  const createPage = trpc.pages.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الصفحة بنجاح");
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const updatePage = trpc.pages.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصفحة بنجاح");
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const deletePage = trpc.pages.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصفحة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      isPublished: false,
      showInMenu: true,
      menuOrder: 0,
    });
    setIsEditing(false);
    setEditingPage(null);
  };

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      showInMenu: page.showInMenu,
      menuOrder: page.menuOrder,
    });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updatePage.mutate({ id: editingPage.id, ...formData });
    } else {
      createPage.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الصفحة؟")) {
      deletePage.mutate(id);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة الصفحات</h1>
        <p className="text-gray-600">إنشاء وتعديل صفحات الموقع</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{isEditing ? "تعديل الصفحة" : "إضافة صفحة جديدة"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!isEditing) {
                      setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  required
                  placeholder="عنوان الصفحة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">الرابط (Slug) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="page-url"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500">
                  استخدم أحرف صغيرة وأرقام وشرطات فقط
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  placeholder="محتوى الصفحة..."
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menuOrder">ترتيب القائمة</Label>
                <Input
                  id="menuOrder"
                  type="number"
                  value={formData.menuOrder}
                  onChange={(e) => setFormData({ ...formData, menuOrder: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">نشر الصفحة</Label>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showInMenu">إظهار في القائمة</Label>
                <Switch
                  id="showInMenu"
                  checked={formData.showInMenu}
                  onCheckedChange={(checked) => setFormData({ ...formData, showInMenu: checked })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createPage.isPending || updatePage.isPending}
                >
                  {(createPage.isPending || updatePage.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    "تحديث"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Pages List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>الصفحات ({pages?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages && pages.length > 0 ? (
                pages.map((page: any) => (
                  <div
                    key={page.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg truncate">{page.title}</h3>
                          {page.isPublished ? (
                            <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 break-all" dir="ltr">
                          /{page.slug}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">{page.content}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(page)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                          disabled={deletePage.isPending}
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">لا توجد صفحات</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

