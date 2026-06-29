import os
import hashlib
import asyncio
import wave
from fastapi import HTTPException
from fastapi.responses import Response

# Cache voice models to only load them once
loaded_voices = {}

def get_piper_voice(model_name: str):
    global loaded_voices
    if model_name not in loaded_voices:
        try:
            from piper.voice import PiperVoice
            model_path = os.path.join(r"C:\Users\Julien\Documents", f"{model_name}.onnx")
            config_path = os.path.join(r"C:\Users\Julien\Documents", f"{model_name}.onnx.json")
            
            # Fallback to local config in app directory if not in Documents
            if not os.path.exists(model_path):
                model_path = os.path.join("cache", f"{model_name}.onnx")
                config_path = os.path.join("cache", f"{model_name}.onnx.json")
                
            if not os.path.exists(model_path):
                raise Exception(f"Le fichier de modèle Piper {model_name}.onnx est introuvable dans Documents ou cache.")
                
            print(f"Chargement de la voix Piper locale depuis {model_path}...")
            # Load espeak-ng-data directory from the python package itself
            import piper
            espeak_data_dir = os.path.join(os.path.dirname(piper.__file__), "espeak-ng-data")
            
            voice = PiperVoice.load(
                model_path,
                config_path=config_path if os.path.exists(config_path) else None,
                espeak_data_dir=espeak_data_dir
            )
            loaded_voices[model_name] = voice
            print(f"Voix Piper {model_name} chargée avec succès !")
        except Exception as e:
            print(f"Erreur lors de l'initialisation de Piper : {e}")
            raise
    return loaded_voices[model_name]

async def generate_piper_tts(text: str, voice_name: str, rate: int, pitch: int, cache_dir: str):
    try:
        # Check cache
        raw_key = f"{text}|piper_{voice_name}|{rate}|{pitch}".encode('utf-8')
        cache_key = hashlib.md5(raw_key).hexdigest()
        cache_file = os.path.join(cache_dir, f"{cache_key}.wav")

        if os.path.exists(cache_file):
            with open(cache_file, "rb") as f:
                cached_data = f.read()
            return Response(content=cached_data, media_type="audio/wav")

        # Load voice
        voice = await asyncio.to_thread(get_piper_voice, voice_name)
        
        # Configure synthesis speed (length_scale)
        # rate is percentage (-50 to +50). 
        # length_scale is multiplier (1.0 is normal, 1.2 is slower, 0.8 is faster)
        # multiplier = 1.0 - (rate / 100.0)
        # So rate = +20% -> multiplier = 0.8 (faster). rate = -20% -> multiplier = 1.2 (slower)
        from piper.config import SynthesisConfig
        speed_multiplier = 1.0 - (rate / 100.0)
        # Clamp multiplier to safe bounds
        speed_multiplier = max(0.5, min(2.0, speed_multiplier))
        syn_config = SynthesisConfig(length_scale=speed_multiplier)

        # Run synthesis in a separate thread to prevent blocking FastAPI
        def _run_synthesis():
            with wave.open(cache_file, "wb") as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2) # 16-bit
                wav_file.setframerate(voice.config.sample_rate)
                
                # Synthesize
                for chunk in voice.synthesize(text, syn_config=syn_config):
                    wav_file.writeframes(chunk.audio_int16_bytes)

        await asyncio.to_thread(_run_synthesis)
            
        with open(cache_file, "rb") as f:
            audio_bytes = f.read()
            
        return Response(content=audio_bytes, media_type="audio/wav")
        
    except Exception as e:
        print(f"Erreur de Synthèse Piper : {e}")
        raise HTTPException(status_code=500, detail=str(e))
