import urllib.request
import json
import ctypes
from ctypes import wintypes
import sys

advapi32 = ctypes.windll.advapi32
class FILETIME(ctypes.Structure):
    _fields_ = [('dwLowDateTime', wintypes.DWORD), ('dwHighDateTime', wintypes.DWORD)]
class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ('Flags', wintypes.DWORD), ('Type', wintypes.DWORD), ('TargetName', wintypes.LPWSTR),
        ('Comment', wintypes.LPWSTR), ('LastWritten', FILETIME), ('CredentialBlobSize', wintypes.DWORD),
        ('CredentialBlob', ctypes.POINTER(ctypes.c_byte)), ('Persist', wintypes.DWORD),
        ('AttributeCount', wintypes.DWORD), ('Attributes', ctypes.c_void_p),
        ('TargetAlias', wintypes.LPWSTR), ('UserName', wintypes.LPWSTR)
    ]
CredRead = advapi32.CredReadW
CredRead.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(ctypes.POINTER(CREDENTIAL))]
CredRead.restype = wintypes.BOOL
CredFree = advapi32.CredFree
CredFree.argtypes = [ctypes.c_void_p]

def get_github_token():
    pcred = ctypes.POINTER(CREDENTIAL)()
    if CredRead('git:https://balsonsportals@github.com', 1, 0, ctypes.byref(pcred)):
        raw = ctypes.string_at(pcred.contents.CredentialBlob, pcred.contents.CredentialBlobSize)
        token = raw.decode('utf-16-le', errors='ignore').strip()
        CredFree(pcred)
        return token
    return None

def create_fresh_repo(repo_name='BALSONS-PORTALS-2026', description='BALSONS Heavy Lift & Shift - Multi-Portal Enterprise Ecosystem 2026'):
    token = get_github_token()
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BALSONS-Deployment-Engine'
    }
    
    # Check if repo exists
    req_check = urllib.request.Request(f'https://api.github.com/repos/balsonsportals/{repo_name}', headers=headers)
    try:
        with urllib.request.urlopen(req_check) as resp:
            data = json.loads(resp.read().decode())
            print(f"Repository '{repo_name}' already exists: {data['html_url']}")
            return data
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"Repository '{repo_name}' does not exist yet. Creating...")
        else:
            raise
            
    payload = json.dumps({
        'name': repo_name,
        'description': description,
        'private': False,
        'has_issues': True,
        'has_projects': True,
        'has_wiki': True
    }).encode('utf-8')
    
    req_create = urllib.request.Request('https://api.github.com/user/repos', data=payload, headers=headers, method='POST')
    with urllib.request.urlopen(req_create) as resp:
        data = json.loads(resp.read().decode())
        print(f"SUCCESS: Created fresh repository '{repo_name}'!")
        print(f"URL: {data['html_url']}")
        print(f"Clone URL: {data['clone_url']}")
        return data

import subprocess

def push_to_repo(repo_name='BALSONS-PORTALS-2026'):
    token = get_github_token()
    if not token:
        print("ERROR: Could not retrieve token.")
        return False
        
    push_url = f"https://balsonsportals:{token}@github.com/balsonsportals/{repo_name}.git"
    public_url = f"https://github.com/balsonsportals/{repo_name}.git"
    
    # 1. Update git remote origin
    print(f"Setting remote origin to {public_url}...")
    subprocess.run(['git', 'remote', 'set-url', 'origin', public_url], check=False)
    
    # 2. Push master
    print(f"Pushing branch 'master' to {repo_name}...")
    res_master = subprocess.run(['git', 'push', '-u', push_url, 'master', '--force'], capture_output=True, text=True)
    print("Master stdout:", res_master.stdout)
    if res_master.stderr:
        # Mask token if printed in stderr
        masked = res_master.stderr.replace(token, '***TOKEN***')
        print("Master stderr:", masked)
        
    # 3. Push main
    print(f"Pushing branch 'main' to {repo_name}...")
    res_main = subprocess.run(['git', 'push', '-u', push_url, 'main', '--force'], capture_output=True, text=True)
    print("Main stdout:", res_main.stdout)
    if res_main.stderr:
        masked = res_main.stderr.replace(token, '***TOKEN***')
        print("Main stderr:", masked)
        
    return res_master.returncode == 0 and res_main.returncode == 0

def enable_github_pages(repo_name='BALSONS-PORTALS-2026', branch='main'):
    token = get_github_token()
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BALSONS-Deployment-Engine'
    }
    
    # Check current pages status
    req_check = urllib.request.Request(f'https://api.github.com/repos/balsonsportals/{repo_name}/pages', headers=headers)
    try:
        with urllib.request.urlopen(req_check) as resp:
            data = json.loads(resp.read().decode())
            print(f"GitHub Pages already active: {data.get('html_url')}")
            return data
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("GitHub Pages not active yet. Enabling on branch:", branch)
        else:
            print(f"Error checking pages: {e}")
            
    payload = json.dumps({
        'source': {
            'branch': branch,
            'path': '/'
        }
    }).encode('utf-8')
    
    req_enable = urllib.request.Request(f'https://api.github.com/repos/balsonsportals/{repo_name}/pages', data=payload, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req_enable) as resp:
            data = json.loads(resp.read().decode())
            print("SUCCESS: GitHub Pages enabled!")
            print(f"Pages URL: {data.get('html_url')}")
            return data
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        print(f"Failed to enable Pages: {e.code} - {err_msg}")
        return None

if __name__ == '__main__':
    create_fresh_repo()
    success = push_to_repo()
    if success:
        print("Push completed successfully. Enabling GitHub Pages...")
        enable_github_pages(branch='main')
    else:
        print("Push encountered issues.")


