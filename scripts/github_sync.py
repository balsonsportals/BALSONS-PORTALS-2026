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

if __name__ == '__main__':
    create_fresh_repo()

