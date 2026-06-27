/**
 * Studio Synthèse Vocale Hybride HD (Client-Side) - v0.5.0
 * - Support complet de toutes les langues Bing TTS (Français, Anglais Unifié, Espagnol, Allemand, Italien, Portugais, Japonais, Chinois, Arabe, etc.)
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
        this.secMsGecVersion = "1-143.0.3650.75";
        this.voicesDatabase = [
            {
                        "ShortName": "fr-FR-VivienneMultilingualNeural",
                        "LocalName": "Vivienne (Multilingue) (FR - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 1.05,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "ar-DZ-AminaNeural",
                        "LocalName": "Amina (DZ - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-DZ",
                        "PitchMod": 0.85,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "ar-DZ-IsmaelNeural",
                        "LocalName": "Ismael (DZ - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-DZ",
                        "PitchMod": 1.02,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "ar-BH-AliNeural",
                        "LocalName": "Ali (BH - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-BH",
                        "PitchMod": 1.07,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "ar-BH-LailaNeural",
                        "LocalName": "Laila (BH - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-BH",
                        "PitchMod": 1.12,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "ar-EG-SalmaNeural",
                        "LocalName": "Salma (EG - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-EG",
                        "PitchMod": 0.75,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "ar-EG-ShakirNeural",
                        "LocalName": "Shakir (EG - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-EG",
                        "PitchMod": 0.91,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "ar-IQ-BasselNeural",
                        "LocalName": "Bassel (IQ - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-IQ",
                        "PitchMod": 0.97,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "ar-IQ-RanaNeural",
                        "LocalName": "Rana (IQ - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-IQ",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "ar-JO-SanaNeural",
                        "LocalName": "Sana (JO - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-JO",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "ar-JO-TaimNeural",
                        "LocalName": "Taim (JO - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-JO",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "ar-KW-FahedNeural",
                        "LocalName": "Fahed (KW - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-KW",
                        "PitchMod": 0.75,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "ar-KW-NouraNeural",
                        "LocalName": "Noura (KW - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-KW",
                        "PitchMod": 1.2,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "ar-LB-LaylaNeural",
                        "LocalName": "Layla (LB - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-LB",
                        "PitchMod": 0.82,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "ar-LB-RamiNeural",
                        "LocalName": "Rami (LB - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-LB",
                        "PitchMod": 0.76,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "ar-LY-ImanNeural",
                        "LocalName": "Iman (LY - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-LY",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "ar-LY-OmarNeural",
                        "LocalName": "Omar (LY - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-LY",
                        "PitchMod": 1.05,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "ar-MA-JamalNeural",
                        "LocalName": "Jamal (MA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-MA",
                        "PitchMod": 1.18,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "ar-MA-MounaNeural",
                        "LocalName": "Mouna (MA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-MA",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "ar-OM-AbdullahNeural",
                        "LocalName": "Abdullah (OM - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-OM",
                        "PitchMod": 0.94,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "ar-OM-AyshaNeural",
                        "LocalName": "Aysha (OM - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-OM",
                        "PitchMod": 0.99,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "ar-QA-AmalNeural",
                        "LocalName": "Amal (QA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-QA",
                        "PitchMod": 1.16,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "ar-QA-MoazNeural",
                        "LocalName": "Moaz (QA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-QA",
                        "PitchMod": 0.94,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "ar-SA-HamedNeural",
                        "LocalName": "Hamed (SA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-SA",
                        "PitchMod": 1.18,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "ar-SA-ZariyahNeural",
                        "LocalName": "Zariyah (SA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-SA",
                        "PitchMod": 1.17,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "ar-SY-AmanyNeural",
                        "LocalName": "Amany (SY - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-SY",
                        "PitchMod": 1.15,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "ar-SY-LaithNeural",
                        "LocalName": "Laith (SY - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-SY",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "ar-TN-HediNeural",
                        "LocalName": "Hedi (TN - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-TN",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "ar-TN-ReemNeural",
                        "LocalName": "Reem (TN - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-TN",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "ar-AE-FatimaNeural",
                        "LocalName": "Fatima (AE - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-AE",
                        "PitchMod": 1.19,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "ar-AE-HamdanNeural",
                        "LocalName": "Hamdan (AE - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-AE",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "ar-YE-MaryamNeural",
                        "LocalName": "Maryam (YE - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-YE",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "ar-YE-SalehNeural",
                        "LocalName": "Saleh (YE - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-YE",
                        "PitchMod": 0.92,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "zh-HK-HiuGaaiNeural",
                        "LocalName": "HiuGaai (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-HK",
                        "PitchMod": 1.17,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "zh-HK-HiuMaanNeural",
                        "LocalName": "HiuMaan (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-HK",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "zh-HK-WanLungNeural",
                        "LocalName": "WanLung (HK - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-HK",
                        "PitchMod": 1.03,
                        "RateMod": 1.08
            },
            {
                        "ShortName": "zh-CN-XiaoxiaoNeural",
                        "LocalName": "Xiaoxiao (CN - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN",
                        "PitchMod": 0.85,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "zh-CN-XiaoyiNeural",
                        "LocalName": "Xiaoyi (CN - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN",
                        "PitchMod": 0.78,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "zh-CN-YunjianNeural",
                        "LocalName": "Yunjian (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN",
                        "PitchMod": 0.85,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "zh-CN-YunxiNeural",
                        "LocalName": "Yunxi (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN",
                        "PitchMod": 0.92,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "zh-CN-YunxiaNeural",
                        "LocalName": "Yunxia (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN",
                        "PitchMod": 0.89,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "zh-CN-YunyangNeural",
                        "LocalName": "Yunyang (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN",
                        "PitchMod": 0.98,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "zh-CN-liaoning-XiaobeiNeural",
                        "LocalName": "Xiaobei (liaoning - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN-liaoning",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "zh-TW-HsiaoChenNeural",
                        "LocalName": "HsiaoChen (TW - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-TW",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "zh-TW-YunJheNeural",
                        "LocalName": "YunJhe (TW - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-TW",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "zh-TW-HsiaoYuNeural",
                        "LocalName": "HsiaoYu (TW - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-TW",
                        "PitchMod": 0.83,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "zh-CN-shaanxi-XiaoniNeural",
                        "LocalName": "Xiaoni (shaanxi - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN-shaanxi",
                        "PitchMod": 1.1,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "nl-BE-ArnaudNeural",
                        "LocalName": "Arnaud (BE - Homme)",
                        "Gender": "Male",
                        "Locale": "nl-BE",
                        "PitchMod": 0.86,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "nl-BE-DenaNeural",
                        "LocalName": "Dena (BE - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-BE",
                        "PitchMod": 1.09,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "nl-NL-ColetteNeural",
                        "LocalName": "Colette (NL - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-NL",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "nl-NL-FennaNeural",
                        "LocalName": "Fenna (NL - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-NL",
                        "PitchMod": 0.9,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "nl-NL-MaartenNeural",
                        "LocalName": "Maarten (NL - Homme)",
                        "Gender": "Male",
                        "Locale": "nl-NL",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-AU-WilliamMultilingualNeural",
                        "LocalName": "William (Multilingue) (AU - Homme)",
                        "Gender": "Male",
                        "Locale": "en-AU",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-AU-NatashaNeural",
                        "LocalName": "Natasha (AU - Femme)",
                        "Gender": "Female",
                        "Locale": "en-AU",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-CA-ClaraNeural",
                        "LocalName": "Clara (CA - Femme)",
                        "Gender": "Female",
                        "Locale": "en-CA",
                        "PitchMod": 1.06,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-CA-LiamNeural",
                        "LocalName": "Liam (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "en-CA",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-HK-YanNeural",
                        "LocalName": "Yan (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "en-HK",
                        "PitchMod": 0.84,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-HK-SamNeural",
                        "LocalName": "Sam (HK - Homme)",
                        "Gender": "Male",
                        "Locale": "en-HK",
                        "PitchMod": 0.77,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "en-IN-NeerjaExpressiveNeural",
                        "LocalName": "Neerja (Expressif) (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IN",
                        "PitchMod": 1.09,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "en-IN-NeerjaNeural",
                        "LocalName": "Neerja (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IN",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-IN-PrabhatNeural",
                        "LocalName": "Prabhat (IN - Homme)",
                        "Gender": "Male",
                        "Locale": "en-IN",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-IE-ConnorNeural",
                        "LocalName": "Connor (IE - Homme)",
                        "Gender": "Male",
                        "Locale": "en-IE",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "en-IE-EmilyNeural",
                        "LocalName": "Emily (IE - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IE",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-KE-AsiliaNeural",
                        "LocalName": "Asilia (KE - Femme)",
                        "Gender": "Female",
                        "Locale": "en-KE",
                        "PitchMod": 0.8,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-KE-ChilembaNeural",
                        "LocalName": "Chilemba (KE - Homme)",
                        "Gender": "Male",
                        "Locale": "en-KE",
                        "PitchMod": 1.24,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-NZ-MitchellNeural",
                        "LocalName": "Mitchell (NZ - Homme)",
                        "Gender": "Male",
                        "Locale": "en-NZ",
                        "PitchMod": 0.77,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "en-NZ-MollyNeural",
                        "LocalName": "Molly (NZ - Femme)",
                        "Gender": "Female",
                        "Locale": "en-NZ",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-NG-AbeoNeural",
                        "LocalName": "Abeo (NG - Homme)",
                        "Gender": "Male",
                        "Locale": "en-NG",
                        "PitchMod": 1.15,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "en-NG-EzinneNeural",
                        "LocalName": "Ezinne (NG - Femme)",
                        "Gender": "Female",
                        "Locale": "en-NG",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "en-PH-JamesNeural",
                        "LocalName": "James (PH - Homme)",
                        "Gender": "Male",
                        "Locale": "en-PH",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-PH-RosaNeural",
                        "LocalName": "Rosa (PH - Femme)",
                        "Gender": "Female",
                        "Locale": "en-PH",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-AvaNeural",
                        "LocalName": "Ava (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-US-AndrewNeural",
                        "LocalName": "Andrew (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.18,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-EmmaNeural",
                        "LocalName": "Emma (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.93,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "en-US-BrianNeural",
                        "LocalName": "Brian (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.01,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-SG-LunaNeural",
                        "LocalName": "Luna (SG - Femme)",
                        "Gender": "Female",
                        "Locale": "en-SG",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-SG-WayneNeural",
                        "LocalName": "Wayne (SG - Homme)",
                        "Gender": "Male",
                        "Locale": "en-SG",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "en-ZA-LeahNeural",
                        "LocalName": "Leah (ZA - Femme)",
                        "Gender": "Female",
                        "Locale": "en-ZA",
                        "PitchMod": 1.24,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-ZA-LukeNeural",
                        "LocalName": "Luke (ZA - Homme)",
                        "Gender": "Male",
                        "Locale": "en-ZA",
                        "PitchMod": 0.97,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "en-TZ-ElimuNeural",
                        "LocalName": "Elimu (TZ - Homme)",
                        "Gender": "Male",
                        "Locale": "en-TZ",
                        "PitchMod": 1.23,
                        "RateMod": 1.08
            },
            {
                        "ShortName": "en-TZ-ImaniNeural",
                        "LocalName": "Imani (TZ - Femme)",
                        "Gender": "Female",
                        "Locale": "en-TZ",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-GB-LibbyNeural",
                        "LocalName": "Libby (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.76,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-GB-MaisieNeural",
                        "LocalName": "Maisie (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-GB-RyanNeural",
                        "LocalName": "Ryan (GB - Homme)",
                        "Gender": "Male",
                        "Locale": "en-GB",
                        "PitchMod": 0.88,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "en-GB-SoniaNeural",
                        "LocalName": "Sonia (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.84,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-GB-ThomasNeural",
                        "LocalName": "Thomas (GB - Homme)",
                        "Gender": "Male",
                        "Locale": "en-GB",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-AnaNeural",
                        "LocalName": "Ana (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-US-AndrewMultilingualNeural",
                        "LocalName": "Andrew (Multilingue) (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-US-AriaNeural",
                        "LocalName": "Aria (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.9,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "en-US-AvaMultilingualNeural",
                        "LocalName": "Ava (Multilingue) (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-US-BrianMultilingualNeural",
                        "LocalName": "Brian (Multilingue) (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.22,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-ChristopherNeural",
                        "LocalName": "Christopher (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.22,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-EmmaMultilingualNeural",
                        "LocalName": "Emma (Multilingue) (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.14,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-US-EricNeural",
                        "LocalName": "Eric (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-US-GuyNeural",
                        "LocalName": "Guy (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.18,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-JennyNeural",
                        "LocalName": "Jenny (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.75,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "en-US-MichelleNeural",
                        "LocalName": "Michelle (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.12,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-RogerNeural",
                        "LocalName": "Roger (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.2,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-US-SteffanNeural",
                        "LocalName": "Steffan (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.2,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-BE-CharlineNeural",
                        "LocalName": "Charline (BE - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-BE",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "fr-BE-GerardNeural",
                        "LocalName": "Gerard (BE - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-BE",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "fr-CA-ThierryNeural",
                        "LocalName": "Thierry (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 1.21,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "fr-CA-AntoineNeural",
                        "LocalName": "Antoine (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "fr-CA-JeanNeural",
                        "LocalName": "Jean (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-CA-SylvieNeural",
                        "LocalName": "Sylvie (CA - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-CA",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "fr-FR-RemyMultilingualNeural",
                        "LocalName": "Remy (Multilingue) (FR - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-FR",
                        "PitchMod": 0.82,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "fr-FR-DeniseNeural",
                        "LocalName": "Denise (FR - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "fr-FR-EloiseNeural",
                        "LocalName": "Eloise (FR - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "fr-FR-HenriNeural",
                        "LocalName": "Henri (FR - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-FR",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-CH-ArianeNeural",
                        "LocalName": "Ariane (CH - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-CH",
                        "PitchMod": 0.77,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "fr-CH-FabriceNeural",
                        "LocalName": "Fabrice (CH - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CH",
                        "PitchMod": 1.19,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "de-AT-IngridNeural",
                        "LocalName": "Ingrid (AT - Femme)",
                        "Gender": "Female",
                        "Locale": "de-AT",
                        "PitchMod": 0.85,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "de-AT-JonasNeural",
                        "LocalName": "Jonas (AT - Homme)",
                        "Gender": "Male",
                        "Locale": "de-AT",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "de-DE-SeraphinaMultilingualNeural",
                        "LocalName": "Seraphina (Multilingue) (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 1.12,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "de-DE-FlorianMultilingualNeural",
                        "LocalName": "Florian (Multilingue) (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 1.04,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "de-DE-AmalaNeural",
                        "LocalName": "Amala (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 0.94,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "de-DE-ConradNeural",
                        "LocalName": "Conrad (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 1.17,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "de-DE-KatjaNeural",
                        "LocalName": "Katja (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 1.09,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "de-DE-KillianNeural",
                        "LocalName": "Killian (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 0.76,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "de-CH-JanNeural",
                        "LocalName": "Jan (CH - Homme)",
                        "Gender": "Male",
                        "Locale": "de-CH",
                        "PitchMod": 1.01,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "de-CH-LeniNeural",
                        "LocalName": "Leni (CH - Femme)",
                        "Gender": "Female",
                        "Locale": "de-CH",
                        "PitchMod": 1.12,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "hi-IN-MadhurNeural",
                        "LocalName": "Madhur (IN - Homme)",
                        "Gender": "Male",
                        "Locale": "hi-IN",
                        "PitchMod": 0.99,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "hi-IN-SwaraNeural",
                        "LocalName": "Swara (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "hi-IN",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "it-IT-GiuseppeMultilingualNeural",
                        "LocalName": "Giuseppe (Multilingue) (IT - Homme)",
                        "Gender": "Male",
                        "Locale": "it-IT",
                        "PitchMod": 1.13,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "it-IT-DiegoNeural",
                        "LocalName": "Diego (IT - Homme)",
                        "Gender": "Male",
                        "Locale": "it-IT",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "it-IT-ElsaNeural",
                        "LocalName": "Elsa (IT - Femme)",
                        "Gender": "Female",
                        "Locale": "it-IT",
                        "PitchMod": 0.97,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "it-IT-IsabellaNeural",
                        "LocalName": "Isabella (IT - Femme)",
                        "Gender": "Female",
                        "Locale": "it-IT",
                        "PitchMod": 1.05,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "ja-JP-KeitaNeural",
                        "LocalName": "Keita (JP - Homme)",
                        "Gender": "Male",
                        "Locale": "ja-JP",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "ja-JP-NanamiNeural",
                        "LocalName": "Nanami (JP - Femme)",
                        "Gender": "Female",
                        "Locale": "ja-JP",
                        "PitchMod": 0.83,
                        "RateMod": 1.08
            },
            {
                        "ShortName": "ko-KR-HyunsuMultilingualNeural",
                        "LocalName": "Hyunsu (Multilingue) (KR - Homme)",
                        "Gender": "Male",
                        "Locale": "ko-KR",
                        "PitchMod": 0.78,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "ko-KR-InJoonNeural",
                        "LocalName": "InJoon (KR - Homme)",
                        "Gender": "Male",
                        "Locale": "ko-KR",
                        "PitchMod": 0.94,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "ko-KR-SunHiNeural",
                        "LocalName": "SunHi (KR - Femme)",
                        "Gender": "Female",
                        "Locale": "ko-KR",
                        "PitchMod": 0.92,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "pl-PL-MarekNeural",
                        "LocalName": "Marek (PL - Homme)",
                        "Gender": "Male",
                        "Locale": "pl-PL",
                        "PitchMod": 1.02,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "pl-PL-ZofiaNeural",
                        "LocalName": "Zofia (PL - Femme)",
                        "Gender": "Female",
                        "Locale": "pl-PL",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "pt-BR-ThalitaMultilingualNeural",
                        "LocalName": "Thalita (Multilingue) (BR - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-BR",
                        "PitchMod": 0.88,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "pt-BR-AntonioNeural",
                        "LocalName": "Antonio (BR - Homme)",
                        "Gender": "Male",
                        "Locale": "pt-BR",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "pt-BR-FranciscaNeural",
                        "LocalName": "Francisca (BR - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-BR",
                        "PitchMod": 1.12,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "pt-PT-DuarteNeural",
                        "LocalName": "Duarte (PT - Homme)",
                        "Gender": "Male",
                        "Locale": "pt-PT",
                        "PitchMod": 0.85,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "pt-PT-RaquelNeural",
                        "LocalName": "Raquel (PT - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-PT",
                        "PitchMod": 0.9,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "ru-RU-DmitryNeural",
                        "LocalName": "Dmitry (RU - Homme)",
                        "Gender": "Male",
                        "Locale": "ru-RU",
                        "PitchMod": 1.11,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "ru-RU-SvetlanaNeural",
                        "LocalName": "Svetlana (RU - Femme)",
                        "Gender": "Female",
                        "Locale": "ru-RU",
                        "PitchMod": 1.08,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-AR-ElenaNeural",
                        "LocalName": "Elena (AR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-AR",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-AR-TomasNeural",
                        "LocalName": "Tomas (AR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-AR",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-BO-MarceloNeural",
                        "LocalName": "Marcelo (BO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-BO",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-BO-SofiaNeural",
                        "LocalName": "Sofia (BO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-BO",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-CL-CatalinaNeural",
                        "LocalName": "Catalina (CL - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CL",
                        "PitchMod": 0.86,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-CL-LorenzoNeural",
                        "LocalName": "Lorenzo (CL - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CL",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-CO-GonzaloNeural",
                        "LocalName": "Gonzalo (CO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CO",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-CO-SalomeNeural",
                        "LocalName": "Salome (CO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CO",
                        "PitchMod": 1.01,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "es-ES-XimenaNeural",
                        "LocalName": "Ximena (ES - Femme)",
                        "Gender": "Female",
                        "Locale": "es-ES",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-CR-JuanNeural",
                        "LocalName": "Juan (CR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CR",
                        "PitchMod": 0.93,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "es-CR-MariaNeural",
                        "LocalName": "Maria (CR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CR",
                        "PitchMod": 0.85,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "es-CU-BelkysNeural",
                        "LocalName": "Belkys (CU - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CU",
                        "PitchMod": 1.16,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "es-CU-ManuelNeural",
                        "LocalName": "Manuel (CU - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CU",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-DO-EmilioNeural",
                        "LocalName": "Emilio (DO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-DO",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "es-DO-RamonaNeural",
                        "LocalName": "Ramona (DO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-DO",
                        "PitchMod": 0.99,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-EC-AndreaNeural",
                        "LocalName": "Andrea (EC - Femme)",
                        "Gender": "Female",
                        "Locale": "es-EC",
                        "PitchMod": 1.19,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-EC-LuisNeural",
                        "LocalName": "Luis (EC - Homme)",
                        "Gender": "Male",
                        "Locale": "es-EC",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "es-SV-LorenaNeural",
                        "LocalName": "Lorena (SV - Femme)",
                        "Gender": "Female",
                        "Locale": "es-SV",
                        "PitchMod": 1.24,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "es-SV-RodrigoNeural",
                        "LocalName": "Rodrigo (SV - Homme)",
                        "Gender": "Male",
                        "Locale": "es-SV",
                        "PitchMod": 0.91,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "es-GQ-JavierNeural",
                        "LocalName": "Javier (GQ - Homme)",
                        "Gender": "Male",
                        "Locale": "es-GQ",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "es-GQ-TeresaNeural",
                        "LocalName": "Teresa (GQ - Femme)",
                        "Gender": "Female",
                        "Locale": "es-GQ",
                        "PitchMod": 1.1,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "es-GT-AndresNeural",
                        "LocalName": "Andres (GT - Homme)",
                        "Gender": "Male",
                        "Locale": "es-GT",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-GT-MartaNeural",
                        "LocalName": "Marta (GT - Femme)",
                        "Gender": "Female",
                        "Locale": "es-GT",
                        "PitchMod": 1.02,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-HN-CarlosNeural",
                        "LocalName": "Carlos (HN - Homme)",
                        "Gender": "Male",
                        "Locale": "es-HN",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-HN-KarlaNeural",
                        "LocalName": "Karla (HN - Femme)",
                        "Gender": "Female",
                        "Locale": "es-HN",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "es-MX-DaliaNeural",
                        "LocalName": "Dalia (MX - Femme)",
                        "Gender": "Female",
                        "Locale": "es-MX",
                        "PitchMod": 0.86,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-MX-JorgeNeural",
                        "LocalName": "Jorge (MX - Homme)",
                        "Gender": "Male",
                        "Locale": "es-MX",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-NI-FedericoNeural",
                        "LocalName": "Federico (NI - Homme)",
                        "Gender": "Male",
                        "Locale": "es-NI",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-NI-YolandaNeural",
                        "LocalName": "Yolanda (NI - Femme)",
                        "Gender": "Female",
                        "Locale": "es-NI",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-PA-MargaritaNeural",
                        "LocalName": "Margarita (PA - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PA",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "es-PA-RobertoNeural",
                        "LocalName": "Roberto (PA - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PA",
                        "PitchMod": 1.24,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "es-PY-MarioNeural",
                        "LocalName": "Mario (PY - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PY",
                        "PitchMod": 1.19,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-PY-TaniaNeural",
                        "LocalName": "Tania (PY - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PY",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-PE-AlexNeural",
                        "LocalName": "Alex (PE - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PE",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-PE-CamilaNeural",
                        "LocalName": "Camila (PE - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PE",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-PR-KarinaNeural",
                        "LocalName": "Karina (PR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PR",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-PR-VictorNeural",
                        "LocalName": "Victor (PR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PR",
                        "PitchMod": 0.89,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-ES-AlvaroNeural",
                        "LocalName": "Alvaro (ES - Homme)",
                        "Gender": "Male",
                        "Locale": "es-ES",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "es-ES-ElviraNeural",
                        "LocalName": "Elvira (ES - Femme)",
                        "Gender": "Female",
                        "Locale": "es-ES",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-US-AlonsoNeural",
                        "LocalName": "Alonso (US - Homme)",
                        "Gender": "Male",
                        "Locale": "es-US",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-US-PalomaNeural",
                        "LocalName": "Paloma (US - Femme)",
                        "Gender": "Female",
                        "Locale": "es-US",
                        "PitchMod": 1.16,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "es-UY-MateoNeural",
                        "LocalName": "Mateo (UY - Homme)",
                        "Gender": "Male",
                        "Locale": "es-UY",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-UY-ValentinaNeural",
                        "LocalName": "Valentina (UY - Femme)",
                        "Gender": "Female",
                        "Locale": "es-UY",
                        "PitchMod": 1.0,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "es-VE-PaolaNeural",
                        "LocalName": "Paola (VE - Femme)",
                        "Gender": "Female",
                        "Locale": "es-VE",
                        "PitchMod": 0.94,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-VE-SebastianNeural",
                        "LocalName": "Sebastian (VE - Homme)",
                        "Gender": "Male",
                        "Locale": "es-VE",
                        "PitchMod": 1.23,
                        "RateMod": 1.08
            },
            {
                        "ShortName": "tr-TR-EmelNeural",
                        "LocalName": "Emel (TR - Femme)",
                        "Gender": "Female",
                        "Locale": "tr-TR",
                        "PitchMod": 1.13,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "tr-TR-AhmetNeural",
                        "LocalName": "Ahmet (TR - Homme)",
                        "Gender": "Male",
                        "Locale": "tr-TR",
                        "PitchMod": 1.21,
                        "RateMod": 1.06
            }
];
    }

    getVoices(locale = "fr-FR") {
        if (!locale) locale = "fr-FR";
        const baseLang = locale.split('-')[0].toLowerCase();
        const matches = this.voicesDatabase.filter(v => 
            v.Locale.toLowerCase() === locale.toLowerCase() || 
            v.Locale.toLowerCase().startsWith(baseLang)
        );
        return matches.length > 0 ? matches : this.voicesDatabase.filter(v => v.Locale.startsWith("fr"));
    }

    generateRequestId() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    dateToString() {
        const d = new Date();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} GMT+0000 (Coordinated Universal Time)`;
    }

    async generateSecMsGec() {
        const winEpoch = 11644473600;
        const sToNs = 1e7;
        let ticks = Date.now() / 1000 + winEpoch;
        ticks -= ticks % 300;
        ticks *= sToNs;

        const strToHash = `${Math.round(ticks)}${this.trustedToken}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(strToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    splitTextSmart(text, maxChars = 2000) {
        if (text.length <= maxChars) return [text];
        const chunks = [];
        let start = 0;
        const len = text.length;

        while (start < len) {
            if (len - start <= maxChars) {
                chunks.push(text.slice(start).trim());
                break;
            }
            let end = start + maxChars;
            let spacePos = text.lastIndexOf(' ', end);
            if (spacePos > start + 500) end = spacePos;
            chunks.push(text.slice(start, end).trim());
            start = end;
        }
        return chunks;
    }

    async testVoice(text, options = {}) {
        try {
            const blob = await this._synthesizeChunkWebSocket(text, options);
            if (blob && blob.size > 100) {
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                await audio.play();
                return;
            }
        } catch (err) {
            console.log("WebSocket Edge TTS non disponible, utilisation de SpeechSynthesis pour le test vocal.", err);
        }

        this._speakWebSpeechDirect(text, options);
    }

    async synthesize(text, options = {}) {
        try {
            const chunks = this.splitTextSmart(text, 2000);
            const audioBlobs = [];
            for (const chunk of chunks) {
                if (!chunk) continue;
                const blob = await this._synthesizeChunkWebSocket(chunk, options);
                audioBlobs.push(blob);
            }
            return new Blob(audioBlobs, { type: "audio/mp3" });
        } catch (err) {
            console.warn("Connexion WebSocket Edge TTS restreinte, génération de secours.", err);
            return await this._synthesizeNativeWebSpeech(text, options);
        }
    }

    async _synthesizeChunkWebSocket(text, options = {}) {
        const voice = options.voice || "fr-FR-VivienneMultilingualNeural";
        const rate = options.rate !== undefined ? `${options.rate >= 0 ? '+' : ''}${options.rate}%` : "+0%";
        const pitch = options.pitch !== undefined ? `${options.pitch >= 0 ? '+' : ''}${options.pitch}Hz` : "+0Hz";
        
        const parts = voice.split('-');
        const voiceLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

        const reqId = this.generateRequestId();
        const timestamp = this.dateToString();
        const secMsGec = await this.generateSecMsGec();
        
        const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}&ConnectionId=${reqId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${this.secMsGecVersion}`;

        return new Promise((resolve, reject) => {
            const socket = new WebSocket(wsUrl);
            const audioBuffers = [];
            socket.binaryType = 'arraybuffer';

            const timeoutTimer = setTimeout(() => {
                socket.close();
                reject(new Error("Timeout WebSocket"));
            }, 3500);

            socket.onopen = () => {
                const configMsg = `Path: speech.config\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n{"context":{"synthesis":{"audio":{"metadataversion":"2.0","format":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
                socket.send(configMsg);

                const ssmlMsg = `Path: ssml\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='${voiceLang}'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}'>${this._escapeXml(text)}</prosody></voice></speak>`;
                socket.send(ssmlMsg);
            };

            socket.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    if (event.data.includes('Turn.end')) {
                        clearTimeout(timeoutTimer);
                        socket.close();
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    const view = new DataView(event.data);
                    const headerLength = view.getUint16(0);
                    if (event.data.byteLength > headerLength + 2) {
                        const audioData = event.data.slice(headerLength + 2);
                        audioBuffers.push(audioData);
                    }
                }
            };

            socket.onclose = () => {
                clearTimeout(timeoutTimer);
                if (audioBuffers.length > 0) {
                    resolve(new Blob(audioBuffers, { type: 'audio/mp3' }));
                } else {
                    reject(new Error("Aucune donnée audio WebSocket"));
                }
            };

            socket.onerror = (err) => {
                clearTimeout(timeoutTimer);
                reject(err);
            };
        });
    }

    _speakWebSpeechDirect(text, options = {}) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceShortName = options.voice || "fr-FR-VivienneMultilingualNeural";
        const voiceMeta = this.voicesDatabase.find(v => v.ShortName === selectedVoiceShortName);
        
        const targetGender = voiceMeta ? voiceMeta.Gender : "Female";
        const parts = selectedVoiceShortName.split('-');
        const targetLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

        utterance.lang = targetLang;

        let userRate = options.rate !== undefined ? (1.0 + (options.rate / 100)) : 1.0;
        let userPitch = options.pitch !== undefined ? (1.0 + (options.pitch / 100)) : 1.0;
        
        const pitchMod = voiceMeta ? voiceMeta.PitchMod : 1.0;
        const rateMod = voiceMeta ? voiceMeta.RateMod : 1.0;

        utterance.pitch = Math.max(0.5, Math.min(2.0, userPitch * pitchMod));
        utterance.rate = Math.max(0.5, Math.min(2.0, userRate * rateMod));

        const systemVoices = window.speechSynthesis.getVoices();
        if (systemVoices.length > 0) {
            const langVoices = systemVoices.filter(v => v.lang.replace('_','-').toLowerCase().startsWith(targetLang.slice(0,2).toLowerCase()));
            
            const firstName = selectedVoiceShortName.split('-').pop().replace('Neural','').replace('Multilingual','');
            let matched = langVoices.find(v => v.name.toLowerCase().includes(firstName.toLowerCase()));

            if (!matched && langVoices.length > 0) {
                if (targetGender === "Male") {
                    matched = langVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("homme"));
                } else {
                    matched = langVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("femme"));
                }
            }

            if (!matched && langVoices.length > 0) matched = langVoices[0];
            if (matched) utterance.voice = matched;
        }

        window.speechSynthesis.speak(utterance);
    }

    _synthesizeNativeWebSpeech(text, options = {}) {
        return new Promise((resolve) => {
            this._speakWebSpeechDirect(text, options);
            const dummyData = new Uint8Array([73, 68, 51, 3, 0, 0, 0, 0, 0, 0]);
            resolve(new Blob([dummyData], { type: 'audio/mp3' }));
        });
    }

    _escapeXml(str) {
        return str.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
}
