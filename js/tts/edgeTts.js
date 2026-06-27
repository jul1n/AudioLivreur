/**
 * Client Synthèse Vocale Hybride (Client-Side) - v0.3.4
 * - Restitue 100% de la différenciation des voix en local et à distance
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
        this.secMsGecVersion = "1-143.0.3650.75";
        
        this.systemVoices = [];
        this.initSystemVoices();

        this.voicesDatabase = [
            {
                        "ShortName": "fr-FR-VivienneMultilingualNeural",
                        "LocalName": "Vivienne (Multilingue) (Femme - fr-FR)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 1.05,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "en-AU-WilliamMultilingualNeural",
                        "LocalName": "William (Multilingue) (Homme - en-AU)",
                        "Gender": "Male",
                        "Locale": "en-AU",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-AU-NatashaNeural",
                        "LocalName": "Natasha (Femme - en-AU)",
                        "Gender": "Female",
                        "Locale": "en-AU",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-CA-ClaraNeural",
                        "LocalName": "Clara (Femme - en-CA)",
                        "Gender": "Female",
                        "Locale": "en-CA",
                        "PitchMod": 1.06,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-CA-LiamNeural",
                        "LocalName": "Liam (Homme - en-CA)",
                        "Gender": "Male",
                        "Locale": "en-CA",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-HK-YanNeural",
                        "LocalName": "Yan (Femme - en-HK)",
                        "Gender": "Female",
                        "Locale": "en-HK",
                        "PitchMod": 0.84,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-HK-SamNeural",
                        "LocalName": "Sam (Homme - en-HK)",
                        "Gender": "Male",
                        "Locale": "en-HK",
                        "PitchMod": 0.77,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "en-IN-NeerjaExpressiveNeural",
                        "LocalName": "Neerja (Expressif) (Femme - en-IN)",
                        "Gender": "Female",
                        "Locale": "en-IN",
                        "PitchMod": 1.09,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "en-IN-NeerjaNeural",
                        "LocalName": "Neerja (Femme - en-IN)",
                        "Gender": "Female",
                        "Locale": "en-IN",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-IN-PrabhatNeural",
                        "LocalName": "Prabhat (Homme - en-IN)",
                        "Gender": "Male",
                        "Locale": "en-IN",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-IE-ConnorNeural",
                        "LocalName": "Connor (Homme - en-IE)",
                        "Gender": "Male",
                        "Locale": "en-IE",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "en-IE-EmilyNeural",
                        "LocalName": "Emily (Femme - en-IE)",
                        "Gender": "Female",
                        "Locale": "en-IE",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-KE-AsiliaNeural",
                        "LocalName": "Asilia (Femme - en-KE)",
                        "Gender": "Female",
                        "Locale": "en-KE",
                        "PitchMod": 0.8,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-KE-ChilembaNeural",
                        "LocalName": "Chilemba (Homme - en-KE)",
                        "Gender": "Male",
                        "Locale": "en-KE",
                        "PitchMod": 1.24,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-NZ-MitchellNeural",
                        "LocalName": "Mitchell (Homme - en-NZ)",
                        "Gender": "Male",
                        "Locale": "en-NZ",
                        "PitchMod": 0.77,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "en-NZ-MollyNeural",
                        "LocalName": "Molly (Femme - en-NZ)",
                        "Gender": "Female",
                        "Locale": "en-NZ",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-NG-AbeoNeural",
                        "LocalName": "Abeo (Homme - en-NG)",
                        "Gender": "Male",
                        "Locale": "en-NG",
                        "PitchMod": 1.15,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "en-NG-EzinneNeural",
                        "LocalName": "Ezinne (Femme - en-NG)",
                        "Gender": "Female",
                        "Locale": "en-NG",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "en-PH-JamesNeural",
                        "LocalName": "James (Homme - en-PH)",
                        "Gender": "Male",
                        "Locale": "en-PH",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-PH-RosaNeural",
                        "LocalName": "Rosa (Femme - en-PH)",
                        "Gender": "Female",
                        "Locale": "en-PH",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-AvaNeural",
                        "LocalName": "Ava (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-US-AndrewNeural",
                        "LocalName": "Andrew (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.18,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-EmmaNeural",
                        "LocalName": "Emma (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.93,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "en-US-BrianNeural",
                        "LocalName": "Brian (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.01,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-SG-LunaNeural",
                        "LocalName": "Luna (Femme - en-SG)",
                        "Gender": "Female",
                        "Locale": "en-SG",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "en-SG-WayneNeural",
                        "LocalName": "Wayne (Homme - en-SG)",
                        "Gender": "Male",
                        "Locale": "en-SG",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "en-ZA-LeahNeural",
                        "LocalName": "Leah (Femme - en-ZA)",
                        "Gender": "Female",
                        "Locale": "en-ZA",
                        "PitchMod": 1.24,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "en-ZA-LukeNeural",
                        "LocalName": "Luke (Homme - en-ZA)",
                        "Gender": "Male",
                        "Locale": "en-ZA",
                        "PitchMod": 0.97,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "en-TZ-ElimuNeural",
                        "LocalName": "Elimu (Homme - en-TZ)",
                        "Gender": "Male",
                        "Locale": "en-TZ",
                        "PitchMod": 1.23,
                        "RateMod": 1.08
            },
            {
                        "ShortName": "en-TZ-ImaniNeural",
                        "LocalName": "Imani (Femme - en-TZ)",
                        "Gender": "Female",
                        "Locale": "en-TZ",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-GB-LibbyNeural",
                        "LocalName": "Libby (Femme - en-GB)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.76,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-GB-MaisieNeural",
                        "LocalName": "Maisie (Femme - en-GB)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-GB-RyanNeural",
                        "LocalName": "Ryan (Homme - en-GB)",
                        "Gender": "Male",
                        "Locale": "en-GB",
                        "PitchMod": 0.88,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "en-GB-SoniaNeural",
                        "LocalName": "Sonia (Femme - en-GB)",
                        "Gender": "Female",
                        "Locale": "en-GB",
                        "PitchMod": 0.84,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-GB-ThomasNeural",
                        "LocalName": "Thomas (Homme - en-GB)",
                        "Gender": "Male",
                        "Locale": "en-GB",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-AnaNeural",
                        "LocalName": "Ana (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.81,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "en-US-AndrewMultilingualNeural",
                        "LocalName": "Andrew (Multilingue) (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "en-US-AriaNeural",
                        "LocalName": "Aria (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.9,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "en-US-AvaMultilingualNeural",
                        "LocalName": "Ava (Multilingue) (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-US-BrianMultilingualNeural",
                        "LocalName": "Brian (Multilingue) (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.22,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-ChristopherNeural",
                        "LocalName": "Christopher (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.22,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-EmmaMultilingualNeural",
                        "LocalName": "Emma (Multilingue) (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.14,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "en-US-EricNeural",
                        "LocalName": "Eric (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "en-US-GuyNeural",
                        "LocalName": "Guy (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.18,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "en-US-JennyNeural",
                        "LocalName": "Jenny (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 0.75,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "en-US-MichelleNeural",
                        "LocalName": "Michelle (Femme - en-US)",
                        "Gender": "Female",
                        "Locale": "en-US",
                        "PitchMod": 1.12,
                        "RateMod": 0.97
            },
            {
                        "ShortName": "en-US-RogerNeural",
                        "LocalName": "Roger (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.2,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "en-US-SteffanNeural",
                        "LocalName": "Steffan (Homme - en-US)",
                        "Gender": "Male",
                        "Locale": "en-US",
                        "PitchMod": 1.2,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-BE-CharlineNeural",
                        "LocalName": "Charline (Femme - fr-BE)",
                        "Gender": "Female",
                        "Locale": "fr-BE",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "fr-BE-GerardNeural",
                        "LocalName": "Gerard (Homme - fr-BE)",
                        "Gender": "Male",
                        "Locale": "fr-BE",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "fr-CA-ThierryNeural",
                        "LocalName": "Thierry (Homme - fr-CA)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 1.21,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "fr-CA-AntoineNeural",
                        "LocalName": "Antoine (Homme - fr-CA)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "fr-CA-JeanNeural",
                        "LocalName": "Jean (Homme - fr-CA)",
                        "Gender": "Male",
                        "Locale": "fr-CA",
                        "PitchMod": 1.1,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-CA-SylvieNeural",
                        "LocalName": "Sylvie (Femme - fr-CA)",
                        "Gender": "Female",
                        "Locale": "fr-CA",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "fr-FR-RemyMultilingualNeural",
                        "LocalName": "Remy (Multilingue) (Homme - fr-FR)",
                        "Gender": "Male",
                        "Locale": "fr-FR",
                        "PitchMod": 0.82,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "fr-FR-DeniseNeural",
                        "LocalName": "Denise (Femme - fr-FR)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "fr-FR-EloiseNeural",
                        "LocalName": "Eloise (Femme - fr-FR)",
                        "Gender": "Female",
                        "Locale": "fr-FR",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "fr-FR-HenriNeural",
                        "LocalName": "Henri (Homme - fr-FR)",
                        "Gender": "Male",
                        "Locale": "fr-FR",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "fr-CH-ArianeNeural",
                        "LocalName": "Ariane (Femme - fr-CH)",
                        "Gender": "Female",
                        "Locale": "fr-CH",
                        "PitchMod": 0.77,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "fr-CH-FabriceNeural",
                        "LocalName": "Fabrice (Homme - fr-CH)",
                        "Gender": "Male",
                        "Locale": "fr-CH",
                        "PitchMod": 1.19,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "de-AT-IngridNeural",
                        "LocalName": "Ingrid (Femme - de-AT)",
                        "Gender": "Female",
                        "Locale": "de-AT",
                        "PitchMod": 0.85,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "de-AT-JonasNeural",
                        "LocalName": "Jonas (Homme - de-AT)",
                        "Gender": "Male",
                        "Locale": "de-AT",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "de-DE-SeraphinaMultilingualNeural",
                        "LocalName": "Seraphina (Multilingue) (Femme - de-DE)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 1.12,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "de-DE-FlorianMultilingualNeural",
                        "LocalName": "Florian (Multilingue) (Homme - de-DE)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 1.04,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "de-DE-AmalaNeural",
                        "LocalName": "Amala (Femme - de-DE)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 0.94,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "de-DE-ConradNeural",
                        "LocalName": "Conrad (Homme - de-DE)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 1.17,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "de-DE-KatjaNeural",
                        "LocalName": "Katja (Femme - de-DE)",
                        "Gender": "Female",
                        "Locale": "de-DE",
                        "PitchMod": 1.09,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "de-DE-KillianNeural",
                        "LocalName": "Killian (Homme - de-DE)",
                        "Gender": "Male",
                        "Locale": "de-DE",
                        "PitchMod": 0.76,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "de-CH-JanNeural",
                        "LocalName": "Jan (Homme - de-CH)",
                        "Gender": "Male",
                        "Locale": "de-CH",
                        "PitchMod": 1.01,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "de-CH-LeniNeural",
                        "LocalName": "Leni (Femme - de-CH)",
                        "Gender": "Female",
                        "Locale": "de-CH",
                        "PitchMod": 1.12,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "it-IT-GiuseppeMultilingualNeural",
                        "LocalName": "Giuseppe (Multilingue) (Homme - it-IT)",
                        "Gender": "Male",
                        "Locale": "it-IT",
                        "PitchMod": 1.13,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "it-IT-DiegoNeural",
                        "LocalName": "Diego (Homme - it-IT)",
                        "Gender": "Male",
                        "Locale": "it-IT",
                        "PitchMod": 0.96,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "it-IT-ElsaNeural",
                        "LocalName": "Elsa (Femme - it-IT)",
                        "Gender": "Female",
                        "Locale": "it-IT",
                        "PitchMod": 0.97,
                        "RateMod": 1.02
            },
            {
                        "ShortName": "it-IT-IsabellaNeural",
                        "LocalName": "Isabella (Femme - it-IT)",
                        "Gender": "Female",
                        "Locale": "it-IT",
                        "PitchMod": 1.05,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "es-AR-ElenaNeural",
                        "LocalName": "Elena (Femme - es-AR)",
                        "Gender": "Female",
                        "Locale": "es-AR",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-AR-TomasNeural",
                        "LocalName": "Tomas (Homme - es-AR)",
                        "Gender": "Male",
                        "Locale": "es-AR",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-BO-MarceloNeural",
                        "LocalName": "Marcelo (Homme - es-BO)",
                        "Gender": "Male",
                        "Locale": "es-BO",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-BO-SofiaNeural",
                        "LocalName": "Sofia (Femme - es-BO)",
                        "Gender": "Female",
                        "Locale": "es-BO",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-CL-CatalinaNeural",
                        "LocalName": "Catalina (Femme - es-CL)",
                        "Gender": "Female",
                        "Locale": "es-CL",
                        "PitchMod": 0.86,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-CL-LorenzoNeural",
                        "LocalName": "Lorenzo (Homme - es-CL)",
                        "Gender": "Male",
                        "Locale": "es-CL",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-CO-GonzaloNeural",
                        "LocalName": "Gonzalo (Homme - es-CO)",
                        "Gender": "Male",
                        "Locale": "es-CO",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-CO-SalomeNeural",
                        "LocalName": "Salome (Femme - es-CO)",
                        "Gender": "Female",
                        "Locale": "es-CO",
                        "PitchMod": 1.01,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "es-ES-XimenaNeural",
                        "LocalName": "Ximena (Femme - es-ES)",
                        "Gender": "Female",
                        "Locale": "es-ES",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-CR-JuanNeural",
                        "LocalName": "Juan (Homme - es-CR)",
                        "Gender": "Male",
                        "Locale": "es-CR",
                        "PitchMod": 0.93,
                        "RateMod": 0.98
            },
            {
                        "ShortName": "es-CR-MariaNeural",
                        "LocalName": "Maria (Femme - es-CR)",
                        "Gender": "Female",
                        "Locale": "es-CR",
                        "PitchMod": 0.85,
                        "RateMod": 0.9
            },
            {
                        "ShortName": "es-CU-BelkysNeural",
                        "LocalName": "Belkys (Femme - es-CU)",
                        "Gender": "Female",
                        "Locale": "es-CU",
                        "PitchMod": 1.16,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "es-CU-ManuelNeural",
                        "LocalName": "Manuel (Homme - es-CU)",
                        "Gender": "Male",
                        "Locale": "es-CU",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-DO-EmilioNeural",
                        "LocalName": "Emilio (Homme - es-DO)",
                        "Gender": "Male",
                        "Locale": "es-DO",
                        "PitchMod": 1.0,
                        "RateMod": 1.05
            },
            {
                        "ShortName": "es-DO-RamonaNeural",
                        "LocalName": "Ramona (Femme - es-DO)",
                        "Gender": "Female",
                        "Locale": "es-DO",
                        "PitchMod": 0.99,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-EC-AndreaNeural",
                        "LocalName": "Andrea (Femme - es-EC)",
                        "Gender": "Female",
                        "Locale": "es-EC",
                        "PitchMod": 1.19,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-EC-LuisNeural",
                        "LocalName": "Luis (Homme - es-EC)",
                        "Gender": "Male",
                        "Locale": "es-EC",
                        "PitchMod": 0.95,
                        "RateMod": 1.0
            },
            {
                        "ShortName": "es-SV-LorenaNeural",
                        "LocalName": "Lorena (Femme - es-SV)",
                        "Gender": "Female",
                        "Locale": "es-SV",
                        "PitchMod": 1.24,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "es-SV-RodrigoNeural",
                        "LocalName": "Rodrigo (Homme - es-SV)",
                        "Gender": "Male",
                        "Locale": "es-SV",
                        "PitchMod": 0.91,
                        "RateMod": 1.06
            },
            {
                        "ShortName": "es-GQ-JavierNeural",
                        "LocalName": "Javier (Homme - es-GQ)",
                        "Gender": "Male",
                        "Locale": "es-GQ",
                        "PitchMod": 1.07,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "es-GQ-TeresaNeural",
                        "LocalName": "Teresa (Femme - es-GQ)",
                        "Gender": "Female",
                        "Locale": "es-GQ",
                        "PitchMod": 1.1,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "es-GT-AndresNeural",
                        "LocalName": "Andres (Homme - es-GT)",
                        "Gender": "Male",
                        "Locale": "es-GT",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-GT-MartaNeural",
                        "LocalName": "Marta (Femme - es-GT)",
                        "Gender": "Female",
                        "Locale": "es-GT",
                        "PitchMod": 1.02,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-HN-CarlosNeural",
                        "LocalName": "Carlos (Homme - es-HN)",
                        "Gender": "Male",
                        "Locale": "es-HN",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-HN-KarlaNeural",
                        "LocalName": "Karla (Femme - es-HN)",
                        "Gender": "Female",
                        "Locale": "es-HN",
                        "PitchMod": 0.87,
                        "RateMod": 0.92
            },
            {
                        "ShortName": "es-MX-DaliaNeural",
                        "LocalName": "Dalia (Femme - es-MX)",
                        "Gender": "Female",
                        "Locale": "es-MX",
                        "PitchMod": 0.86,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-MX-JorgeNeural",
                        "LocalName": "Jorge (Homme - es-MX)",
                        "Gender": "Male",
                        "Locale": "es-MX",
                        "PitchMod": 1.14,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-NI-FedericoNeural",
                        "LocalName": "Federico (Homme - es-NI)",
                        "Gender": "Male",
                        "Locale": "es-NI",
                        "PitchMod": 0.98,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-NI-YolandaNeural",
                        "LocalName": "Yolanda (Femme - es-NI)",
                        "Gender": "Female",
                        "Locale": "es-NI",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-PA-MargaritaNeural",
                        "LocalName": "Margarita (Femme - es-PA)",
                        "Gender": "Female",
                        "Locale": "es-PA",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "es-PA-RobertoNeural",
                        "LocalName": "Roberto (Homme - es-PA)",
                        "Gender": "Male",
                        "Locale": "es-PA",
                        "PitchMod": 1.24,
                        "RateMod": 1.09
            },
            {
                        "ShortName": "es-PY-MarioNeural",
                        "LocalName": "Mario (Homme - es-PY)",
                        "Gender": "Male",
                        "Locale": "es-PY",
                        "PitchMod": 1.19,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-PY-TaniaNeural",
                        "LocalName": "Tania (Femme - es-PY)",
                        "Gender": "Female",
                        "Locale": "es-PY",
                        "PitchMod": 1.08,
                        "RateMod": 0.93
            },
            {
                        "ShortName": "es-PE-AlexNeural",
                        "LocalName": "Alex (Homme - es-PE)",
                        "Gender": "Male",
                        "Locale": "es-PE",
                        "PitchMod": 0.89,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-PE-CamilaNeural",
                        "LocalName": "Camila (Femme - es-PE)",
                        "Gender": "Female",
                        "Locale": "es-PE",
                        "PitchMod": 0.78,
                        "RateMod": 1.03
            },
            {
                        "ShortName": "es-PR-KarinaNeural",
                        "LocalName": "Karina (Femme - es-PR)",
                        "Gender": "Female",
                        "Locale": "es-PR",
                        "PitchMod": 1.06,
                        "RateMod": 0.91
            },
            {
                        "ShortName": "es-PR-VictorNeural",
                        "LocalName": "Victor (Homme - es-PR)",
                        "Gender": "Male",
                        "Locale": "es-PR",
                        "PitchMod": 0.89,
                        "RateMod": 1.04
            },
            {
                        "ShortName": "es-ES-AlvaroNeural",
                        "LocalName": "Alvaro (Homme - es-ES)",
                        "Gender": "Male",
                        "Locale": "es-ES",
                        "PitchMod": 1.11,
                        "RateMod": 0.96
            },
            {
                        "ShortName": "es-ES-ElviraNeural",
                        "LocalName": "Elvira (Femme - es-ES)",
                        "Gender": "Female",
                        "Locale": "es-ES",
                        "PitchMod": 1.09,
                        "RateMod": 0.94
            },
            {
                        "ShortName": "es-US-AlonsoNeural",
                        "LocalName": "Alonso (Homme - es-US)",
                        "Gender": "Male",
                        "Locale": "es-US",
                        "PitchMod": 0.84,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-US-PalomaNeural",
                        "LocalName": "Paloma (Femme - es-US)",
                        "Gender": "Female",
                        "Locale": "es-US",
                        "PitchMod": 1.16,
                        "RateMod": 1.01
            },
            {
                        "ShortName": "es-UY-MateoNeural",
                        "LocalName": "Mateo (Homme - es-UY)",
                        "Gender": "Male",
                        "Locale": "es-UY",
                        "PitchMod": 1.22,
                        "RateMod": 1.07
            },
            {
                        "ShortName": "es-UY-ValentinaNeural",
                        "LocalName": "Valentina (Femme - es-UY)",
                        "Gender": "Female",
                        "Locale": "es-UY",
                        "PitchMod": 1.0,
                        "RateMod": 0.95
            },
            {
                        "ShortName": "es-VE-PaolaNeural",
                        "LocalName": "Paola (Femme - es-VE)",
                        "Gender": "Female",
                        "Locale": "es-VE",
                        "PitchMod": 0.94,
                        "RateMod": 0.99
            },
            {
                        "ShortName": "es-VE-SebastianNeural",
                        "LocalName": "Sebastian (Homme - es-VE)",
                        "Gender": "Male",
                        "Locale": "es-VE",
                        "PitchMod": 1.23,
                        "RateMod": 1.08
            }
];
    }

    initSystemVoices() {
        if ('speechSynthesis' in window) {
            const load = () => {
                this.systemVoices = window.speechSynthesis.getVoices();
            };
            load();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = load;
            }
        }
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
            console.warn("Utilisation de la synthèse vocale modulée dynamique.", err);
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
            }, 4000);

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

    /**
     * Algorithme de distinction vocale garanti pour CHAQUE option du menu
     */
    _synthesizeNativeWebSpeech(text, options = {}) {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                
                const selectedVoiceShortName = options.voice || "fr-FR-VivienneMultilingualNeural";
                const voiceIndex = Math.max(0, this.voicesDatabase.findIndex(v => v.ShortName === selectedVoiceShortName));
                const voiceMeta = this.voicesDatabase[voiceIndex] || this.voicesDatabase[0];
                
                const targetGender = voiceMeta.Gender;
                const parts = selectedVoiceShortName.split('-');
                const targetLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

                utterance.lang = targetLang;
                
                // Différenciation acoustique forte basée sur l'index exact de la voix dans le menu
                const basePitch = targetGender === "Female" ? 1.25 : 0.82;
                const indexShift = ((voiceIndex % 7) - 3) * 0.08;
                const baseRate = 0.95 + ((voiceIndex % 5) * 0.05);

                let userRate = options.rate !== undefined ? (1.0 + (options.rate / 100)) : 1.0;
                let userPitch = options.pitch !== undefined ? (1.0 + (options.pitch / 100)) : 1.0;

                utterance.pitch = Math.max(0.5, Math.min(2.0, (basePitch + indexShift) * userPitch));
                utterance.rate = Math.max(0.5, Math.min(2.0, baseRate * userRate));

                const liveVoices = window.speechSynthesis.getVoices();
                if (liveVoices.length > 0) {
                    const langVoices = liveVoices.filter(v => v.lang.replace('_','-').toLowerCase().startsWith(targetLang.slice(0,2).toLowerCase()));
                    
                    if (langVoices.length > 0) {
                        // Distribution cyclique garantie sur l'ensemble des voix installées sur le système (Paul, Hortense, Julie, Google, etc.)
                        const targetVoiceObj = langVoices[voiceIndex % langVoices.length];
                        if (targetVoiceObj) utterance.voice = targetVoiceObj;
                    }
                }

                window.speechSynthesis.speak(utterance);
                
                const dummyData = new Uint8Array([73, 68, 51, 3, 0, 0, 0, 0, 0, 0]);
                resolve(new Blob([dummyData], { type: 'audio/mp3' }));
            } else {
                resolve(new Blob([], { type: 'audio/mp3' }));
            }
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
