import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getDeliverySlip, downloadDeliverySlipPdf } from "@/services/order.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer } from "lucide-react";

interface DeliverySlipDialogProps {
  orderId: string | null;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeliverySlipDialog({ orderId, orderNumber, open, onOpenChange }: DeliverySlipDialogProps) {
  const { data: slipData, isLoading } = useQuery({
    queryKey: ["delivery-slip", orderId],
    queryFn: () => getDeliverySlip(orderId!),
    enabled: !!orderId && open,
  });

  const handleDownload = async () => {
    if (!orderId) return;
    try {
      await downloadDeliverySlipPdf(orderId, orderNumber);
      // Optional: Close dialog or show success message
    } catch (error) {
      console.error("Failed to download delivery slip:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl w-[90vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b pb-4 shrink-0 bg-muted/20">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold tracking-tight">ડિલિવરી સ્લિપ (Delivery Slip)</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 min-h-0 print:overflow-visible">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">Loading preview...</div>
          ) : slipData ? (
            <div className="space-y-6 print:space-y-4" id="delivery-slip-print-area">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground">ઓર્ડર નંબર (Order#):</p>
                  <p className="text-base font-medium">{slipData.orderNumber}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">ડિલિવરી તારીખ (Date):</p>
                  <p className="text-base font-medium">{slipData.deliveryDate}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">ગ્રાહકનું નામ (Customer):</p>
                  <p className="text-base font-medium">{slipData.customerName}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">મોબાઇલ નંબર (Phone):</p>
                  <p className="text-base font-medium">{slipData.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold text-muted-foreground">સરનામું (Address):</p>
                  <p className="text-base font-medium">{slipData.deliveryAddress}</p>
                </div>
                {slipData.notes && (
                  <div className="col-span-2">
                    <p className="font-semibold text-muted-foreground">નોંધ (Notes):</p>
                    <p className="text-base font-medium">{slipData.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold text-lg mb-2 border-b pb-2">પ્રોડક્ટ્સ (Products)</p>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>પ્રોડક્ટનું નામ (Product Name)</TableHead>
                      <TableHead className="text-right">માત્રા (Quantity)</TableHead>
                      <TableHead className="text-right">એકમ (Unit)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slipData.items.map((item: { productName: string; quantity: number; unit: string }, idx: number) => {
                      const unitMap: Record<string, string> = {
                        KG: 'કિલો',
                        LITER: 'લિટર',
                        PIECE: 'નંગ',
                      };
                      return (
                        <TableRow key={idx} className="hover:bg-muted/10">
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{unitMap[item.unit] || item.unit}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t">
                <div className="text-center">
                  <div className="border-b border-dashed border-gray-400 w-48 mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-muted-foreground">ગ્રાહકની સહી (Customer Signature)</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-dashed border-gray-400 w-48 mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-muted-foreground">ડિલિવરી બોયની સહી (Delivery Boy Signature)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 text-muted-foreground">Failed to load data.</div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/10 shrink-0 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownload} disabled={isLoading || !slipData}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
