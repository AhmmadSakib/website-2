import re
import os

files_to_update = [
    "src/pages/AboutPage.tsx",
    "src/pages/ProjectsPage.tsx",
    "src/pages/SkillsPage.tsx",
    "src/pages/CertificatesPage.tsx",
    "src/pages/VaultPage.tsx",
    "src/pages/ContactPage.tsx"
]

for file in files_to_update:
    if not os.path.exists(file):
        continue
    with open(file, "r") as f:
        content = f.read()

    # Find the top level motion.div or div that wraps the page
    # It usually has className="min-h-screen ...
    # We will replace it to add the ambient glows inside.

    # First, let's see if we can just inject it after the opening tag of min-h-screen
    pattern = r'(className="min-h-screen[^"]*"[^>]*>\s*)(<div className="w-full max-w-7xl|<div className="max-w-7xl)'
    replacement = r'\1\n      {/* Ambient Gradients */}\n      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E51F2A]/10 rounded-full blur-[160px] pointer-events-none z-0" />\n      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#E51F2A]/5 rounded-full blur-[160px] pointer-events-none z-0" />\n      \n      \2 relative z-10'

    new_content = re.sub(pattern, replacement, content)
    
    # Also add "relative overflow-hidden" to the min-h-screen class if it's not there
    # Let's do a simpler approach:
    new_content = re.sub(r'(className="min-h-screen[^"]*)(")', r'\1 relative overflow-hidden\2', new_content)

    with open(file, "w") as f:
        f.write(new_content)
