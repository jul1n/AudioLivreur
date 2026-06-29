import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
import shutil
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
import uvicorn
import logging
import hashlib
from kokoro_tts import generate_kokoro_tts
from piper_tts import generate_piper_tts

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

@app.middleware("http")
async def force_utf8_charset(request, call_next):
    response = await call_next(request)
    if response.headers.get("content-type") and "text/" in response.headers["content-type"] and "charset=" not in response.headers["content-type"].lower():
        response.headers["content-type"] += "; charset=utf-8"
    elif response.headers.get("content-type") and "application/javascript" in response.headers["content-type"] and "charset=" not in response.headers["content-type"].lower():
        response.headers["content-type"] += "; charset=utf-8"
    
    # Force override for windows where mimetypes might guess cp1252
    if response.headers.get("content-type") and "charset=cp1252" in response.headers["content-type"].lower():
        response.headers["content-type"] = response.headers["content-type"].lower().replace("charset=cp1252", "charset=utf-8")
        
    return response

# Mute edge-tts info logs
logging.getLogger("edge_tts").setLevel(logging.ERROR)

class TTSRequest(BaseModel):
    text: str
    voice: str = "fr-FR-VivienneMultilingualNeural"
    rate: int = 0
    pitch: int = 0

def ensure_aac_cached(audio_bytes: bytes, original_extension: str):
    import tempfile
    import subprocess
    audio_hash = hashlib.md5(audio_bytes).hexdigest()
    aac_cache_path = os.path.join(CACHE_DIR, f"aac_{audio_hash}.aac")
    if os.path.exists(aac_cache_path):
        return
        
    temp_in_fd, temp_in_name = tempfile.mkstemp(suffix=original_extension)
    temp_out_fd, temp_out_name = tempfile.mkstemp(suffix=".aac")
    try:
        with os.fdopen(temp_in_fd, "wb") as f:
            f.write(audio_bytes)
        os.close(temp_out_fd)
        
        cmd = [
            "ffmpeg", "-y",
            "-i", temp_in_name,
            "-c:a", "aac",
            "-b:a", "128k",
            temp_out_name
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        
        with open(temp_out_name, "rb") as f:
            aac_bytes = f.read()
        
        with open(aac_cache_path, "wb") as f:
            f.write(aac_bytes)
    except Exception as e:
        print(f"Error pre-caching AAC in background: {e}")
    finally:
        try:
            os.unlink(temp_in_name)
            os.unlink(temp_out_name)
        except:
            pass

@app.post("/api/tts")
async def generate_tts(req: TTSRequest, background_tasks: BackgroundTasks):
    try:
        # Création d'une clé de cache unique basée sur le texte et les paramètres
        raw_key = f"{req.text}|{req.voice}|{req.rate}|{req.pitch}".encode('utf-8')
        cache_key = hashlib.md5(raw_key).hexdigest()
        cache_file = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        
        # Si le fichier existe déjà en cache, on le renvoie directement (Reprise)
        if os.path.exists(cache_file):
            with open(cache_file, "rb") as f:
                cached_data = f.read()
            background_tasks.add_task(ensure_aac_cached, cached_data, ".mp3")
            return Response(content=cached_data, media_type="audio/mpeg")

        # Edge TTS handling
        if req.voice.startswith("kokoro_"):
            # voice format: kokoro_af_bella -> af_bella
            k_voice = req.voice.replace("kokoro_", "")
            response = await generate_kokoro_tts(req.text, k_voice, req.rate, req.pitch, CACHE_DIR)
            background_tasks.add_task(ensure_aac_cached, response.body, ".wav")
            return response

        # Piper handling
        if req.voice.startswith("piper_"):
            # voice format: piper_fr_FR-gilles-low -> fr_FR-gilles-low
            p_voice = req.voice.replace("piper_", "")
            response = await generate_piper_tts(req.text, p_voice, req.rate, req.pitch, CACHE_DIR)
            background_tasks.add_task(ensure_aac_cached, response.body, ".wav")
            return response
            
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
            
        background_tasks.add_task(ensure_aac_cached, bytes(audio_data), ".mp3")
        return Response(content=bytes(audio_data), media_type="audio/mpeg")
        
    except Exception as e:
        print(f"Erreur de Synthèse : {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ping")
async def ping():
    import subprocess
    # Check if ffmpeg is available
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return {"status": "ok", "ffmpeg": True}
    except Exception:
        return {"status": "ok", "ffmpeg": False}

from fastapi import Form, UploadFile, File
from typing import List, Optional
import shutil
import tempfile
import uuid

@app.post("/api/merge_m4b")
async def merge_m4b(
    title: str = Form("Audiobook"),
    author: str = Form("Auteur inconnu"),
    codec: str = Form("aac"),
    cover: Optional[UploadFile] = File(None),
    chapters: List[UploadFile] = File(...),
    chapter_titles: List[str] = Form(...)
):
    import subprocess
    try:
        # Check if ffmpeg is available
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except Exception:
        raise HTTPException(status_code=500, detail="FFmpeg n'est pas installé sur le serveur.")

    # Create a temporary directory for processing
    temp_dir = tempfile.mkdtemp()
    try:
        cover_path = None
        if cover:
            cover_path = os.path.join(temp_dir, "cover.jpg")
            with open(cover_path, "wb") as buffer:
                shutil.copyfileobj(cover.file, buffer)

        # Save chapters and check AAC cache
        chapter_paths = []
        aac_paths = []
        chapters_to_transcode = [] # list of (idx, mp3_p, target_aac_p, cache_aac_p)

        for i, chap_file in enumerate(chapters):
            file_bytes = chap_file.file.read()
            chap_file.file.seek(0)
            
            audio_hash = hashlib.md5(file_bytes).hexdigest()
            cache_aac_path = os.path.join(CACHE_DIR, f"aac_{audio_hash}.aac")
            target_aac_path = os.path.join(temp_dir, f"chap_{i}.aac")
            
            mp3_path = os.path.join(temp_dir, f"chap_{i}.mp3")
            with open(mp3_path, "wb") as f:
                f.write(file_bytes)
                
            chapter_paths.append(mp3_path)
            
            if codec != "copy":
                if os.path.exists(cache_aac_path):
                    # Cache hit!
                    shutil.copy2(cache_aac_path, target_aac_path)
                else:
                    # Cache miss!
                    chapters_to_transcode.append((i, mp3_path, target_aac_path, cache_aac_path))
                aac_paths.append(target_aac_path)

        # Create FFmpeg concat file
        concat_path = os.path.join(temp_dir, "concat.txt")
        with open(concat_path, "w", encoding="utf-8") as f:
            for chap_path in chapter_paths:
                f.write(f"file '{os.path.basename(chap_path)}'\n")

        # Get durations to build metadata
        durations = []
        for chap_path in chapter_paths:
            ffprobe_cmd = [
                "ffprobe", "-v", "error", "-show_entries",
                "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
                chap_path
            ]
            result = subprocess.run(ffprobe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            duration_sec = float(result.stdout.strip()) if result.stdout.strip() else 0
            durations.append(duration_sec)

        # Create FFmpeg metadata file
        metadata_path = os.path.join(temp_dir, "metadata.txt")
        with open(metadata_path, "w", encoding="utf-8") as f:
            f.write(";FFMETADATA1\n")
            f.write(f"title={title}\n")
            f.write(f"artist={author}\n\n")
            
            current_time_ms = 0
            for i, duration_sec in enumerate(durations):
                duration_ms = int(duration_sec * 1000)
                start_time = current_time_ms
                end_time = current_time_ms + duration_ms
                f.write("[CHAPTER]\n")
                f.write("TIMEBASE=1/1000\n")
                f.write(f"START={start_time}\n")
                f.write(f"END={end_time}\n")
                chap_title = chapter_titles[i] if i < len(chapter_titles) else f"Chapitre {i+1}"
                f.write(f"title={chap_title}\n\n")
                current_time_ms = end_time

        if codec == "copy":
            temp_mp3 = os.path.join(temp_dir, "temp.mp3")
            ffmpeg_cmd_concat = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", concat_path,
                "-c", "copy",
                temp_mp3
            ]
            process_concat = subprocess.run(ffmpeg_cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if process_concat.returncode != 0:
                print("FFmpeg Concat Error:", process_concat.stderr)
                raise HTTPException(status_code=500, detail="Erreur lors de la pre-fusion par FFmpeg.")

            output_m4b = os.path.join(temp_dir, "output.m4b")
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", temp_mp3,
                "-i", metadata_path
            ]
            if cover_path:
                ffmpeg_cmd.extend(["-i", cover_path])
            ffmpeg_cmd.extend(["-map_metadata", "1"])
            if cover_path:
                ffmpeg_cmd.extend(["-map", "0:a", "-map", "2:v", "-c:v", "mjpeg", "-disposition:v", "attached_pic"])
            else:
                ffmpeg_cmd.extend(["-map", "0:a"])
            ffmpeg_cmd.extend([
                "-map_chapters", "1",
                "-c:a", "copy",
                "-f", "mp4",
                output_m4b
            ])
            process = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if process.returncode != 0:
                print("FFmpeg Error:", process.stderr)
                raise HTTPException(status_code=500, detail="Erreur lors de la fusion par FFmpeg.")
        else:
            # Mode standard (AAC) : Encodage parallèle des chapitres manquants
            import asyncio
            
            async def transcode_chapter(idx, mp3_p, aac_p, cache_aac_p, sem):
                async with sem:
                    cmd = [
                        "ffmpeg", "-y",
                        "-i", mp3_p,
                        "-c:a", "aac",
                        "-b:a", "128k",
                        aac_p
                    ]
                    proc = await asyncio.create_subprocess_exec(
                        *cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    stdout, stderr = await proc.communicate()
                    if proc.returncode != 0:
                        raise Exception(f"Echec encodage chapitre {idx}: {stderr.decode('utf-8', errors='ignore')}")
                    # Cache the encoded AAC file
                    try:
                        shutil.copy2(aac_p, cache_aac_p)
                    except Exception as e:
                        print(f"Error caching AAC: {e}")

            tasks = []
            sem = asyncio.Semaphore(6) # Limite à 6 encodages simultanés pour le CPU
            for idx, mp3_path, target_aac_path, cache_aac_path in chapters_to_transcode:
                tasks.append(transcode_chapter(idx, mp3_path, target_aac_path, cache_aac_path, sem))
            
            if tasks:
                await asyncio.gather(*tasks)

            # Création du fichier concat pour les AAC
            concat_aac_path = os.path.join(temp_dir, "concat_aac.txt")
            with open(concat_aac_path, "w", encoding="utf-8") as f:
                for aac_path in aac_paths:
                    f.write(f"file '{os.path.basename(aac_path)}'\n")

            temp_aac = os.path.join(temp_dir, "temp.aac")
            ffmpeg_cmd_concat = [
                "ffmpeg", "-y",
                "-f", "concat", "-safe", "0", "-i", concat_aac_path,
                "-c", "copy",
                temp_aac
            ]
            process_concat = subprocess.run(ffmpeg_cmd_concat, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if process_concat.returncode != 0:
                print("FFmpeg Concat AAC Error:", process_concat.stderr)
                raise HTTPException(status_code=500, detail="Erreur lors de la pre-fusion des pistes AAC.")

            output_m4b = os.path.join(temp_dir, "output.m4b")
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", temp_aac,
                "-i", metadata_path
            ]
            if cover_path:
                ffmpeg_cmd.extend(["-i", cover_path])
            ffmpeg_cmd.extend(["-map_metadata", "1"])
            if cover_path:
                ffmpeg_cmd.extend(["-map", "0:a", "-map", "2:v", "-c:v", "mjpeg", "-disposition:v", "attached_pic"])
            else:
                ffmpeg_cmd.extend(["-map", "0:a"])
            ffmpeg_cmd.extend([
                "-map_chapters", "1",
                "-c:a", "copy", # Copie directe du flux AAC pré-encodé
                "-f", "mp4",
                output_m4b
            ])
            process = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if process.returncode != 0:
                print("FFmpeg Error:", process.stderr)
                raise HTTPException(status_code=500, detail="Erreur lors de la fusion finale M4B.")

        with open(output_m4b, "rb") as f:
            m4b_data = f.read()

        return Response(content=m4b_data, media_type="audio/m4b")
    
    finally:
        # Cleanup temp dir
        shutil.rmtree(temp_dir, ignore_errors=True)

# Mount static files
app.mount("/js", StaticFiles(directory="js"), name="js")
app.mount("/css", StaticFiles(directory="css"), name="css")
if os.path.exists("assets"):
    app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
async def root():
    return FileResponse("index.html", media_type="text/html; charset=utf-8")

if __name__ == "__main__":
    print("\n=======================================================")
    print(">>> Serveur AudioLivreur Local demarre !")
    print("Acces depuis le navigateur : http://localhost:8000")
    print("=======================================================\n")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, log_level="warning")
