import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, Filter, Search, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type ComplaintStatus = "pending" | "in_progress" | "resolved" | "closed";
type ComplaintPriority = "low" | "medium" | "high" | "urgent";

export default function Complaints() {
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: complaints, isLoading, refetch } = trpc.complaints.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateStatus = trpc.complaints.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الشكوى بنجاح");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const updatePriority = trpc.complaints.updatePriority.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الأولوية بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const deleteComplaint = trpc.complaints.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الشكوى بنجاح");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ", { description: error.message });
    },
  });

  const getStatusBadge = (status: ComplaintStatus) => {
    const variants: Record<ComplaintStatus, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "قيد الانتظار" },
      in_progress: { variant: "default", label: "قيد المعالجة" },
      resolved: { variant: "outline", label: "تم الحل" },
      closed: { variant: "outline", label: "مغلقة" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    const colors: Record<ComplaintPriority, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    const labels: Record<ComplaintPriority, string> = {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
      urgent: "عاجلة",
    };
    return (
      <Badge className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const filteredComplaints = complaints?.filter((complaint: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      complaint.name.toLowerCase().includes(searchLower) ||
      complaint.subject.toLowerCase().includes(searchLower) ||
      complaint.email?.toLowerCase().includes(searchLower) ||
      complaint.phone?.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateStatus = (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    updateStatus.mutate({
      id: selectedComplaint.id,
      status,
      notes,
    });
  };

  const handleUpdatePriority = (complaintId: number, priority: ComplaintPriority) => {
    updatePriority.mutate({ id: complaintId, priority });
  };

  const handleDelete = () => {
    if (!selectedComplaint) return;
    if (confirm("هل أنت متأكد من حذف هذه الشكوى؟")) {
      deleteComplaint.mutate(selectedComplaint.id);
    }
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة الشكاوى</h1>
        <p className="text-gray-600">عرض وإدارة جميع الشكاوى المستلمة</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم، الموضوع، البريد أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                  <SelectItem value="closed">مغلقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>الشكاوى ({filteredComplaints?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredComplaints && filteredComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right hidden md:table-cell">الموضوع</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">التاريخ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">الأولوية</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint: any) => (
                    <TableRow key={complaint.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div>{complaint.name}</div>
                          <div className="text-sm text-gray-500 md:hidden">{complaint.subject}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {complaint.subject}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                        {format(new Date(complaint.createdAt), "dd MMM yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Select
                          value={complaint.priority}
                          onValueChange={(value: ComplaintPriority) =>
                            handleUpdatePriority(complaint.id, value)
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">منخفضة</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                            <SelectItem value="high">عالية</SelectItem>
                            <SelectItem value="urgent">عاجلة</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNotes(complaint.notes || "");
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد شكاوى</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الشكوى</DialogTitle>
            <DialogDescription>
              عرض وتحديث معلومات الشكوى
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">الاسم</label>
                  <p className="mt-1">{selectedComplaint.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
                  <p className="mt-1">{selectedComplaint.email || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">رقم الهاتف</label>
                  <p className="mt-1">{selectedComplaint.phone || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">التاريخ</label>
                  <p className="mt-1">
                    {format(new Date(selectedComplaint.createdAt), "dd MMMM yyyy - HH:mm", {
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">الموضوع</label>
                <p className="mt-1">{selectedComplaint.subject}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">الرسالة</label>
                <p className="mt-1 whitespace-pre-wrap">{selectedComplaint.message}</p>
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">الحالة</label>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">الأولوية</label>
                  <div className="mt-1">{getPriorityBadge(selectedComplaint.priority)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">ملاحظات</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedComplaint.status}
                  onValueChange={(value: ComplaintStatus) => handleUpdateStatus(value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="تغيير الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                    <SelectItem value="resolved">تم الحل</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteComplaint.isPending}
                  className="w-full sm:w-auto"
                >
                  {deleteComplaint.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "حذف"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

