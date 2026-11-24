import re
import os

portal_configs = [
    {
        'path': 'BALSONS HR MANAGER/frontend/index.html',
        'btn_text': '📁 Universal Document Vault (KYC &amp; Form 31)',
        'script_tag': '<script src="../../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS GATE ENTRY MANAGER/frontend/index.html',
        'btn_text': '📁 Gate Pass &amp; Challan Vault',
        'script_tag': '<script src="../../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS SAFETY MANAGER/frontend/index.html',
        'btn_text': '📁 PTW &amp; Safety Evidence Vault',
        'script_tag': '<script src="../../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS STORE MANAGER/frontend/index.html',
        'btn_text': '📁 Form 11 &amp; Tackle Cert Vault',
        'script_tag': '<script src="../../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS PURCHASE MANAGER/index.html',
        'btn_text': '📁 PO, Quotations &amp; CST Vault',
        'script_tag': '<script src="../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS OPERATIONS MANAGER/index.html',
        'btn_text': '📁 CAD Blueprints &amp; Rigging Vault',
        'script_tag': '<script src="../assets/js/balsons-docs-manager.js"></script>'
    },
    {
        'path': 'BALSONS REPORTS PORTAL/index.html',
        'btn_text': '📁 Universal Multi-Format Evidence Vault',
        'script_tag': '<script src="../assets/js/balsons-docs-manager.js"></script>'
    }
]

for cfg in portal_configs:
    file_path = cfg['path']
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add tab button if not present
    if 'data-tab="tab-documents"' not in content:
        btn_html = f'    <button class="beds-tab-btn" data-tab="tab-documents">{cfg["btn_text"]}</button>\n  </nav>'
        content = content.replace('  </nav>', btn_html, 1)
        print(f"Added tab button to: {file_path}")

    # 2. Add section id="tab-documents" before the shared scripts or closing tag
    if 'id="tab-documents"' not in content:
        pane_html = '\n  <!-- TAB: UNIVERSAL MULTI-FORMAT DOCUMENT & EVIDENCE VAULT -->\n  <section id="tab-documents" class="beds-tab-pane"></section>\n'
        # find where the last section ends or before Shared Core Scripts
        if '<!-- Shared Core Scripts -->' in content:
            content = content.replace('<!-- Shared Core Scripts -->', pane_html + '\n  <!-- Shared Core Scripts -->', 1)
        elif '<!-- Shared Scripts -->' in content:
            content = content.replace('<!-- Shared Scripts -->', pane_html + '\n  <!-- Shared Scripts -->', 1)
        elif '<script src=' in content:
            idx = content.find('<script src=')
            content = content[:idx] + pane_html + '\n  ' + content[idx:]
        print(f"Added tab-documents pane to: {file_path}")

    # 3. Ensure balsons-docs-manager.js is included in script tags
    if 'balsons-docs-manager.js' not in content:
        # insert before app.js or closing body
        if 'src="assets/js/app.js"' in content or 'src="../assets/js/app.js"' in content:
            match = re.search(r'<script src=".*?assets/js/app.js"></script>', content)
            if match:
                content = content[:match.start()] + f'{cfg["script_tag"]}\n  ' + content[match.start():]
                print(f"Added script tag before app.js in: {file_path}")
        else:
            content = content.replace('</body>', f'  {cfg["script_tag"]}\n</body>', 1)
            print(f"Added script tag before </body> in: {file_path}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nAll 7 portal templates integrated with Universal Document Vault!")
