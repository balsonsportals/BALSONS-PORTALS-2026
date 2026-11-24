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
        tabs = re.findall(r'data-tab=[\"\'](.*?)[\"\']', t)
        btn_texts = re.findall(r'<button[^>]*data-tab=[\"\'](.*?)[\"\'][^>]*>(.*?)</button>', t, re.DOTALL)
        print(f"=== {p} ===")
        for tab_id, text in btn_texts:
            clean_text = re.sub(r'<.*?>', '', text).strip()
            print(f"  - [{tab_id}]: {clean_text}")
