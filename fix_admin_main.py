import re

with open("src/pages/AdminPage.tsx", "r") as f:
    content = f.read()

target = r'<main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">'
replacement = '<main className="flex-1 pb-28 max-w-7xl mx-auto w-full">'

new_content = content.replace(target, replacement)

with open("src/pages/AdminPage.tsx", "w") as f:
    f.write(new_content)
