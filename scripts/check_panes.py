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
        lines = f.readlines()
        nav_line = 0
        last_pane_line = 0
        has_docs_btn = False
        has_docs_pane = False
        for idx, l in enumerate(lines):
            if 'class="beds-tab-nav"' in l:
                nav_line = idx + 1
            if 'data-tab="tab-documents"' in l:
                has_docs_btn = True
            if 'id="tab-documents"' in l:
                has_docs_pane = True
            if 'class="beds-tab-pane' in l:
                last_pane_line = idx + 1
        print(f"{p}: nav_line={nav_line}, last_pane={last_pane_line}, has_btn={has_docs_btn}, has_pane={has_docs_pane}")
