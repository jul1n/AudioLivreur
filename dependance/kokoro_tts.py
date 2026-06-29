import os
import hashlib
import asyncio
import soundfile as sf
from fastapi import HTTPException
from fastapi.responses import Response

# Variables globales pour ne charger le modèle qu'une seule fois
pipeline = None

def init_kokoro():
    global pipeline
    if pipeline is None:
        try:
            print("Initialisation du modèle Kokoro (Local)... Cela peut prendre quelques instants au premier lancement.")
            from kokoro import KPipeline
            from kokoro.model import KModel
            import os
            import torch
            
            local_model_path = r"C:\Users\Julien\Documents\kokoro-v1_0.pth"
            local_config_path = r"C:\Users\Julien\Documents\config.json"
            
            if os.path.exists(local_model_path):
                print(f"Chargement du modèle Kokoro depuis {local_model_path}")
                # Use local config if available in cache, otherwise let it download
                if os.path.exists(local_config_path):
                    local_model = KModel(model=local_model_path, config=local_config_path)
                else:
                    local_model = KModel(model=local_model_path)
                
                pipeline = KPipeline(lang_code='f', model=local_model)
                
                # Pre-load local voices if they exist to bypass Hugging Face
                voices_to_check = ['af_bella', 'ff_siwis']
                for v in voices_to_check:
                    local_voice = rf"C:\Users\Julien\Documents\{v}.pt"
                    if os.path.exists(local_voice):
                        print(f"Chargement de la voix {v} locale depuis {local_voice}")
                        pipeline.voices[v] = torch.load(local_voice, map_location='cpu')
            else:
                pipeline = KPipeline(lang_code='f')
            print("Modèle Kokoro chargé avec succès !")
        except Exception as e:
            print(f"Erreur lors de l'initialisation de Kokoro : {e}")
            raise

async def generate_kokoro_tts(text: str, voice: str, rate: int, pitch: int, cache_dir: str):
    global pipeline
    if pipeline is None:
        await asyncio.to_thread(init_kokoro)
        
    try:
        raw_key = f"{text}|{voice}|{rate}|{pitch}".encode('utf-8')
        cache_key = hashlib.md5(raw_key).hexdigest()
        cache_file = os.path.join(cache_dir, f"{cache_key}.wav")

        if os.path.exists(cache_file):
            with open(cache_file, "rb") as f:
                cached_data = f.read()
            return Response(content=cached_data, media_type="audio/wav")

        # Ajustement de la vitesse (rate) :
        # Edge TTS utilise des pourcentages (-50% à +50%). 
        # Kokoro utilise un multiplicateur de vitesse (1.0 = normal).
        speed_multiplier = 1.0 + (rate / 100.0)

        # Execution de Kokoro dans un thread séparé pour ne pas bloquer le serveur
        def _run_pipeline():
            real_voice = voice.replace("kokoro_", "") if voice.startswith("kokoro_") else voice
            generator = pipeline(
                text, voice=real_voice,
                speed=speed_multiplier, split_pattern=r'\n+'
            )
            audio_chunks = []
            for gs, ps, audio in generator:
                audio_chunks.extend(audio)
            return audio_chunks

        all_audio = await asyncio.to_thread(_run_pipeline)
            
        if not all_audio:
            raise Exception("Le modèle n'a généré aucun audio.")
            
        import numpy as np
        audio_np = np.array(all_audio)
        
        sf.write(cache_file, audio_np, 24000)
        
        with open(cache_file, "rb") as f:
            audio_bytes = f.read()
            
        return Response(content=audio_bytes, media_type="audio/wav")
        
    except Exception as e:
        print(f"Erreur de Synthèse Kokoro : {e}")
        raise HTTPException(status_code=500, detail=str(e))
