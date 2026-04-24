import { useState } from "react";
import { Save, Shield, Bell, Key, Database, Globe } from "lucide-react";

const SuperAdminSetting = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  const [settings, setSettings] = useState({
    platformName: "Examlytic Enterprise",
    supportEmail: "support@examlytic.com",
    maxAdmins: 100,
    mfaRequired: true,
    emailNotifications: true,
    weeklyReports: true,
    dataRetentionDays: 365
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving super admin settings:", settings);
    alert("Platform settings updated successfully.");
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-[1.75rem] font-bold text-[#0F6B75]">Platform Settings</h2>
          <p className="text-gray-500 mt-1">Configure global Examlytic parameters and security policies</p>
        </div>
        
        <button 
          onClick={handleSubmit}
          className="bg-[#0F6B75] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0c565e] transition-colors shadow-md cursor-pointer flex items-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            <SettingTab 
              icon={<Globe size={18} />} label="General" 
              active={activeTab === 'general'} onClick={() => setActiveTab('general')} 
            />
            <SettingTab 
              icon={<Shield size={18} />} label="Security" 
              active={activeTab === 'security'} onClick={() => setActiveTab('security')} 
            />
            <SettingTab 
              icon={<Bell size={18} />} label="Notifications" 
              active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} 
            />
            <SettingTab 
              icon={<Database size={18} />} label="Data & Storage" 
              active={activeTab === 'data'} onClick={() => setActiveTab('data')} 
            />
            <SettingTab 
              icon={<Key size={18} />} label="API Keys" 
              active={activeTab === 'api'} onClick={() => setActiveTab('api')} 
            />
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form className="p-8">
            
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-[#012f36] border-b border-gray-100 pb-4 mb-6">General Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Name</label>
                    <input type="text" name="platformName" value={settings.platformName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                    <input type="email" name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Admins Allowed</label>
                    <input type="number" name="maxAdmins" value={settings.maxAdmins} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F6B75]/20 focus:border-[#0F6B75] outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-[#012f36] border-b border-gray-100 pb-4 mb-6">Security Policies</h3>
                
                <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5">
                    <input type="checkbox" name="mfaRequired" checked={settings.mfaRequired} onChange={handleChange} className="w-4 h-4 text-[#0F6B75] rounded border-gray-300 focus:ring-[#0F6B75]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Require Multi-Factor Authentication (MFA)</p>
                    <p className="text-xs text-gray-500 mt-1">Force all new institution administrators to configure MFA during onboarding.</p>
                  </div>
                </label>
                
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <Shield size={16} /> Advanced Security features like SSO and IP Whitelisting are managed via the infrastructure console.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-lg font-bold text-[#012f36] border-b border-gray-100 pb-4 mb-6">System Notifications</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} className="w-4 h-4 text-[#0F6B75] rounded border-gray-300 focus:ring-[#0F6B75]" />
                    <span className="text-sm font-medium text-gray-700">Receive critical system alerts via email</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="weeklyReports" checked={settings.weeklyReports} onChange={handleChange} className="w-4 h-4 text-[#0F6B75] rounded border-gray-300 focus:ring-[#0F6B75]" />
                    <span className="text-sm font-medium text-gray-700">Send weekly usage analytics report</span>
                  </label>
                </div>
              </div>
            )}

            {(activeTab === 'data' || activeTab === 'api') && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Database size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-700">Advanced Configuration</h3>
                <p className="text-sm text-center max-w-sm mt-2">These settings are currently managed by the database administrator.</p>
              </div>
            )}

          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

const SettingTab = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
      active 
        ? "bg-[#0F6B75] text-white shadow-md" 
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default SuperAdminSetting;
