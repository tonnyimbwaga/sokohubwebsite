"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import Heading from "@/shared/Heading/Heading";
import Button from "@/shared/Button/Button";
import Input from "@/shared/Input/Input";
import Textarea from "@/shared/TextArea/TextArea";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

interface Settings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_phone: string;
  address: string;
  social_media: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  shipping_policy: string;
  return_policy: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    site_name: "",
    site_description: "",
    contact_email: "",
    support_phone: "",
    address: "",
    social_media: {},
    shipping_policy: "",
    return_policy: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, create default settings
          await createDefaultSettings();
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      toast.error("Error loading settings");
      console.error("Error:", error);
    }
  };

  const createDefaultSettings = async () => {
    const defaultSettings: Settings = {
      site_name: siteConfig.name,
      site_description: siteConfig.description,
      contact_email: siteConfig.contact.email,
      support_phone: siteConfig.contact.phone,
      address: siteConfig.contact.address,
      social_media: {
        facebook: siteConfig.links.facebook,
        twitter: siteConfig.links.twitter,
        instagram: siteConfig.links.instagram,
      },
      shipping_policy: "",
      return_policy: "",
    };

    try {
      const { error } = await supabase.from("settings").insert(defaultSettings as any);

      if (error) throw error;
      setSettings(defaultSettings);
    } catch (error) {
      toast.error("Error creating default settings");
      console.error("Error:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("settings").upsert(settings as any);

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Error saving settings");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Heading title="Site Settings">Manage your site settings</Heading>

      <form onSubmit={handleSave} className="space-y-8 mt-8">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <Input
                value={settings.site_name}
                onChange={(e) =>
                  setSettings({ ...settings, site_name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <Textarea
                value={settings.site_description}
                onChange={(e) =>
                  setSettings({ ...settings, site_description: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <Input
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings({ ...settings, contact_email: e.target.value })
                }
                type="email"
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Support Phone
              </label>
              <Input
                value={settings.support_phone}
                onChange={(e) =>
                  setSettings({ ...settings, support_phone: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <Textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Social Media</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Facebook URL
              </label>
              <Input
                value={settings.social_media.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_media: {
                      ...settings.social_media,
                      facebook: e.target.value,
                    },
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Twitter URL
              </label>
              <Input
                value={settings.social_media.twitter || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_media: {
                      ...settings.social_media,
                      twitter: e.target.value,
                    },
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Instagram URL
              </label>
              <Input
                value={settings.social_media.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_media: {
                      ...settings.social_media,
                      instagram: e.target.value,
                    },
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Policies</h2>
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Shipping Policy
              </label>
              <Textarea
                value={settings.shipping_policy}
                onChange={(e) =>
                  setSettings({ ...settings, shipping_policy: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Return Policy
              </label>
              <Textarea
                value={settings.return_policy}
                onChange={(e) =>
                  setSettings({ ...settings, return_policy: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Save Settings
        </Button>
      </form>
    </div>
  );
}
