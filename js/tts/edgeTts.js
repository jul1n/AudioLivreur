/**
 * Studio Synthèse Vocale 100% Serveur Microsoft Bing Edge Neural - v0.6.1
 * - Feedback utilisateur dynamique & Gestion des erreurs réseau
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
                        "Locale": "fr-FR"
            },
            {
                        "ShortName": "ar-DZ-AminaNeural",
                        "LocalName": "Amina (DZ - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-DZ"
            },
            {
                        "ShortName": "ar-DZ-IsmaelNeural",
                        "LocalName": "Ismael (DZ - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-DZ"
            },
            {
                        "ShortName": "ar-BH-AliNeural",
                        "LocalName": "Ali (BH - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-BH"
            },
            {
                        "ShortName": "ar-BH-LailaNeural",
                        "LocalName": "Laila (BH - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-BH"
            },
            {
                        "ShortName": "ar-EG-SalmaNeural",
                        "LocalName": "Salma (EG - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-EG"
            },
            {
                        "ShortName": "ar-EG-ShakirNeural",
                        "LocalName": "Shakir (EG - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-EG"
            },
            {
                        "ShortName": "ar-IQ-BasselNeural",
                        "LocalName": "Bassel (IQ - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-IQ"
            },
            {
                        "ShortName": "ar-IQ-RanaNeural",
                        "LocalName": "Rana (IQ - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-IQ"
            },
            {
                        "ShortName": "ar-JO-SanaNeural",
                        "LocalName": "Sana (JO - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-JO"
            },
            {
                        "ShortName": "ar-JO-TaimNeural",
                        "LocalName": "Taim (JO - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-JO"
            },
            {
                        "ShortName": "ar-KW-FahedNeural",
                        "LocalName": "Fahed (KW - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-KW"
            },
            {
                        "ShortName": "ar-KW-NouraNeural",
                        "LocalName": "Noura (KW - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-KW"
            },
            {
                        "ShortName": "ar-LB-LaylaNeural",
                        "LocalName": "Layla (LB - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-LB"
            },
            {
                        "ShortName": "ar-LB-RamiNeural",
                        "LocalName": "Rami (LB - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-LB"
            },
            {
                        "ShortName": "ar-LY-ImanNeural",
                        "LocalName": "Iman (LY - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-LY"
            },
            {
                        "ShortName": "ar-LY-OmarNeural",
                        "LocalName": "Omar (LY - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-LY"
            },
            {
                        "ShortName": "ar-MA-JamalNeural",
                        "LocalName": "Jamal (MA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-MA"
            },
            {
                        "ShortName": "ar-MA-MounaNeural",
                        "LocalName": "Mouna (MA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-MA"
            },
            {
                        "ShortName": "ar-OM-AbdullahNeural",
                        "LocalName": "Abdullah (OM - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-OM"
            },
            {
                        "ShortName": "ar-OM-AyshaNeural",
                        "LocalName": "Aysha (OM - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-OM"
            },
            {
                        "ShortName": "ar-QA-AmalNeural",
                        "LocalName": "Amal (QA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-QA"
            },
            {
                        "ShortName": "ar-QA-MoazNeural",
                        "LocalName": "Moaz (QA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-QA"
            },
            {
                        "ShortName": "ar-SA-HamedNeural",
                        "LocalName": "Hamed (SA - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-SA"
            },
            {
                        "ShortName": "ar-SA-ZariyahNeural",
                        "LocalName": "Zariyah (SA - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-SA"
            },
            {
                        "ShortName": "ar-SY-AmanyNeural",
                        "LocalName": "Amany (SY - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-SY"
            },
            {
                        "ShortName": "ar-SY-LaithNeural",
                        "LocalName": "Laith (SY - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-SY"
            },
            {
                        "ShortName": "ar-TN-HediNeural",
                        "LocalName": "Hedi (TN - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-TN"
            },
            {
                        "ShortName": "ar-TN-ReemNeural",
                        "LocalName": "Reem (TN - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-TN"
            },
            {
                        "ShortName": "ar-AE-FatimaNeural",
                        "LocalName": "Fatima (AE - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-AE"
            },
            {
                        "ShortName": "ar-AE-HamdanNeural",
                        "LocalName": "Hamdan (AE - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-AE"
            },
            {
                        "ShortName": "ar-YE-MaryamNeural",
                        "LocalName": "Maryam (YE - Femme)",
                        "Gender": "Female",
                        "Locale": "ar-YE"
            },
            {
                        "ShortName": "ar-YE-SalehNeural",
                        "LocalName": "Saleh (YE - Homme)",
                        "Gender": "Male",
                        "Locale": "ar-YE"
            },
            {
                        "ShortName": "zh-HK-HiuGaaiNeural",
                        "LocalName": "HiuGaai (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-HK"
            },
            {
                        "ShortName": "zh-HK-HiuMaanNeural",
                        "LocalName": "HiuMaan (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-HK"
            },
            {
                        "ShortName": "zh-HK-WanLungNeural",
                        "LocalName": "WanLung (HK - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-HK"
            },
            {
                        "ShortName": "zh-CN-XiaoxiaoNeural",
                        "LocalName": "Xiaoxiao (CN - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-XiaoyiNeural",
                        "LocalName": "Xiaoyi (CN - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-YunjianNeural",
                        "LocalName": "Yunjian (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-YunxiNeural",
                        "LocalName": "Yunxi (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-YunxiaNeural",
                        "LocalName": "Yunxia (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-YunyangNeural",
                        "LocalName": "Yunyang (CN - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-CN"
            },
            {
                        "ShortName": "zh-CN-liaoning-XiaobeiNeural",
                        "LocalName": "Xiaobei (liaoning - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN-liaoning"
            },
            {
                        "ShortName": "zh-TW-HsiaoChenNeural",
                        "LocalName": "HsiaoChen (TW - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-TW"
            },
            {
                        "ShortName": "zh-TW-YunJheNeural",
                        "LocalName": "YunJhe (TW - Homme)",
                        "Gender": "Male",
                        "Locale": "zh-TW"
            },
            {
                        "ShortName": "zh-TW-HsiaoYuNeural",
                        "LocalName": "HsiaoYu (TW - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-TW"
            },
            {
                        "ShortName": "zh-CN-shaanxi-XiaoniNeural",
                        "LocalName": "Xiaoni (shaanxi - Femme)",
                        "Gender": "Female",
                        "Locale": "zh-CN-shaanxi"
            },
            {
                        "ShortName": "nl-BE-ArnaudNeural",
                        "LocalName": "Arnaud (BE - Homme)",
                        "Gender": "Male",
                        "Locale": "nl-BE"
            },
            {
                        "ShortName": "nl-BE-DenaNeural",
                        "LocalName": "Dena (BE - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-BE"
            },
            {
                        "ShortName": "nl-NL-ColetteNeural",
                        "LocalName": "Colette (NL - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-NL"
            },
            {
                        "ShortName": "nl-NL-FennaNeural",
                        "LocalName": "Fenna (NL - Femme)",
                        "Gender": "Female",
                        "Locale": "nl-NL"
            },
            {
                        "ShortName": "nl-NL-MaartenNeural",
                        "LocalName": "Maarten (NL - Homme)",
                        "Gender": "Male",
                        "Locale": "nl-NL"
            },
            {
                        "ShortName": "en-AU-WilliamMultilingualNeural",
                        "LocalName": "William (Multilingue) (AU - Homme)",
                        "Gender": "Male",
                        "Locale": "en-AU"
            },
            {
                        "ShortName": "en-AU-NatashaNeural",
                        "LocalName": "Natasha (AU - Femme)",
                        "Gender": "Female",
                        "Locale": "en-AU"
            },
            {
                        "ShortName": "en-CA-ClaraNeural",
                        "LocalName": "Clara (CA - Femme)",
                        "Gender": "Female",
                        "Locale": "en-CA"
            },
            {
                        "ShortName": "en-CA-LiamNeural",
                        "LocalName": "Liam (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "en-CA"
            },
            {
                        "ShortName": "en-HK-YanNeural",
                        "LocalName": "Yan (HK - Femme)",
                        "Gender": "Female",
                        "Locale": "en-HK"
            },
            {
                        "ShortName": "en-HK-SamNeural",
                        "LocalName": "Sam (HK - Homme)",
                        "Gender": "Male",
                        "Locale": "en-HK"
            },
            {
                        "ShortName": "en-IN-NeerjaExpressiveNeural",
                        "LocalName": "Neerja (Expressif) (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IN"
            },
            {
                        "ShortName": "en-IN-NeerjaNeural",
                        "LocalName": "Neerja (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IN"
            },
            {
                        "ShortName": "en-IN-PrabhatNeural",
                        "LocalName": "Prabhat (IN - Homme)",
                        "Gender": "Male",
                        "Locale": "en-IN"
            },
            {
                        "ShortName": "en-IE-ConnorNeural",
                        "LocalName": "Connor (IE - Homme)",
                        "Gender": "Male",
                        "Locale": "en-IE"
            },
            {
                        "ShortName": "en-IE-EmilyNeural",
                        "LocalName": "Emily (IE - Femme)",
                        "Gender": "Female",
                        "Locale": "en-IE"
            },
            {
                        "ShortName": "en-KE-AsiliaNeural",
                        "LocalName": "Asilia (KE - Femme)",
                        "Gender": "Female",
                        "Locale": "en-KE"
            },
            {
                        "ShortName": "en-KE-ChilembaNeural",
                        "LocalName": "Chilemba (KE - Homme)",
                        "Gender": "Male",
                        "Locale": "en-KE"
            },
            {
                        "ShortName": "en-NZ-MitchellNeural",
                        "LocalName": "Mitchell (NZ - Homme)",
                        "Gender": "Male",
                        "Locale": "en-NZ"
            },
            {
                        "ShortName": "en-NZ-MollyNeural",
                        "LocalName": "Molly (NZ - Femme)",
                        "Gender": "Female",
                        "Locale": "en-NZ"
            },
            {
                        "ShortName": "en-NG-AbeoNeural",
                        "LocalName": "Abeo (NG - Homme)",
                        "Gender": "Male",
                        "Locale": "en-NG"
            },
            {
                        "ShortName": "en-NG-EzinneNeural",
                        "LocalName": "Ezinne (NG - Femme)",
                        "Gender": "Female",
                        "Locale": "en-NG"
            },
            {
                        "ShortName": "en-PH-JamesNeural",
                        "LocalName": "James (PH - Homme)",
                        "Gender": "Male",
                        "Locale": "en-PH"
            },
            {
                        "ShortName": "en-PH-RosaNeural",
                        "LocalName": "Rosa (PH - Femme)",
                        "Gender": "Female",
                        "Locale": "en-PH"
            },
            {
                        "ShortName": "en-US-AvaNeural",
                        "LocalName": "Ava (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-AndrewNeural",
                        "LocalName": "Andrew (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-EmmaNeural",
                        "LocalName": "Emma (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-BrianNeural",
                        "LocalName": "Brian (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-SG-LunaNeural",
                        "LocalName": "Luna (SG - Femme)",
                        "Gender": "Female",
                        "Locale": "en-SG"
            },
            {
                        "ShortName": "en-SG-WayneNeural",
                        "LocalName": "Wayne (SG - Homme)",
                        "Gender": "Male",
                        "Locale": "en-SG"
            },
            {
                        "ShortName": "en-ZA-LeahNeural",
                        "LocalName": "Leah (ZA - Femme)",
                        "Gender": "Female",
                        "Locale": "en-ZA"
            },
            {
                        "ShortName": "en-ZA-LukeNeural",
                        "LocalName": "Luke (ZA - Homme)",
                        "Gender": "Male",
                        "Locale": "en-ZA"
            },
            {
                        "ShortName": "en-TZ-ElimuNeural",
                        "LocalName": "Elimu (TZ - Homme)",
                        "Gender": "Male",
                        "Locale": "en-TZ"
            },
            {
                        "ShortName": "en-TZ-ImaniNeural",
                        "LocalName": "Imani (TZ - Femme)",
                        "Gender": "Female",
                        "Locale": "en-TZ"
            },
            {
                        "ShortName": "en-GB-LibbyNeural",
                        "LocalName": "Libby (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB"
            },
            {
                        "ShortName": "en-GB-MaisieNeural",
                        "LocalName": "Maisie (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB"
            },
            {
                        "ShortName": "en-GB-RyanNeural",
                        "LocalName": "Ryan (GB - Homme)",
                        "Gender": "Male",
                        "Locale": "en-GB"
            },
            {
                        "ShortName": "en-GB-SoniaNeural",
                        "LocalName": "Sonia (GB - Femme)",
                        "Gender": "Female",
                        "Locale": "en-GB"
            },
            {
                        "ShortName": "en-GB-ThomasNeural",
                        "LocalName": "Thomas (GB - Homme)",
                        "Gender": "Male",
                        "Locale": "en-GB"
            },
            {
                        "ShortName": "en-US-AnaNeural",
                        "LocalName": "Ana (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-AndrewMultilingualNeural",
                        "LocalName": "Andrew (Multilingue) (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-AriaNeural",
                        "LocalName": "Aria (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-AvaMultilingualNeural",
                        "LocalName": "Ava (Multilingue) (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-BrianMultilingualNeural",
                        "LocalName": "Brian (Multilingue) (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-ChristopherNeural",
                        "LocalName": "Christopher (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-EmmaMultilingualNeural",
                        "LocalName": "Emma (Multilingue) (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-EricNeural",
                        "LocalName": "Eric (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-GuyNeural",
                        "LocalName": "Guy (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-JennyNeural",
                        "LocalName": "Jenny (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-MichelleNeural",
                        "LocalName": "Michelle (US - Femme)",
                        "Gender": "Female",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-RogerNeural",
                        "LocalName": "Roger (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "en-US-SteffanNeural",
                        "LocalName": "Steffan (US - Homme)",
                        "Gender": "Male",
                        "Locale": "en-US"
            },
            {
                        "ShortName": "fr-BE-CharlineNeural",
                        "LocalName": "Charline (BE - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-BE"
            },
            {
                        "ShortName": "fr-BE-GerardNeural",
                        "LocalName": "Gerard (BE - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-BE"
            },
            {
                        "ShortName": "fr-CA-ThierryNeural",
                        "LocalName": "Thierry (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA"
            },
            {
                        "ShortName": "fr-CA-AntoineNeural",
                        "LocalName": "Antoine (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA"
            },
            {
                        "ShortName": "fr-CA-JeanNeural",
                        "LocalName": "Jean (CA - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CA"
            },
            {
                        "ShortName": "fr-CA-SylvieNeural",
                        "LocalName": "Sylvie (CA - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-CA"
            },
            {
                        "ShortName": "fr-FR-RemyMultilingualNeural",
                        "LocalName": "Remy (Multilingue) (FR - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-FR"
            },
            {
                        "ShortName": "fr-FR-DeniseNeural",
                        "LocalName": "Denise (FR - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-FR"
            },
            {
                        "ShortName": "fr-FR-EloiseNeural",
                        "LocalName": "Eloise (FR - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-FR"
            },
            {
                        "ShortName": "fr-FR-HenriNeural",
                        "LocalName": "Henri (FR - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-FR"
            },
            {
                        "ShortName": "fr-CH-ArianeNeural",
                        "LocalName": "Ariane (CH - Femme)",
                        "Gender": "Female",
                        "Locale": "fr-CH"
            },
            {
                        "ShortName": "fr-CH-FabriceNeural",
                        "LocalName": "Fabrice (CH - Homme)",
                        "Gender": "Male",
                        "Locale": "fr-CH"
            },
            {
                        "ShortName": "de-AT-IngridNeural",
                        "LocalName": "Ingrid (AT - Femme)",
                        "Gender": "Female",
                        "Locale": "de-AT"
            },
            {
                        "ShortName": "de-AT-JonasNeural",
                        "LocalName": "Jonas (AT - Homme)",
                        "Gender": "Male",
                        "Locale": "de-AT"
            },
            {
                        "ShortName": "de-DE-SeraphinaMultilingualNeural",
                        "LocalName": "Seraphina (Multilingue) (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-DE-FlorianMultilingualNeural",
                        "LocalName": "Florian (Multilingue) (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-DE-AmalaNeural",
                        "LocalName": "Amala (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-DE-ConradNeural",
                        "LocalName": "Conrad (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-DE-KatjaNeural",
                        "LocalName": "Katja (DE - Femme)",
                        "Gender": "Female",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-DE-KillianNeural",
                        "LocalName": "Killian (DE - Homme)",
                        "Gender": "Male",
                        "Locale": "de-DE"
            },
            {
                        "ShortName": "de-CH-JanNeural",
                        "LocalName": "Jan (CH - Homme)",
                        "Gender": "Male",
                        "Locale": "de-CH"
            },
            {
                        "ShortName": "de-CH-LeniNeural",
                        "LocalName": "Leni (CH - Femme)",
                        "Gender": "Female",
                        "Locale": "de-CH"
            },
            {
                        "ShortName": "hi-IN-MadhurNeural",
                        "LocalName": "Madhur (IN - Homme)",
                        "Gender": "Male",
                        "Locale": "hi-IN"
            },
            {
                        "ShortName": "hi-IN-SwaraNeural",
                        "LocalName": "Swara (IN - Femme)",
                        "Gender": "Female",
                        "Locale": "hi-IN"
            },
            {
                        "ShortName": "it-IT-GiuseppeMultilingualNeural",
                        "LocalName": "Giuseppe (Multilingue) (IT - Homme)",
                        "Gender": "Male",
                        "Locale": "it-IT"
            },
            {
                        "ShortName": "it-IT-DiegoNeural",
                        "LocalName": "Diego (IT - Homme)",
                        "Gender": "Male",
                        "Locale": "it-IT"
            },
            {
                        "ShortName": "it-IT-ElsaNeural",
                        "LocalName": "Elsa (IT - Femme)",
                        "Gender": "Female",
                        "Locale": "it-IT"
            },
            {
                        "ShortName": "it-IT-IsabellaNeural",
                        "LocalName": "Isabella (IT - Femme)",
                        "Gender": "Female",
                        "Locale": "it-IT"
            },
            {
                        "ShortName": "ja-JP-KeitaNeural",
                        "LocalName": "Keita (JP - Homme)",
                        "Gender": "Male",
                        "Locale": "ja-JP"
            },
            {
                        "ShortName": "ja-JP-NanamiNeural",
                        "LocalName": "Nanami (JP - Femme)",
                        "Gender": "Female",
                        "Locale": "ja-JP"
            },
            {
                        "ShortName": "ko-KR-HyunsuMultilingualNeural",
                        "LocalName": "Hyunsu (Multilingue) (KR - Homme)",
                        "Gender": "Male",
                        "Locale": "ko-KR"
            },
            {
                        "ShortName": "ko-KR-InJoonNeural",
                        "LocalName": "InJoon (KR - Homme)",
                        "Gender": "Male",
                        "Locale": "ko-KR"
            },
            {
                        "ShortName": "ko-KR-SunHiNeural",
                        "LocalName": "SunHi (KR - Femme)",
                        "Gender": "Female",
                        "Locale": "ko-KR"
            },
            {
                        "ShortName": "pl-PL-MarekNeural",
                        "LocalName": "Marek (PL - Homme)",
                        "Gender": "Male",
                        "Locale": "pl-PL"
            },
            {
                        "ShortName": "pl-PL-ZofiaNeural",
                        "LocalName": "Zofia (PL - Femme)",
                        "Gender": "Female",
                        "Locale": "pl-PL"
            },
            {
                        "ShortName": "pt-BR-ThalitaMultilingualNeural",
                        "LocalName": "Thalita (Multilingue) (BR - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-BR"
            },
            {
                        "ShortName": "pt-BR-AntonioNeural",
                        "LocalName": "Antonio (BR - Homme)",
                        "Gender": "Male",
                        "Locale": "pt-BR"
            },
            {
                        "ShortName": "pt-BR-FranciscaNeural",
                        "LocalName": "Francisca (BR - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-BR"
            },
            {
                        "ShortName": "pt-PT-DuarteNeural",
                        "LocalName": "Duarte (PT - Homme)",
                        "Gender": "Male",
                        "Locale": "pt-PT"
            },
            {
                        "ShortName": "pt-PT-RaquelNeural",
                        "LocalName": "Raquel (PT - Femme)",
                        "Gender": "Female",
                        "Locale": "pt-PT"
            },
            {
                        "ShortName": "ru-RU-DmitryNeural",
                        "LocalName": "Dmitry (RU - Homme)",
                        "Gender": "Male",
                        "Locale": "ru-RU"
            },
            {
                        "ShortName": "ru-RU-SvetlanaNeural",
                        "LocalName": "Svetlana (RU - Femme)",
                        "Gender": "Female",
                        "Locale": "ru-RU"
            },
            {
                        "ShortName": "es-AR-ElenaNeural",
                        "LocalName": "Elena (AR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-AR"
            },
            {
                        "ShortName": "es-AR-TomasNeural",
                        "LocalName": "Tomas (AR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-AR"
            },
            {
                        "ShortName": "es-BO-MarceloNeural",
                        "LocalName": "Marcelo (BO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-BO"
            },
            {
                        "ShortName": "es-BO-SofiaNeural",
                        "LocalName": "Sofia (BO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-BO"
            },
            {
                        "ShortName": "es-CL-CatalinaNeural",
                        "LocalName": "Catalina (CL - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CL"
            },
            {
                        "ShortName": "es-CL-LorenzoNeural",
                        "LocalName": "Lorenzo (CL - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CL"
            },
            {
                        "ShortName": "es-CO-GonzaloNeural",
                        "LocalName": "Gonzalo (CO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CO"
            },
            {
                        "ShortName": "es-CO-SalomeNeural",
                        "LocalName": "Salome (CO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CO"
            },
            {
                        "ShortName": "es-ES-XimenaNeural",
                        "LocalName": "Ximena (ES - Femme)",
                        "Gender": "Female",
                        "Locale": "es-ES"
            },
            {
                        "ShortName": "es-CR-JuanNeural",
                        "LocalName": "Juan (CR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CR"
            },
            {
                        "ShortName": "es-CR-MariaNeural",
                        "LocalName": "Maria (CR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CR"
            },
            {
                        "ShortName": "es-CU-BelkysNeural",
                        "LocalName": "Belkys (CU - Femme)",
                        "Gender": "Female",
                        "Locale": "es-CU"
            },
            {
                        "ShortName": "es-CU-ManuelNeural",
                        "LocalName": "Manuel (CU - Homme)",
                        "Gender": "Male",
                        "Locale": "es-CU"
            },
            {
                        "ShortName": "es-DO-EmilioNeural",
                        "LocalName": "Emilio (DO - Homme)",
                        "Gender": "Male",
                        "Locale": "es-DO"
            },
            {
                        "ShortName": "es-DO-RamonaNeural",
                        "LocalName": "Ramona (DO - Femme)",
                        "Gender": "Female",
                        "Locale": "es-DO"
            },
            {
                        "ShortName": "es-EC-AndreaNeural",
                        "LocalName": "Andrea (EC - Femme)",
                        "Gender": "Female",
                        "Locale": "es-EC"
            },
            {
                        "ShortName": "es-EC-LuisNeural",
                        "LocalName": "Luis (EC - Homme)",
                        "Gender": "Male",
                        "Locale": "es-EC"
            },
            {
                        "ShortName": "es-SV-LorenaNeural",
                        "LocalName": "Lorena (SV - Femme)",
                        "Gender": "Female",
                        "Locale": "es-SV"
            },
            {
                        "ShortName": "es-SV-RodrigoNeural",
                        "LocalName": "Rodrigo (SV - Homme)",
                        "Gender": "Male",
                        "Locale": "es-SV"
            },
            {
                        "ShortName": "es-GQ-JavierNeural",
                        "LocalName": "Javier (GQ - Homme)",
                        "Gender": "Male",
                        "Locale": "es-GQ"
            },
            {
                        "ShortName": "es-GQ-TeresaNeural",
                        "LocalName": "Teresa (GQ - Femme)",
                        "Gender": "Female",
                        "Locale": "es-GQ"
            },
            {
                        "ShortName": "es-GT-AndresNeural",
                        "LocalName": "Andres (GT - Homme)",
                        "Gender": "Male",
                        "Locale": "es-GT"
            },
            {
                        "ShortName": "es-GT-MartaNeural",
                        "LocalName": "Marta (GT - Femme)",
                        "Gender": "Female",
                        "Locale": "es-GT"
            },
            {
                        "ShortName": "es-HN-CarlosNeural",
                        "LocalName": "Carlos (HN - Homme)",
                        "Gender": "Male",
                        "Locale": "es-HN"
            },
            {
                        "ShortName": "es-HN-KarlaNeural",
                        "LocalName": "Karla (HN - Femme)",
                        "Gender": "Female",
                        "Locale": "es-HN"
            },
            {
                        "ShortName": "es-MX-DaliaNeural",
                        "LocalName": "Dalia (MX - Femme)",
                        "Gender": "Female",
                        "Locale": "es-MX"
            },
            {
                        "ShortName": "es-MX-JorgeNeural",
                        "LocalName": "Jorge (MX - Homme)",
                        "Gender": "Male",
                        "Locale": "es-MX"
            },
            {
                        "ShortName": "es-NI-FedericoNeural",
                        "LocalName": "Federico (NI - Homme)",
                        "Gender": "Male",
                        "Locale": "es-NI"
            },
            {
                        "ShortName": "es-NI-YolandaNeural",
                        "LocalName": "Yolanda (NI - Femme)",
                        "Gender": "Female",
                        "Locale": "es-NI"
            },
            {
                        "ShortName": "es-PA-MargaritaNeural",
                        "LocalName": "Margarita (PA - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PA"
            },
            {
                        "ShortName": "es-PA-RobertoNeural",
                        "LocalName": "Roberto (PA - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PA"
            },
            {
                        "ShortName": "es-PY-MarioNeural",
                        "LocalName": "Mario (PY - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PY"
            },
            {
                        "ShortName": "es-PY-TaniaNeural",
                        "LocalName": "Tania (PY - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PY"
            },
            {
                        "ShortName": "es-PE-AlexNeural",
                        "LocalName": "Alex (PE - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PE"
            },
            {
                        "ShortName": "es-PE-CamilaNeural",
                        "LocalName": "Camila (PE - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PE"
            },
            {
                        "ShortName": "es-PR-KarinaNeural",
                        "LocalName": "Karina (PR - Femme)",
                        "Gender": "Female",
                        "Locale": "es-PR"
            },
            {
                        "ShortName": "es-PR-VictorNeural",
                        "LocalName": "Victor (PR - Homme)",
                        "Gender": "Male",
                        "Locale": "es-PR"
            },
            {
                        "ShortName": "es-ES-AlvaroNeural",
                        "LocalName": "Alvaro (ES - Homme)",
                        "Gender": "Male",
                        "Locale": "es-ES"
            },
            {
                        "ShortName": "es-ES-ElviraNeural",
                        "LocalName": "Elvira (ES - Femme)",
                        "Gender": "Female",
                        "Locale": "es-ES"
            },
            {
                        "ShortName": "es-US-AlonsoNeural",
                        "LocalName": "Alonso (US - Homme)",
                        "Gender": "Male",
                        "Locale": "es-US"
            },
            {
                        "ShortName": "es-US-PalomaNeural",
                        "LocalName": "Paloma (US - Femme)",
                        "Gender": "Female",
                        "Locale": "es-US"
            },
            {
                        "ShortName": "es-UY-MateoNeural",
                        "LocalName": "Mateo (UY - Homme)",
                        "Gender": "Male",
                        "Locale": "es-UY"
            },
            {
                        "ShortName": "es-UY-ValentinaNeural",
                        "LocalName": "Valentina (UY - Femme)",
                        "Gender": "Female",
                        "Locale": "es-UY"
            },
            {
                        "ShortName": "es-VE-PaolaNeural",
                        "LocalName": "Paola (VE - Femme)",
                        "Gender": "Female",
                        "Locale": "es-VE"
            },
            {
                        "ShortName": "es-VE-SebastianNeural",
                        "LocalName": "Sebastian (VE - Homme)",
                        "Gender": "Male",
                        "Locale": "es-VE"
            },
            {
                        "ShortName": "tr-TR-EmelNeural",
                        "LocalName": "Emel (TR - Femme)",
                        "Gender": "Female",
                        "Locale": "tr-TR"
            },
            {
                        "ShortName": "tr-TR-AhmetNeural",
                        "LocalName": "Ahmet (TR - Homme)",
                        "Gender": "Male",
                        "Locale": "tr-TR"
            }
];
    }

    getVoices(locale = "fr") {
        if (!locale) locale = "fr";
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

    async testVoice(text, options = {}, statusCallback = null) {
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            if (statusCallback) statusCallback(`Connexion Microsoft (${attempt}/2)...`);
            try {
                const blob = await this._synthesizeChunkWebSocket(text, options, 3000);
                if (blob && blob.size > 100) {
                    if (statusCallback) statusCallback(`Lecture audio...`);
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    await audio.play();
                    return;
                }
            } catch (err) {
                lastError = err;
                await new Promise(r => setTimeout(r, 300));
            }
        }
        throw new Error("Impossible de joindre le serveur Microsoft Bing TTS (" + (lastError ? lastError.message : "Erreur WebSocket") + ")");
    }

    async synthesize(text, options = {}, progressCallback = null) {
        const chunks = this.splitTextSmart(text, 2000);
        const audioBlobs = [];
        let i = 0;
        for (const chunk of chunks) {
            if (!chunk) continue;
            i++;
            if (progressCallback) progressCallback(i, chunks.length);
            
            let blob = null;
            let lastErr = null;
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    blob = await this._synthesizeChunkWebSocket(chunk, options, 4000);
                    if (blob && blob.size > 100) break;
                } catch (err) {
                    lastErr = err;
                    await new Promise(r => setTimeout(r, 400));
                }
            }
            
            if (blob && blob.size > 100) {
                audioBlobs.push(blob);
            } else {
                throw new Error("Échec du téléchargement auprès du serveur Microsoft : " + (lastErr ? lastErr.message : "Erreur réseau"));
            }
        }
        return new Blob(audioBlobs, { type: "audio/mp3" });
    }

    async _synthesizeChunkWebSocket(text, options = {}, timeoutMs = 3500) {
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
            let socket = null;
            try {
                socket = new WebSocket(wsUrl);
            } catch(e) {
                return reject(e);
            }
            
            const audioBuffers = [];
            socket.binaryType = 'arraybuffer';

            const timeoutTimer = setTimeout(() => {
                try { socket.close(); } catch(e) {}
                reject(new Error("Délai d'attente serveur dépassé (Timeout)"));
            }, timeoutMs);

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
                        try { socket.close(); } catch(e) {}
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
                    reject(new Error("Connexion fermée sans données audio"));
                }
            };

            socket.onerror = (err) => {
                clearTimeout(timeoutTimer);
                reject(err);
            };
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
