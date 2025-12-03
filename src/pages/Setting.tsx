import { useState, useEffect, useRef } from "react";
import {
  SettingsIcon,
  BellIcon,
  LockIcon,
  UserIcon,
  PaletteIcon,
  MailIcon,
  ShieldIcon,
  LogOut,
} from "lucide-react";
import Loading from "../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../components/UI/SatelliteToast";
import BlurCircle from "../components/UI/BlurCircle";
import AppButton from "../components/UI/AppButton";

// Types for settings
type SettingSection = {
  id: string;
  title: string;
  icon: typeof SettingsIcon;
  description: string;
};

type NotificationSettings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookingReminders: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
};

type AppearanceSettings = {
  darkMode: boolean;
  compactView: boolean;
  fontSize: "small" | "medium" | "large";
  theme: "blue" | "purple" | "green";
};

type PrivacySettings = {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhoneNumber: boolean;
  allowBookingHistory: boolean;
};

// Settings sections configuration
const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "account",
    title: "Account",
    icon: UserIcon,
    description: "Manage your account information and preferences",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: BellIcon,
    description: "Control how you receive updates and alerts",
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: PaletteIcon,
    description: "Customize the look and feel of the dashboard",
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: ShieldIcon,
    description: "Manage your privacy and security settings",
  },
  {
    id: "password",
    title: "Password",
    icon: LockIcon,
    description: "Change your password and manage security",
  },
];

// Component for settings section sidebar
function SettingsSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  return (
    <div className="space-y-2">
      {SETTINGS_SECTIONS.map(section => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-red-rose ${
              isActive
                ? "bg-blue-500 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
            style={{ fontFamily: 'Red Rose, sans-serif' }}
          >
            <Icon className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">{section.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Account Settings Section
function AccountSection() {
  const [formData, setFormData] = useState({
    email: "user@example.com",
    username: "johndoe",
    phone: "+880 1234567890",
    fullName: "John Doe",
  });
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const handleSave = () => {
    toastRef.current?.showNotification({
      title: "Saved",
      content: "Account settings updated successfully.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>Account Settings</h3>
      <div className="space-y-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <AppButton
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
        >
          Save Changes
        </AppButton>
      </div>
    </>
  );
}

// Notification Settings Section
function NotificationSection() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    bookingReminders: true,
    promotionalEmails: false,
    weeklyDigest: true,
  });

  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toastRef.current?.showNotification({
      title: "Saved",
      content: "Notification preferences updated.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
        Notification Preferences
      </h3>
      <div className="space-y-4 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
        {[
          {
            key: "emailNotifications",
            label: "Email Notifications",
            desc: "Receive updates via email",
          },
          {
            key: "pushNotifications",
            label: "Push Notifications",
            desc: "Get push notifications on your device",
          },
          {
            key: "bookingReminders",
            label: "Booking Reminders",
            desc: "Reminder emails before your movie sessions",
          },
          {
            key: "promotionalEmails",
            label: "Promotional Emails",
            desc: "Receive special offers and promotions",
          },
          { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of new movies and offers" },
        ].map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
            <button
              onClick={() => handleToggle(item.key as keyof NotificationSettings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings[item.key as keyof NotificationSettings]
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings[item.key as keyof NotificationSettings] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}

        <AppButton
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white mt-6"
        >
          Save Preferences
        </AppButton>
      </div>
    </>
  );
}

// Appearance Settings Section
function AppearanceSection() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    darkMode: true,
    compactView: false,
    fontSize: "medium",
    theme: "blue",
  });

  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const handleSave = () => {
    toastRef.current?.showNotification({
      title: "Saved",
      content: "Appearance settings updated.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
        Appearance Settings
      </h3>
      <div className="space-y-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use dark theme for the dashboard
            </p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Font Size Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Font Size
          </label>
          <select
            value={settings.fontSize}
            onChange={e =>
              setSettings(prev => ({
                ...prev,
                fontSize: e.target.value as "small" | "medium" | "large",
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Theme Color Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Theme Color
          </label>
          <div className="flex gap-3">
            {["blue", "purple", "green"].map(color => (
              <button
                key={color}
                onClick={() => setSettings(prev => ({ ...prev, theme: color as any }))}
                className={`w-12 h-12 rounded-lg transition ${
                  settings.theme === color
                    ? `ring-2 ring-offset-2 ring-${color}-500`
                    : "opacity-60 hover:opacity-100"
                } bg-${color}-500`}
              />
            ))}
          </div>
        </div>

        <AppButton
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
        >
          Save Preferences
        </AppButton>
      </div>
    </>
  );
}

// Privacy Settings Section
function PrivacySection() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showPhoneNumber: false,
    allowBookingHistory: true,
  });

  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const handleToggle = (key: keyof PrivacySettings) => {
    if (typeof settings[key] === "boolean") {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = () => {
    toastRef.current?.showNotification({
      title: "Saved",
      content: "Privacy settings updated.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
        Privacy & Security
      </h3>
      <div className="space-y-4 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
        {/* Profile Visibility */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Profile Visibility
          </label>
          <select
            value={settings.profileVisibility}
            onChange={e =>
              setSettings(prev => ({
                ...prev,
                profileVisibility: e.target.value as "public" | "private" | "friends",
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Show Email */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Show Email</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Display your email in your profile
            </p>
          </div>
          <button
            onClick={() => handleToggle("showEmail")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.showEmail ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.showEmail ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Show Phone */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Show Phone Number</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Display your phone number in your profile
            </p>
          </div>
          <button
            onClick={() => handleToggle("showPhoneNumber")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.showPhoneNumber ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.showPhoneNumber ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Booking History */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Allow Booking History</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let others see your booking activity
            </p>
          </div>
          <button
            onClick={() => handleToggle("allowBookingHistory")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.allowBookingHistory ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.allowBookingHistory ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <AppButton
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white mt-6"
        >
          Save Settings
        </AppButton>
      </div>
    </>
  );
}

// Password Change Section
function PasswordSection() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Please fill in all password fields.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toastRef.current?.showNotification({
        title: "Error",
        content: "New passwords do not match.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
      return;
    }

    toastRef.current?.showNotification({
      title: "Success",
      content: "Password changed successfully.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });

    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>Change Password</h3>
      <div className="space-y-6 max-w-md font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwords.current}
            onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={passwords.new}
            onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <AppButton
          onClick={handleChangePassword}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
        >
          Change Password
        </AppButton>
      </div>
    </>
  );
}

// Logout Confirmation Modal
function LogoutConfirmModal({
  show,
  onClose,
  onConfirm,
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign Out?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to sign out of your account? You'll need to log in again to access your dashboard.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page Component
export default function SettingPage() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    toastRef.current?.showNotification({
      title: "Signing Out",
      content: "You have been signed out successfully.",
      accentColor: "#22c55e",
      position: "bottom-right",
      longevity: 3000,
    });
    // Simulate logout - in real app, clear auth tokens and redirect
    setShowLogoutConfirm(false);
    // localStorage.removeItem("cine-user-details");
    // window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 min-h-[400px] hide-scrollbar py-8">
        <BlurCircle top="0" left="0" />

        {/* Page Title */}
        <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow flex items-center justify-center gap-2 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          <SettingsIcon className="w-8 h-8" />
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Manage your account, preferences, and security settings</p>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Settings Sidebar */}
            <div className="md:col-span-1">
              <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>

            {/* Settings Content */}
            <div className="md:col-span-3">
              {activeSection === "account" && <AccountSection />}
              {activeSection === "notifications" && <NotificationSection />}
              {activeSection === "appearance" && <AppearanceSection />}
              {activeSection === "privacy" && <PrivacySection />}
              {activeSection === "password" && <PasswordSection />}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Logout</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sign out from your account</p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          show={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      </div>
    </>
  );
}