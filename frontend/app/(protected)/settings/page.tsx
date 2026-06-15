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
    <div className="flex flex-col gap-6 max-w-6xl">
      <PageHeader
        title="Settings"
        description="Manage your business configuration and system preferences."
      />

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="business" className="py-2.5">
            <Store className="h-4 w-4 mr-2 hidden md:inline-block" /> Business
          </TabsTrigger>
          <TabsTrigger value="appearance" className="py-2.5">
            <Monitor className="h-4 w-4 mr-2 hidden md:inline-block" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="printing" className="py-2.5">
            <Printer className="h-4 w-4 mr-2 hidden md:inline-block" /> Printing
          </TabsTrigger>
          <TabsTrigger value="backup" className="py-2.5">
            <Database className="h-4 w-4 mr-2 hidden md:inline-block" /> Backup
          </TabsTrigger>
          <TabsTrigger value="security" className="py-2.5">
            <Shield className="h-4 w-4 mr-2 hidden md:inline-block" /> Security
          </TabsTrigger>
          <TabsTrigger value="system" className="py-2.5">
            <Server className="h-4 w-4 mr-2 hidden md:inline-block" /> System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                These details will appear on your invoices and customer communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="py-10 text-center text-muted-foreground">Loading settings...</div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Geetanjali Dairy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. +91 9876543210" {...field} />
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
                            <FormLabel>GST Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="GSTIN" {...field} />
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
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Full address for invoices" className="resize-none" {...field} />
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
                          <FormLabel>Invoice Footer Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Thank you for your business!" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize how the application looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 max-w-xl">
                <Button 
                  variant="outline" 
                  className={`h-24 flex flex-col gap-2 ${theme === 'light' ? 'border-primary ring-1 ring-primary' : ''}`}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`h-24 flex flex-col gap-2 ${theme === 'dark' ? 'border-primary ring-1 ring-primary' : ''}`}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                </Button>
                <Button 
                  variant="outline" 
                  className={`h-24 flex flex-col gap-2 ${theme === 'system' ? 'border-primary ring-1 ring-primary' : ''}`}
                  onClick={() => setTheme("system")}
                >
                  <Laptop className="h-6 w-6" />
                  <span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing">
          <Card>
            <CardHeader>
              <CardTitle>Worker Slip & Thermal Printing</CardTitle>
              <CardDescription>
                Configure layout and spacing for 58mm / 80mm thermal printers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Printer settings are currently synced with your browser's print dialog.</p>
              <div className="p-4 border rounded-md bg-muted/20">
                <p className="font-medium text-foreground mb-2">Recommended Setup:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Paper Size: 80mm Roll</li>
                  <li>Margins: Minimum</li>
                  <li>Headers/Footers: Off</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" disabled>Advanced Configuration (Coming Soon)</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Data Backup & Restore</CardTitle>
              <CardDescription>
                Export your database securely or restore from a previous backup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Manual Backup</p>
                  <p className="text-sm text-muted-foreground">Download a complete snapshot of your data</p>
                </div>
                <Button variant="outline" disabled>Download SQL</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your active sessions and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium text-destructive">Logout All Sessions</h4>
                    <p className="text-sm text-muted-foreground">Sign out of all other browsers and devices.</p>
                  </div>
                  <Button variant="destructive" onClick={logout}>Sign Out Everywhere</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Read-only diagnostic information for support and troubleshooting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 max-w-2xl text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Frontend Version</span>
                  <span className="font-medium">v1.2.0 (Next.js 15)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Backend Version</span>
                  <span className="font-medium">v1.2.0 (NestJS)</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Database Status</span>
                  <span className="font-medium text-emerald-500">Connected</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-medium">Production</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
