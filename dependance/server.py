import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
import uvicorn
import logging
import hashlib

CACHE_DIR = "cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

app = FastAPI(title="AudioLivreur Local API")

# Allow CORS if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mute edge-tts info logs
logging.getLogger("edge_tts").setLevel(logging.ERROR)

class TTSRequest(BaseModel):
    text: str
    voice: str = "fr-FR-VivienneMultilingualNeural"
    rate: int = 0
    pitch: int = 0

@app.post("/api/tts")
async def generate_tts(req: TTSRequest):
    try:
        # Création d'une clé de cache unique basée sur le texte et les paramètres
        raw_key = f"{req.text}|{req.voice}|{req.rate}|{req.pitch}".encode('utf-8')
        cache_key = hashlib.md5(raw_key).hexdigest()
        cache_file = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        
        # Si le fichier existe déjà en cache, on le renvoie directement (Reprise)
        if os.path.exists(cache_file):
            with open(cache_file, "rb") as f:
                cached_data = f.read()
            return Response(content=cached_data, media_type="audio/mpeg")

        # Format rate and pitch as required by edge_tts (e.g. "+0%", "+0Hz")
        rate_str = f"+{req.rate}%" if req.rate >= 0 else f"{req.rate}%"
        pitch_str = f"+{req.pitch}Hz" if req.pitch >= 0 else f"{req.pitch}Hz"
        
        communicate = edge_tts.Communicate(
            req.text,
            req.voice,
            rate=rate_str,
            pitch=pitch_str
        )
        
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
                
        if not audio_data:
            raise HTTPException(status_code=500, detail="Aucune donnée audio reçue de Microsoft.")
            
        # Sauvegarde dans le cache pour les futures reprises
        with open(cache_file, "wb") as f:
            f.write(audio_data)
            
        return Response(content=bytes(audio_data), media_type="audio/mpeg")
        
    except Exception as e:
        print(f"Erreur de Synthèse : {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/css", StaticFiles(directory="css"), name="css")
if os.path.exists("assets"):
    app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
async def root():
    return FileResponse("index.html")

if __name__ == "__main__":
    print("\n=======================================================")
    print(">>> Serveur AudioLivreur Local demarre !")
    print("Acces depuis le navigateur : http://localhost:8000")
    print("=======================================================\n")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, log_level="warning")
