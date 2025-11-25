#!/usr/bin/env python3
"""
Script to safely update .env file with generated secrets
Avoids shell parsing issues with angle brackets
"""
import os
import subprocess
import json
import base64
import hmac
import hashlib
import time

def generate_password(length=32):
    """Generate a random password"""
    result = subprocess.run(['openssl', 'rand', '-base64', '48'], 
                          capture_output=True, text=True, check=True)
    password = result.stdout.strip().replace('=', '').replace('+', '').replace('/', '')
    return password[:length]

def generate_jwt_secret():
    """Generate JWT secret (256-bit)"""
    result = subprocess.run(['openssl', 'rand', '-base64', '32'], 
                          capture_output=True, text=True, check=True)
    return result.stdout.strip()

def base64url_encode(data):
    """Base64 URL encode"""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def generate_jwt_token(secret, role, exp_seconds=315360000):
    """Generate JWT token with claims"""
    # Header
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode())
    
    # Payload
    now = int(time.time())
    exp = now + exp_seconds
    payload = {
        "role": role,
        "iss": "supabase",
        "iat": now,
        "exp": exp
    }
    payload_b64 = base64url_encode(json.dumps(payload, separators=(',', ':')).encode())
    
    # Signature
    message = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(secret.encode(), message, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def main():
    # Generate secrets
    print("Generating secrets...")
    postgres_password = generate_password(32)
    minio_password = generate_password(32)
    jwt_secret = generate_jwt_secret()
    anon_key = generate_jwt_token(jwt_secret, "anon")
    service_role_key = generate_jwt_token(jwt_secret, "service_role")
    
    print(f"✓ Generated POSTGRES_PASSWORD")
    print(f"✓ Generated MINIO_ROOT_PASSWORD")
    print(f"✓ Generated JWT_SECRET")
    print(f"✓ Generated ANON_KEY")
    print(f"✓ Generated SERVICE_ROLE_KEY")
    
    # Read .env file
    env_path = os.path.join(os.path.dirname(__file__), '..', 'docker', '.env')
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update lines
    updated_lines = []
    for line in lines:
        if line.startswith('POSTGRES_PASSWORD='):
            updated_lines.append(f'POSTGRES_PASSWORD={postgres_password}\n')
        elif line.startswith('MINIO_ROOT_PASSWORD='):
            updated_lines.append(f'MINIO_ROOT_PASSWORD={minio_password}\n')
        elif line.startswith('JWT_SECRET='):
            updated_lines.append(f'JWT_SECRET={jwt_secret}\n')
        elif line.startswith('ANON_KEY='):
            updated_lines.append(f'ANON_KEY={anon_key}\n')
        elif line.startswith('SERVICE_ROLE_KEY='):
            updated_lines.append(f'SERVICE_ROLE_KEY={service_role_key}\n')
        else:
            updated_lines.append(line)
    
    # Write updated .env file
    with open(env_path, 'w') as f:
        f.writelines(updated_lines)
    
    print(f"\n✓ Updated {env_path}")
    print("\nSecrets have been generated and saved to docker/.env")
    print("\nNext steps:")
    print("  1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/")
    print("  2. Start Docker Desktop")
    print("  3. Run: cd docker && ./start.sh")

if __name__ == '__main__':
    main()