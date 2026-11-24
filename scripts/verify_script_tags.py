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
        tags = re.findall(r'<script src=[\'"](.*?)[\'"]', t)
        docs_tag = [tag for tag in tags if 'balsons-docs-manager.js' in tag]
        print(f"{p} -> {docs_tag}")
