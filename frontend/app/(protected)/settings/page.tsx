"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";
import { Store, Monitor, Printer, Database, Shield, Server, Moon, Sun, Laptop } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBusinessSettings, updateBusinessSettings } from "@/services/settings.service";
import { useAuth } from "@/providers/auth-provider";

const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  gstNumber: z.string().optional().or(z.literal("")),
  invoiceFooterText: z.string().optional().or(z.literal("")),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const { data: settingsData, isLoading: isFetching } = useQuery({
    queryKey: ["businessSettings"],
    queryFn: getBusinessSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateBusinessSettings,
    onSuccess: () => {
      toast.success("Business settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["businessSettings"] });
    },
    onError: () => {
      toast.error("Failed to update business settings");
    },
  });

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      phone: "",
      address: "",
      gstNumber: "",
      invoiceFooterText: "",
    },
  });

  useEffect(() => {
    if (settingsData) {
      form.reset({
        businessName: settingsData.businessName || "",
        phone: settingsData.phone || "",
        address: settingsData.address || "",
        gstNumber: settingsData.gstNumber || "",
        invoiceFooterText: settingsData.invoiceFooterText || "",
      });
    }
  }, [settingsData, form]);

  function onSubmit(data: BusinessFormValues) {
    updateMutation.mutate(data);
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-10">
      <PageHeader
        title="Settings"
        description="Manage your business configuration and system preferences."
      />

      <Tabs defaultValue="business" className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full p-1.5 bg-muted/30 border border-border/50 rounded-xl shadow-sm gap-1 min-h-[56px]">
          <TabsTrigger value="business" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Store className="h-4 w-4 mr-2 hidden md:inline-block" /> Business
          </TabsTrigger>
          <TabsTrigger value="appearance" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Monitor className="h-4 w-4 mr-2 hidden md:inline-block" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="printing" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Printer className="h-4 w-4 mr-2 hidden md:inline-block" /> Printing
          </TabsTrigger>
          <TabsTrigger value="backup" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Database className="h-4 w-4 mr-2 hidden md:inline-block" /> Backup
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Shield className="h-4 w-4 mr-2 hidden md:inline-block" /> Security
          </TabsTrigger>
          <TabsTrigger value="system" className="py-2.5 !h-auto rounded-lg data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md transition-all">
            <Server className="h-4 w-4 mr-2 hidden md:inline-block" /> System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">Business Information</CardTitle>
              <CardDescription>
                These details will appear on your invoices and customer communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isFetching ? (
                <div className="py-10 text-center text-muted-foreground">Loading settings...</div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Geetanjali Dairy" className="bg-muted/20 focus-visible:bg-transparent transition-colors" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. +91 9876543210" className="bg-muted/20 focus-visible:bg-transparent transition-colors" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">GST Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="GSTIN" className="bg-muted/20 focus-visible:bg-transparent transition-colors" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Business Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Full address for invoices" className="resize-none bg-muted/20 focus-visible:bg-transparent transition-colors" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="invoiceFooterText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Invoice Footer Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Thank you for your business!" className="resize-none bg-muted/20 focus-visible:bg-transparent transition-colors" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 border-t mt-6 flex justify-end">
                      <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto px-8">
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">Theme Settings</CardTitle>
              <CardDescription>
                Customize how the application looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <Button 
                  variant="outline" 
                  className={`h-28 flex flex-col gap-3 rounded-xl transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setTheme("light")}
                >
                  <Sun className={`h-6 w-6 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Light</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`h-28 flex flex-col gap-3 rounded-xl transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className={`h-6 w-6 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Dark</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`h-28 flex flex-col gap-3 rounded-xl transition-all ${theme === 'system' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setTheme("system")}
                >
                  <Laptop className={`h-6 w-6 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">Worker Slip & Thermal Printing</CardTitle>
              <CardDescription>
                Configure layout and spacing for 58mm / 80mm thermal printers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
              <p>Printer settings are currently synced with your browser's print dialog.</p>
              <div className="p-5 border border-border/50 rounded-xl bg-muted/20">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Printer className="h-4 w-4" /> Recommended Setup:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-1">
                  <li>Paper Size: 80mm Roll</li>
                  <li>Margins: Minimum</li>
                  <li>Headers/Footers: Off</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6 border-t mt-4 bg-muted/5">
              <Button variant="secondary" disabled className="w-full sm:w-auto">Advanced Configuration (Coming Soon)</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">Data Backup & Restore</CardTitle>
              <CardDescription>
                Export your database securely or restore from a previous backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-5 border border-border/50 rounded-xl bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-semibold flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-primary" /> Manual Backup
                  </p>
                  <p className="text-sm text-muted-foreground">Download a complete snapshot of your data in SQL format.</p>
                </div>
                <Button variant="outline" disabled className="w-full sm:w-auto shrink-0 bg-background">Download SQL</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">Security</CardTitle>
              <CardDescription>
                Manage your active sessions and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-destructive/20 bg-destructive/5 rounded-xl gap-4">
                  <div>
                    <h4 className="font-semibold text-destructive flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4" /> Logout All Sessions
                    </h4>
                    <p className="text-sm text-muted-foreground">Sign out of all other browsers and devices immediately.</p>
                  </div>
                  <Button variant="destructive" onClick={logout} className="w-full sm:w-auto shrink-0">Sign Out Everywhere</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/10 border-b pb-6">
              <CardTitle className="text-xl tracking-tight">System Information</CardTitle>
              <CardDescription>
                Read-only diagnostic information for support and troubleshooting.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-0 gap-x-8 max-w-2xl text-sm border rounded-xl overflow-hidden shadow-sm">
                <div className="flex justify-between py-3 px-4 border-b bg-background">
                  <span className="text-muted-foreground font-medium">Frontend Version</span>
                  <span className="font-semibold">v1.2.0 (Next.js 15)</span>
                </div>
                <div className="flex justify-between py-3 px-4 border-b bg-muted/20">
                  <span className="text-muted-foreground font-medium">Backend Version</span>
                  <span className="font-semibold">v1.2.0 (NestJS)</span>
                </div>
                <div className="flex justify-between py-3 px-4 border-b bg-muted/20 md:border-b-0">
                  <span className="text-muted-foreground font-medium">Database Status</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                  </span>
                </div>
                <div className="flex justify-between py-3 px-4 bg-background">
                  <span className="text-muted-foreground font-medium">Environment</span>
                  <span className="font-semibold">Production</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
