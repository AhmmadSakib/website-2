import re

with open("src/pages/AdminPage.tsx", "r") as f:
    content = f.read()

target = r"""      \{/\* Admin Sidebar Navigation \*/\}.*?</aside>"""

replacement = """      {/* Admin Horizontal Navigation */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/40 flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(229,31,42,0.3)]">
            AS
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-[#E51F2A] uppercase font-bold">HQ CONSOLE</div>
            <div className="text-sm font-heading font-bold text-white">Owner Dashboard</div>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'files', label: 'Files', icon: FolderLock },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'media', label: 'Media', icon: Radio },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'permissions', label: 'Permissions', icon: KeyRound, badge: permissions.length },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-tab-${item.id}`}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-medium transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#E51F2A]/10 text-white font-bold border-[#E51F2A]' 
                    : 'text-[#A8A1A1] border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#E51F2A]' : 'text-[#A8A1A1]'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ml-1 ${
                    isActive ? 'bg-[#E51F2A] text-white' : 'bg-[#080808] text-[#E51F2A] border border-[#E51F2A]/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>"""

new_content = re.sub(target, replacement, content, flags=re.DOTALL)

with open("src/pages/AdminPage.tsx", "w") as f:
    f.write(new_content)
