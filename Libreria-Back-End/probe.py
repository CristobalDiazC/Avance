from dotenv import load_dotenv, find_dotenv
import os
from pathlib import Path

env_path = find_dotenv(usecwd=True) or str(Path(__file__).parent / ".env")
print("Usando .env en:", env_path)

ok = load_dotenv(dotenv_path=env_path)
print("Cargado:", ok)

print("DB_HOST =", os.getenv("DB_HOST"))
print("DB_PORT =", os.getenv("DB_PORT"))
print("DB_USER =", os.getenv("DB_USER"))
print("DB_PASSWORD set? ->", "YES" if os.getenv("DB_PASSWORD") else "NO")
print("DB_NAME =", os.getenv("DB_NAME"))