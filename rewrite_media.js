const fs = require('fs');
let code = fs.readFileSync('src/pages/MediaHubPage.tsx', 'utf8');

// 1. Change title and description
code = code.replace(
  /YouTube \& Spotify <span className="text-transparent bg-clip-text bg-gradient-to-r from-\[#E51F2A\] via-\[#FF5E62\] to-\[#1DB954\]">Media Hub<\/span>/,
  'THE DIGITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E51F2A] to-[#B5121B]">MEDIA HUB</span>'
);

code = code.replace(
  /Explore verified coding playlists, engineering masterclasses, and community sonic streams. Take the interactive guided walkthrough or submit your own YouTube and Spotify links./,
  'A DIGITAL LIBRARY OF VIDEOS, LINKS, IDEAS AND EXPERIENCES.'
);

// 2. Change the Add button (Owner Only)
code = code.replace(
  /<button\s+id="open-upload-modal-btn"\s+onClick=\{\(\) => setIsUploadModalOpen\(true\)\}\s+className="flex items-center gap-2 px-5 py-3\.5 rounded-2xl bg-\[#111416\] hover:bg-\[#181c1f\] text-white border border-white\/10 hover:border-\[#E51F2A\]\/40 font-heading font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-lg"\s+>\s+<Plus size=\{16\} className="text-\[#E51F2A\]" \/>\s+<span>SUBMIT STREAM LINK<\/span>\s+<\/button>/,
  `{isOwner() && (
            <button
              id="open-upload-modal-btn"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#080808] hover:bg-white/5 text-white border border-white/10 hover:border-[#E51F2A]/40 font-heading font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-lg"
            >
              <Plus size={16} className="text-[#E51F2A]" />
              <span>ADD CONTENT</span>
            </button>
          )}`
);

// 3. Change Categories
code = code.replace(
  /<div className="flex items-center gap-3">\s+<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-\[#181c1f\] border border-white\/10 text-xs font-mono">/,
  `<div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'VIDEOS', label: 'VIDEOS', types: ['VIDEO'] },
              { id: 'WEBSITES', label: 'WEBSITES', types: ['ARTICLE'] },
              { id: 'PROJECTS', label: 'PROJECTS' },
              { id: 'DOCUMENTS', label: 'DOCUMENTS', types: ['DOCUMENT'] },
              { id: 'GITHUB', label: 'GITHUB', platforms: ['GITHUB'] },
              { id: 'SOCIAL', label: 'SOCIAL', platforms: ['SOCIAL'] },
              { id: 'COURSES', label: 'COURSES', types: ['COURSE'] },
              { id: 'TOOLS', label: 'TOOLS', types: ['TOOL'] }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={\`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border \${
                  selectedCategory === cat.id
                    ? 'bg-[#E51F2A]/15 text-[#E51F2A] border-[#E51F2A]/40'
                    : 'bg-[#080808] text-[#A8A1A1] hover:text-white border-white/5 hover:border-white/20'
                }\`}
              >
                {cat.label}
              </button>
            ))}
          </div>`
);

// Remove the old platform filter since we replaced it with category above
code = code.replace(/\{/\* Platform Filter \*\/\}([\s\S]*?)<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">/, '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">');

fs.writeFileSync('src/pages/MediaHubPage.temp.tsx', code);
