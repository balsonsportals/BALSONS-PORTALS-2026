import re

portals = [
    'BALSONS HR MANAGER/frontend/index.html',
    'BALSONS GATE ENTRY MANAGER/frontend/index.html',
    'BALSONS SAFETY MANAGER/frontend/index.html',
    'BALSONS STORE MANAGER/frontend/index.html',
    'BALSONS PURCHASE MANAGER/index.html',
    'BALSONS OPERATIONS MANAGER/index.html',
    'BALSONS REPORTS PORTAL/index.html'
]

for p in portals:
    with open(p, 'r', encoding='utf-8') as f:
        t = f.read()
        m = re.search(r'<nav class="beds-tabs-nav">(.*?)</nav>', t, re.DOTALL)
        print(f"=== {p} ===")
        if m:
            print(m.group(0).strip())
        else:
            print("NO NAV FOUND")
