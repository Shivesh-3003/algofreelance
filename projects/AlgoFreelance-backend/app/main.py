# In backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your route handlers
from .routes import jobs
# from .routes import ipfs # You'll add this next

app = FastAPI(
    title="AlgoFreelance API",
    description="Backend for the Decentralized Freelancer Escrow Platform",
    version="1.0.0"
)

# --- Add CORS Middleware ---
# This is the "glue" that lets your React app (on localhost:5173)
# talk to this backend (on localhost:8000)
origins = [
    "http://localhost:5173", # Default for React+Vite <---We will be using this
    "http://localhost:3000", # Default for Create React App
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods
    allow_headers=["*"], # Allow all headers
)

# --- Include Your Routers ---
app.include_router(jobs.router)
# app.include_router(ipfs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AlgoFreelance API"}