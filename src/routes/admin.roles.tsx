import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, clearSession } from "@/lib/api";
import { 
  Shield, Settings, Users, CheckCircle2, AlertTriangle, Save, RefreshCw,
  Eye, Lock, Unlock, Search, Filter, ChevronDown, Info, UserCheck,
  Key, ShieldCheck, AlertCircle, CheckSquare, Square, X, Plus
} from "lucide-react";

export const Route = createFileRoute("/admin/roles")({ component: AdminRoles });

type Permission = {
  key: string;
  description: string;
  category: string;
  roles: string[];
  subRoles: string[];
  defaultValue: boolean;
  isCore: boolean;
};

type RoleConfiguration = {
  role: string;
  subRole?: string;
  permissions: string[];
  statusPermissions: Array<{
    status: string;
    canSet: boolean;
    canView: boolean;
  }>;
  isActive: boolean;
  updatedAt?: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  subRole?: string;
  active: boolean;
};

type PermissionTest = {
  user: User;
  testResults: Record<string, boolean>;
  effectivePermissions: string[];
};

function AdminRoles() {
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});
  const [configurations, setConfigurations] = useState<Record<string, RoleConfiguration>>({});
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedSubRole, setSelectedSubRole] = useState<string>("");
  const [editingConfig, setEditingConfig] = useState<RoleConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testUser, setTestUser] = useState<string>("");
  const [testResults, setTestResults] = useState<PermissionTest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"permissions" | "status" | "users">("permissions");

  const roles = ["admin", "lab_staff", "dentist"];
  const subRoles = ["production", "design", "dispatch"];
  const statuses = [
    "Submitted", "Under Review", "Approved", "Rejected",
    "In Production", "Quality Check", "Ready for Dispatch", 
    "Dispatched", "Delivered"
  ];

  const categories = {
    cases: { label: "Cases", icon: Shield, color: "bg-blue-500" },
    users: { label: "Users", icon: Users, color: "bg-emerald-500" },
    settings: { label: "Settings", icon: Settings, color: "bg-purple-500" },
    analytics: { label: "Analytics", icon: Eye, color: "bg-orange-500" },
    content: { label: "Content", icon: Key, color: "bg-pink-500" },
    system: { label: "System", icon: ShieldCheck, color: "bg-slate-500" }
  };

  async function loadData() {
    setLoading(true);
    try {
      const [configRes, permRes] = await Promise.all([
        apiFetch<{ configurations: Record<string, RoleConfiguration>; permissions: Record<string, Permission> }>("/api/admin/roles/config"),
        apiFetch<any>("/api/admin/roles/permissions")
      ]);
      
      setConfigurations(configRes.configurations);
      setPermissions(configRes.permissions);
    } catch (error: any) {
      console.error("Failed to load roles data:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveConfiguration() {
    if (!editingConfig) return;
    
    setSaving(true);
    try {
      await apiFetch("/api/admin/roles/config", {
        method: "PUT",
        body: JSON.stringify({
          role: editingConfig.role,
          subRole: editingConfig.subRole,
          permissions: editingConfig.permissions,
          statusPermissions: editingConfig.statusPermissions
        })
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await loadData();
      setEditingConfig(null);
    } catch (error: any) {
      console.error("Failed to save role configuration:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function initializeDefaults() {
    if (!confirm("Initialize default permissions and role configurations? This will reset all custom configurations.")) return;
    
    try {
      await apiFetch("/api/admin/roles/initialize", { method: "POST" });
      await loadData();
    } catch (error: any) {
      console.error("Failed to initialize defaults:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    }
  }

  async function testPermissions() {
    if (!testUser) return;
    
    try {
      const allPermissionKeys = Object.values(permissions).map(p => p.key);
      const results = await apiFetch<PermissionTest>("/api/admin/roles/test-permissions", {
        method: "POST",
        body: JSON.stringify({
          userId: testUser,
          permissionKeys: allPermissionKeys
        })
      });
      
      setTestResults(results);
    } catch (error: any) {
      console.error("Failed to test permissions:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    }
  }

  const currentConfig = configurations[selectedRole + (selectedSubRole ? `:${selectedSubRole}` : "")];
  const filteredPermissions = Object.values(permissions).filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Roles & Permissions</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <UserCheck size={16} />
            Test Permissions
          </button>
          <button
            onClick={initializeDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
          >
            <RefreshCw size={16} />
            Initialize Defaults
          </button>
        </div>
      </div>

      {/* Test Panel */}
      {showTestPanel && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Permission Testing</h3>
            <button
              onClick={() => setShowTestPanel(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter user ID"
              value={testUser}
              onChange={(e) => setTestUser(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={testPermissions}
              disabled={!testUser}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Test User
            </button>
          </div>
          
          {testResults && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-2">
                  {testResults.user.name} ({testResults.user.role}{testResults.user.subRole ? ` - ${testResults.user.subRole}` : ""})
                </h4>
                <p className="text-sm text-slate-600">
                  {testResults.effectivePermissions.length} effective permissions
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {Object.entries(testResults.testResults).map(([key, hasPermission]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {hasPermission ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <X size={14} className="text-red-500" />
                    )}
                    <span className={hasPermission ? "text-slate-700" : "text-slate-400"}>
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Select Role</h2>
          
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setSelectedSubRole("");
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedRole === role && !selectedSubRole
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="font-medium capitalize">{role}</div>
                <div className="text-sm opacity-75">Base role configuration</div>
              </button>
            ))}
          </div>
          
          {selectedRole === "lab_staff" && (
            <div className="mt-4">
              <h3 className="font-medium text-slate-700 mb-2">Lab Staff Sub-roles</h3>
              <div className="space-y-2">
                {subRoles.map((subRole) => (
                  <button
                    key={subRole}
                    onClick={() => setSelectedSubRole(subRole)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      selectedSubRole === subRole
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="font-medium capitalize">{subRole}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Editor */}
        <div className="lg:col-span-2 space-y-4">
          {currentConfig ? (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="border-b border-slate-200">
                <div className="flex items-center justify-between p-4">
                  <h3 className="font-semibold text-slate-800">
                    {selectedRole}{selectedSubRole ? ` - ${selectedSubRole}` : ""} Configuration
                  </h3>
                  <div className="flex items-center gap-2">
                    {editingConfig ? (
                      <>
                        <button
                          onClick={() => setEditingConfig(null)}
                          className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveConfiguration}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {saved ? (
                            <>
                              <CheckCircle2 size={14} />
                              Saved!
                            </>
                          ) : saving ? (
                            "Saving..."
                          ) : (
                            <>
                              <Save size={14} />
                              Save
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingConfig(currentConfig)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Settings size={14} />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                  {["permissions", "status", "users"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "text-indigo-600 border-b-2 border-indigo-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab === "permissions" && "Permissions"}
                      {tab === "status" && "Status Permissions"}
                      {tab === "users" && "Users with Role"}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                {/* Search */}
                {activeTab === "permissions" && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
                
                {/* Permissions Tab */}
                {activeTab === "permissions" && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(categories).map(([category, { label, icon: Icon, color }]) => {
                      const categoryPerms = filteredPermissions.filter(p => p.category === category);
                      if (categoryPerms.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-6 h-6 rounded ${color} flex items-center justify-center`}>
                              <Icon size={12} className="text-white" />
                            </div>
                            <h4 className="font-medium text-slate-800">{label}</h4>
                          </div>
                          <div className="space-y-2 ml-8">
                            {categoryPerms.map((permission) => {
                              const hasPermission = editingConfig 
                                ? editingConfig.permissions.includes(permission.key)
                                : currentConfig.permissions.includes(permission.key);
                              
                              return (
                                <div key={permission.key} className="flex items-start gap-3">
                                  <button
                                    onClick={() => {
                                      if (!editingConfig) return;
                                      
                                      if (hasPermission) {
                                        setEditingConfig({
                                          ...editingConfig,
                                          permissions: editingConfig.permissions.filter(p => p !== permission.key)
                                        });
                                      } else {
                                        setEditingConfig({
                                          ...editingConfig,
                                          permissions: [...editingConfig.permissions, permission.key]
                                        });
                                      }
                                    }}
                                    disabled={!editingConfig}
                                    className={`mt-0.5 ${!editingConfig ? "cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    {hasPermission ? (
                                      <CheckSquare size={16} className="text-indigo-600" />
                                    ) : (
                                      <Square size={16} className="text-slate-400" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-700 text-sm">
                                      {permission.key}
                                      {permission.isCore && (
                                        <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                                          Core
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">{permission.description}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Status Permissions Tab */}
                {activeTab === "status" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="font-medium text-sm text-slate-700">Status</div>
                      <div className="font-medium text-sm text-slate-700">Can Set / Can View</div>
                    </div>
                    
                    {statuses.map((status) => {
                      const statusPerm = editingConfig
                        ? editingConfig.statusPermissions.find(sp => sp.status === status)
                        : currentConfig.statusPermissions.find(sp => sp.status === status);
                      
                      const canSet = statusPerm?.canSet || false;
                      const canView = statusPerm?.canView !== false;
                      
                      return (
                        <div key={status} className="grid grid-cols-2 gap-4 items-center">
                          <div className="text-sm text-slate-700">{status}</div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={canSet}
                                onChange={(e) => {
                                  if (!editingConfig) return;
                                  
                                  const updatedStatusPerms = editingConfig.statusPermissions.map(sp =>
                                    sp.status === status ? { ...sp, canSet: e.target.checked } : sp
                                  );
                                  
                                  setEditingConfig({
                                    ...editingConfig,
                                    statusPermissions: updatedStatusPerms
                                  });
                                }}
                                disabled={!editingConfig}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-slate-600">Set</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={canView}
                                onChange={(e) => {
                                  if (!editingConfig) return;
                                  
                                  const updatedStatusPerms = editingConfig.statusPermissions.map(sp =>
                                    sp.status === status ? { ...sp, canView: e.target.checked } : sp
                                  );
                                  
                                  setEditingConfig({
                                    ...editingConfig,
                                    statusPermissions: updatedStatusPerms
                                  });
                                }}
                                disabled={!editingConfig}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-slate-600">View</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Users Tab */}
                {activeTab === "users" && (
                  <div className="text-center py-8 text-slate-500">
                    <Users size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>User management for this role</p>
                    <p className="text-sm">Feature coming soon</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Shield size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Select a role to view configuration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
