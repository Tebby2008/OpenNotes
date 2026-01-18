/**
 * search.js
 * Advanced Concept-Based Search Engine
 * Features: Smart Weighting (Core vs Modifiers), Overlap Scoring, Multilingual, Broad Taxonomies
 */

const CONCEPT_MAP = {
    // ============================
    // 1. BROAD & TECH
    // ============================
    "technology": "CONCEPT_TECH_GEN",
    "tech": "CONCEPT_TECH_GEN",
    "stem": "CONCEPT_STEM",
    
    "artificial intelligence": "CONCEPT_AI",
    "machine learning": "CONCEPT_AI",
    "ai": "CONCEPT_AI",
    "ml": "CONCEPT_AI",
    "neural network": "CONCEPT_AI",
    "algorithm": "CONCEPT_ALGO",
    "algorithms": "CONCEPT_ALGO",
    "algo": "CONCEPT_ALGO",
    
    "high school": "CONCEPT_HS_GEN",
    "hs": "CONCEPT_HS_GEN",
    "finance": "CONCEPT_FINANCE",
    "business": "CONCEPT_BUSMAN", 
    
    // ============================
    // 2. CODING & CS
    // ============================
    "ap csp": "CONCEPT_CSP",
    "apcsp": "CONCEPT_CSP", 
    "csp": "CONCEPT_CSP",
    "ap csa": "CONCEPT_CSA",
    "apcsa": "CONCEPT_CSA", 
    "csa": "CONCEPT_CSA",
    "comp sci": "CONCEPT_CS_GEN",
    "comp science": "CONCEPT_CS_GEN",
    "computer science": "CONCEPT_CS_GEN",
    "compsci": "CONCEPT_CS_GEN",
    "programming": "CONCEPT_CODING_GEN",
    "coding": "CONCEPT_CODING_GEN",
    "web dev": "CONCEPT_WEB_DEV",
    
    "c plus plus": "CONCEPT_CPP", 
    "cpp": "CONCEPT_CPP",
    "python": "CONCEPT_PYTHON",
    "py": "CONCEPT_PYTHON",
    "java": "CONCEPT_JAVA",
    "javascript": "CONCEPT_JS",
    "js": "CONCEPT_JS",

    // ============================
    // 3. MATHEMATICS
    // ============================
    "apcalc": "CONCEPT_CALC_GEN",
    "apstat": "CONCEPT_STATS",
    "apstats": "CONCEPT_STATS",

    "calc ab": "CONCEPT_CALC_AB",
    "ab calc": "CONCEPT_CALC_AB",
    "calc bc": "CONCEPT_CALC_BC",
    "bc calc": "CONCEPT_CALC_BC",
    "pre cal": "CONCEPT_PRECALC",
    "pre calc": "CONCEPT_PRECALC",
    "pre-cal": "CONCEPT_PRECALC",
    "pre-calc": "CONCEPT_PRECALC",
    "alg 1": "CONCEPT_ALG_1",
    "alg i": "CONCEPT_ALG_1",
    "algebra 1": "CONCEPT_ALG_1",
    "algebra i": "CONCEPT_ALG_1",
    "alg 2": "CONCEPT_ALG_2",
    "alg ii": "CONCEPT_ALG_2",
    "algebra 2": "CONCEPT_ALG_2",
    "algebra ii": "CONCEPT_ALG_2",
    "lin alg": "CONCEPT_LIN_ALG",
    "diff eq": "CONCEPT_DIFF_EQ",
    "multi": "CONCEPT_MULTIVAR",
    "multivar": "CONCEPT_MULTIVAR",
    "stats": "CONCEPT_STATS",
    "statistics": "CONCEPT_STATS",
    
    "matematicas": "CONCEPT_MATH_GEN",
    "math": "CONCEPT_MATH_GEN",
    "maths": "CONCEPT_MATH_GEN",
    "数学": "CONCEPT_MATH_GEN", 
    "shuxue": "CONCEPT_MATH_GEN",

    // IB Math
    "ib math": "CONCEPT_IB_MATH_BROAD",
    "ib maths": "CONCEPT_IB_MATH_BROAD",
    "ibmath": "CONCEPT_IB_MATH_BROAD",
    
    "aa hl": "CONCEPT_MATH_AA_HL",
    "aahl": "CONCEPT_MATH_AA_HL",
    "ibaahl": "CONCEPT_MATH_AA_HL",
    "aa sl": "CONCEPT_MATH_AA_SL",
    "aasl": "CONCEPT_MATH_AA_SL",
    "ibaasl": "CONCEPT_MATH_AA_SL",
    
    "ai hl": "CONCEPT_MATH_AI_HL",
    "aihl": "CONCEPT_MATH_AI_HL",
    "ibaihl": "CONCEPT_MATH_AI_HL",
    "ai sl": "CONCEPT_MATH_AI_SL",
    "aisl": "CONCEPT_MATH_AI_SL",
    "ibaisl": "CONCEPT_MATH_AI_SL",
    
    "math aa": "CONCEPT_MATH_AA_GEN",
    "math ai": "CONCEPT_MATH_AI_GEN",

    // ============================
    // 4. SCIENCES
    // ============================
    "apbio": "CONCEPT_BIO",
    "ibbio": "CONCEPT_BIO",
    "apchem": "CONCEPT_CHEM",
    "ibchem": "CONCEPT_CHEM",
    "apphys": "CONCEPT_PHYS",
    "apphysics": "CONCEPT_PHYS",
    "ibphys": "CONCEPT_PHYS",
    "ibphysics": "CONCEPT_PHYS",

    "science": "CONCEPT_SCI_GEN",
    "sciences": "CONCEPT_SCI_GEN",
    "sci": "CONCEPT_SCI_GEN",
    "ciencia": "CONCEPT_SCI_GEN",
    "科学": "CONCEPT_SCI_GEN",
    "kexue": "CONCEPT_SCI_GEN",

    "env sys": "CONCEPT_ESS",
    "ibess": "CONCEPT_ESS",
    "env sci": "CONCEPT_APES",
    "apes": "CONCEPT_APES",
    "sports ex": "CONCEPT_SEHS",
    "sehs": "CONCEPT_SEHS",
    
    "bio": "CONCEPT_BIO",
    "biology": "CONCEPT_BIO",
    "biologia": "CONCEPT_BIO",
    "生物": "CONCEPT_BIO",
    "shengwu": "CONCEPT_BIO",

    "chem": "CONCEPT_CHEM",
    "chemistry": "CONCEPT_CHEM",
    "quimica": "CONCEPT_CHEM",
    "化学": "CONCEPT_CHEM",
    "huaxue": "CONCEPT_CHEM",
    
    "phys": "CONCEPT_PHYS",
    "physics": "CONCEPT_PHYS",
    "fisica": "CONCEPT_PHYS",
    "物理": "CONCEPT_PHYS",
    "wuli": "CONCEPT_PHYS",

    // ============================
    // 5. HUMANITIES
    // ============================
    "apush": "CONCEPT_USH",
    "apeuro": "CONCEPT_EURO",
    "apworld": "CONCEPT_WHIST",
    "apgov": "CONCEPT_USGOV",
    "apmacro": "CONCEPT_ECON_MACRO",
    "apmicro": "CONCEPT_ECON_MICRO",
    "ibecon": "CONCEPT_ECON",
    "ibpsych": "CONCEPT_PSYCH",
    "ibhistory": "CONCEPT_HISTORY_GEN",

    "humanities": "CONCEPT_HUMANITIES_GEN",
    "social science": "CONCEPT_SOCSCI_GEN",
    "social studies": "CONCEPT_SOCSCI_GEN",

    "us hist": "CONCEPT_USH",
    "u s hist": "CONCEPT_USH",
    "euro hist": "CONCEPT_EURO",
    "mod hist": "CONCEPT_MOD_HIST",
    "w hist": "CONCEPT_WHIST",
    "world hist": "CONCEPT_WHIST",
    "whap": "CONCEPT_WHIST",
    
    "historia": "CONCEPT_HISTORY_GEN",
    "历史": "CONCEPT_HISTORY_GEN",
    "lishi": "CONCEPT_HISTORY_GEN",
    
    "human geo": "CONCEPT_HUG",
    "aphug": "CONCEPT_HUG",
    "glob pol": "CONCEPT_GLOPO",
    "glo po": "CONCEPT_GLOPO",
    "glopo": "CONCEPT_GLOPO",
    
    "bus man": "CONCEPT_BUSMAN",
    "business": "CONCEPT_BUSMAN",
    "negocios": "CONCEPT_BUSMAN",
    
    "comp gov": "CONCEPT_COMPGOV",
    "us gov": "CONCEPT_USGOV",
    
    "econ": "CONCEPT_ECON",
    "economics": "CONCEPT_ECON",
    "economia": "CONCEPT_ECON",
    "经济": "CONCEPT_ECON",
    "jingji": "CONCEPT_ECON",
    "macro": "CONCEPT_ECON_MACRO",
    "micro": "CONCEPT_ECON_MICRO",

    "psych": "CONCEPT_PSYCH",
    "psychology": "CONCEPT_PSYCH",
    "psicologia": "CONCEPT_PSYCH",
    "心理": "CONCEPT_PSYCH",
    "xinli": "CONCEPT_PSYCH",

    // ============================
    // 6. LANGUAGES & ARTS
    // ============================
    "lang lit": "CONCEPT_ENG_LL",
    "lang & lit": "CONCEPT_ENG_LL",
    "lang and lit": "CONCEPT_ENG_LL",
    "l&l": "CONCEPT_ENG_LL",
    "l+l": "CONCEPT_ENG_LL",
    "ll": "CONCEPT_ENG_LL",
    "lit": "CONCEPT_ENG_LIT",
    "ab initio": "CONCEPT_LANG_AB",
    "lang ab": "CONCEPT_LANG_AB",
    
    "spanish": "CONCEPT_SPANISH",
    "esp": "CONCEPT_SPANISH",
    "espanol": "CONCEPT_SPANISH",
    "español": "CONCEPT_SPANISH",
    "西语": "CONCEPT_SPANISH",
    "西班牙语": "CONCEPT_SPANISH",
    "xiyu": "CONCEPT_SPANISH",

    "french": "CONCEPT_FRENCH",
    "fr": "CONCEPT_FRENCH",
    "francais": "CONCEPT_FRENCH",
    "français": "CONCEPT_FRENCH",
    "法语": "CONCEPT_FRENCH",
    "fayu": "CONCEPT_FRENCH",

    "chinese": "CONCEPT_CHINESE",
    "mandarin": "CONCEPT_CHINESE",
    "cn": "CONCEPT_CHINESE",
    "中文": "CONCEPT_CHINESE",
    "汉语": "CONCEPT_CHINESE",
    "hanyu": "CONCEPT_CHINESE",
    "zhongwen": "CONCEPT_CHINESE",
    "语文": "CONCEPT_CHINESE",

    "english": "CONCEPT_ENG_GEN",
    "eng": "CONCEPT_ENG_GEN",
    "ingles": "CONCEPT_ENG_GEN",
    "英语": "CONCEPT_ENG_GEN",
    "yingyu": "CONCEPT_ENG_GEN",
    
    "visual arts": "CONCEPT_VIS_ARTS",
    "vis arts": "CONCEPT_VIS_ARTS",
    "art hist": "CONCEPT_ART_HIST",
    "ap art hist": "CONCEPT_ART_HIST",
    "design tech": "CONCEPT_DT",
    "dt": "CONCEPT_DT",
    "ib dt": "CONCEPT_DT",
    "music": "CONCEPT_MUSIC",
    "music theory": "CONCEPT_MUSIC_THEORY",
    "msc": "CONCEPT_MUSIC",
    "abrsm": "CONCEPT_MUSIC_ABRSM",
    "theatre": "CONCEPT_THEATRE",
    "theater": "CONCEPT_THEATRE",
    "drama": "CONCEPT_THEATRE",
    "film": "CONCEPT_FILM",

    // ============================
    // 7. IB CORE & RESEARCH
    // ============================
    "ib core": "CONCEPT_IB_CORE",
    "tok": "CONCEPT_TOK",
    "ibtok": "CONCEPT_TOK",
    "theory of know": "CONCEPT_TOK",
    "theory of knowledge": "CONCEPT_TOK",
    
    "ee": "CONCEPT_RESEARCH",
    "ib research": "CONCEPT_RESEARCH",
    "extended essay": "CONCEPT_RESEARCH",
    "ia": "CONCEPT_RESEARCH",
    "internal assessment": "CONCEPT_RESEARCH",
    "cas": "CONCEPT_CAS",

    // ============================
    // 8. MODIFIERS (Weighted Low)
    // ============================
    "ib yr 1": "CONCEPT_IB_Y1",
    "ib yr1": "CONCEPT_IB_Y1",
    "ib y1": "CONCEPT_IB_Y1",
    "ib year 1": "CONCEPT_IB_Y1",
    "ib yr 2": "CONCEPT_IB_Y2",
    "ib yr2": "CONCEPT_IB_Y2",
    "ib y2": "CONCEPT_IB_Y2",
    "ib year 2": "CONCEPT_IB_Y2",
    
    "grade 11": "CONCEPT_GRADE_11",
    "g11": "CONCEPT_GRADE_11",
    "gr 11": "CONCEPT_GRADE_11",
    "yr 12": "CONCEPT_GRADE_11",
    "year 12": "CONCEPT_GRADE_11",

    "grade 12": "CONCEPT_GRADE_12",
    "g12": "CONCEPT_GRADE_12",
    "gr 12": "CONCEPT_GRADE_12",
    "yr 13": "CONCEPT_GRADE_12",
    "year 13": "CONCEPT_GRADE_12",
    
    "grade 1": "CONCEPT_GRADE_1",
    "g1": "CONCEPT_GRADE_1",
    "grade 5": "CONCEPT_GRADE_5",
    "g5": "CONCEPT_GRADE_5",
    
    "pt 1": "CONCEPT_PART_1",
    "pt1": "CONCEPT_PART_1",
    "pt 2": "CONCEPT_PART_2",
    "pt2": "CONCEPT_PART_2",
    "sem 1": "CONCEPT_SEM_1",
    "sem1": "CONCEPT_SEM_1",
    "study guide": "CONCEPT_GUIDE",
    "review": "CONCEPT_GUIDE",
    "summary": "CONCEPT_GUIDE",
    "hl": "CONCEPT_LEVEL_HL",
    "higher level": "CONCEPT_LEVEL_HL",
    "sl": "CONCEPT_LEVEL_SL",
    "standard level": "CONCEPT_LEVEL_SL",

    // ============================
    // 9. TEST PREP
    // ============================
    "std test": "CONCEPT_TEST_PREP",
    "test prep": "CONCEPT_TEST_PREP",
    "sat": "CONCEPT_SAT",
    "act": "CONCEPT_ACT"
};

const SYNONYMS = {
    // --- TECH & BROAD ---
    "CONCEPT_TECH_GEN": ["technology", "tech", "computer science", "coding", "design technology", "digital", "stem"],
    "CONCEPT_AI": ["artificial intelligence", "ai", "machine learning", "ml", "neural networks", "deep learning", "computer science", "algorithms"],
    "CONCEPT_ALGO": ["algorithm", "logic", "computer science", "coding", "mathematics", "flowchart"],
    "CONCEPT_STEM": ["science technology engineering math", "science", "math", "coding", "physics", "chemistry", "biology"],
    "CONCEPT_FINANCE": ["finance", "economics", "business", "money", "accounting", "investing", "stocks"],
    
    // --- ARTS ---
    "CONCEPT_VIS_ARTS": ["visual arts", "art", "painting", "drawing", "sculpture", "art history", "sketchbook"],
    "CONCEPT_ART_HIST": ["art history", "ap art history", "history of art"],
    "CONCEPT_DT": ["design technology", "dt", "product design", "cad", "tech"],
    "CONCEPT_MUSIC": ["music", "musical", "instrument", "orchestra", "band", "musica", "yinyue"],
    "CONCEPT_MUSIC_THEORY": ["music theory", "harmony", "scales", "composition"],
    "CONCEPT_MUSIC_ABRSM": ["abrsm", "royal schools of music", "trinity", "music grade"],
    "CONCEPT_THEATRE": ["theatre", "theater", "drama", "performing arts", "acting", "script", "play"],
    "CONCEPT_FILM": ["film", "movies", "cinema", "film studies", "production"],

    // --- CODING ---
    "CONCEPT_CS_GEN": ["computer science", "comp sci", "coding", "programming", "algorithms", "data structures", "jisuanji", "tech"],
    "CONCEPT_CODING_GEN": ["programming", "coding", "software", "development", "code", "dev", "tech"],
    "CONCEPT_CSP": ["computer science principles", "csp", "ap csp", "apcsp", "coding basics"],
    "CONCEPT_CSA": ["computer science a", "csa", "ap csa", "apcsa", "java", "object oriented"],
    "CONCEPT_JAVA": ["java", "jvm", "backend"],
    "CONCEPT_PYTHON": ["python", "py", "pandas", "numpy", "scripting"],
    "CONCEPT_CPP": ["c++", "cpp", "c plus plus"],
    "CONCEPT_JS": ["javascript", "js", "ecmascript", "node", "frontend", "web"],
    "CONCEPT_WEB_DEV": ["html", "css", "javascript", "web development", "frontend", "backend"],

    // --- MATH ---
    "CONCEPT_MATH_GEN": ["mathematics", "math", "maths", "matematicas", "calculus", "algebra", "geometry", "数学", "shuxue", "logic"],
    "CONCEPT_CALC_GEN": ["calculus", "calc", "limits", "derivatives", "integrals"],
    "CONCEPT_CALC_AB": ["calculus ab", "ap calc ab", "limit", "derivative", "integral"], 
    "CONCEPT_CALC_BC": ["calculus bc", "ap calc bc", "series", "polar", "taylor"],
    "CONCEPT_PRECALC": ["precalculus", "pre-calculus", "pre calculo", "functions", "trigonometry"],
    "CONCEPT_ALG_1": ["algebra i", "algebra 1", "linear equations"],
    "CONCEPT_ALG_2": ["algebra ii", "algebra 2", "quadratics", "polynomials"],
    "CONCEPT_LIN_ALG": ["linear algebra", "matrices", "vectors"],
    "CONCEPT_DIFF_EQ": ["differential equations", "ode"],
    "CONCEPT_MULTIVAR": ["multivariable calculus", "vector calculus", "calc 3"],
    "CONCEPT_STATS": ["statistics", "stats", "probability", "data analysis", "ap stats"],

    // IB MATH
    "CONCEPT_IB_MATH_BROAD": ["mathematics", "analysis and approaches", "applications and interpretation", "aa", "ai", "sl", "hl"],
    "CONCEPT_MATH_AA_HL": ["mathematics analysis and approaches higher level", "aa hl", "aahl", "ibaahl"],
    "CONCEPT_MATH_AA_SL": ["mathematics analysis and approaches standard level", "aa sl", "aasl", "ibaasl"],
    "CONCEPT_MATH_AI_HL": ["mathematics applications and interpretation higher level", "ai hl", "aihl"],
    "CONCEPT_MATH_AI_SL": ["mathematics applications and interpretation standard level", "ai sl", "aisl"],
    "CONCEPT_MATH_AA_GEN": ["analysis and approaches", "math aa"],
    "CONCEPT_MATH_AI_GEN": ["applications and interpretation", "math ai"],

    // --- SCIENCES ---
    "CONCEPT_SCI_GEN": ["science", "biology", "chemistry", "physics", "ess", "ciencia", "科学", "kexue", "stem"],
    "CONCEPT_ESS": ["environmental systems and societies", "ess", "ecology"],
    "CONCEPT_APES": ["environmental science", "apes", "ecology", "enviro"],
    "CONCEPT_SEHS": ["sports exercise and health science", "sehs", "anatomy", "physiology"],
    "CONCEPT_BIO": ["biology", "bio", "cells", "genetics", "biologia", "生物", "shengwu"],
    "CONCEPT_CHEM": ["chemistry", "chem", "stoichiometry", "periodic table", "quimica", "化学", "huaxue"],
    "CONCEPT_PHYS": ["physics", "phys", "mechanics", "kinematics", "fisica", "物理", "wuli"],

    // --- LANGUAGES ---
    "CONCEPT_LANG_GEN": ["language", "english", "spanish", "french", "chinese", "linguistics"],
    "CONCEPT_LANG_FOREIGN": ["spanish", "french", "chinese", "german", "language b"],
    "CONCEPT_SPANISH": ["spanish", "espanol", "español", "esp", "castellano", "西语", "xiyu"],
    "CONCEPT_FRENCH": ["french", "francais", "français", "fr", "法语", "fayu"],
    "CONCEPT_CHINESE": ["chinese", "mandarin", "cn", "中文", "汉语", "hanyu", "zhongwen", "chinese literature", "yuwen", "语文"],
    "CONCEPT_ENG_GEN": ["english", "eng", "literature", "lang lit", "ingles", "英语", "yingyu"],
    "CONCEPT_ENG_LL": ["language and literature", "lang lit", "english a"],
    "CONCEPT_ENG_LIT": ["literature", "english a literature", "lit"],
    "CONCEPT_LANG_AB": ["ab initio", "introductory language"],

    // --- HUMANITIES ---
    "CONCEPT_HUMANITIES_GEN": ["history", "geography", "literature", "philosophy", "arts", "social studies"],
    "CONCEPT_SOCSCI_GEN": ["economics", "psychology", "politics", "business", "sociology"],
    
    "CONCEPT_USH": ["united states history", "apush", "american history", "hoa", "history of the americas", "us history"],
    "CONCEPT_EURO": ["european history", "euro", "apeuro"],
    "CONCEPT_WHIST": ["world history", "whap", "modern history"],
    "CONCEPT_HISTORY_GEN": ["history", "historia", "historie", "历史", "lishi"],
    
    "CONCEPT_HUG": ["human geography", "aphug", "demography"],
    "CONCEPT_GLOPO": ["global politics", "glopo", "international relations"],
    "CONCEPT_BUSMAN": ["business management", "bm", "business", "marketing", "finance", "negocios"],
    "CONCEPT_COMPGOV": ["comparative government", "comp gov", "politics"],
    "CONCEPT_USGOV": ["united states government", "us government", "gov", "civics"],
    "CONCEPT_ECON": ["economics", "econ", "micro", "macro", "economia", "经济", "jingji"],
    "CONCEPT_ECON_MACRO": ["macroeconomics", "macro", "national economy"],
    "CONCEPT_ECON_MICRO": ["microeconomics", "micro", "market economy"],
    "CONCEPT_PSYCH": ["psychology", "psych", "neuroscience", "psicologia", "心理", "xinli"],

    // --- IB CORE & RESEARCH ---
    "CONCEPT_IB_CORE": ["tok", "ee", "cas", "theory of knowledge", "extended essay"],
    "CONCEPT_TOK": ["theory of knowledge", "tok", "epistemology", "essay", "exhibition"],
    "CONCEPT_RESEARCH": ["extended essay", "ee", "internal assessment", "ia", "research", "investigation"],
    "CONCEPT_CAS": ["creativity activity service", "reflections"],

    // --- TEST PREP ---
    "CONCEPT_TEST_PREP": ["sat", "act", "standardized test", "college board"],
    "CONCEPT_SAT": ["sat", "scholastic assessment test", "reading", "writing", "math"],
    "CONCEPT_ACT": ["act", "american college testing"],

    // --- BASIC CONNECTORS ---
    "&": ["and"],
    "+": ["and", "plus"],
    "vs": ["versus"],
    "intl": ["international"]
};

const MODIFIER_PREFIXES = [
    "CONCEPT_GRADE", 
    "CONCEPT_IB_Y", 
    "CONCEPT_PART", 
    "CONCEPT_SEM", 
    "CONCEPT_LEVEL",
    "CONCEPT_GUIDE"
];

/**
 * Standard Levenshtein Distance Algorithm
 * Calculates how many edits (insert/delete/sub) to turn a into b
 */
function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(
                        matrix[i][j - 1] + 1, 
                        matrix[i - 1][j] + 1  
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Normalize text:
 * 1. Lowercase
 * 2. Space out symbols
 * 3. Handle specific character replacements (like + -> plus) BEFORE strictly removing punctuation
 */
function normalize(text) {
    if (!text) return "";
    return text.toLowerCase()
        .replace(/\+/g, " plus ") 
        .replace(/&/g, " and ") 
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        .replace(/[:\-\(\)\/\\,.]/g, " ")
        .replace(/\s+/g, " ")   
        .trim();
}

export function searchNotes(items, query, options = {}) {
    const { showAI = true, currentFormat = "all" } = options;
    
    let workingQuery = normalize(query);

    const conceptKeys = Object.keys(CONCEPT_MAP);
    const rawTokens = workingQuery.split(" ");
    
    const correctedTokens = rawTokens.map(token => {
        if (CONCEPT_MAP[token]) return token;
        
        if (token.length < 4) return token;

        for (const key of conceptKeys) {
            if (Math.abs(token.length - key.length) > 2) continue;

            const dist = getEditDistance(token, key);
            
            const allowedErrors = token.length > 6 ? 2 : 1;
            
            if (dist <= allowedErrors) {
                return key;
            }
        }
        return token;
    });
    
    workingQuery = correctedTokens.join(" ");

    for (const [phrase, conceptId] of Object.entries(CONCEPT_MAP)) {
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'g');
        
        if (regex.test(workingQuery)) {
            workingQuery = workingQuery.replace(regex, conceptId);
        } else if (workingQuery.includes(phrase)) {
             workingQuery = workingQuery.split(phrase).join(` ${conceptId} `);
        }
    }

    workingQuery = workingQuery
        .replace(/&/g, "and")
        .replace(/\+/g, "plus")
        .replace(/\s+/g, " ")
        .trim();

    const tokens = workingQuery.split(" ");
    const totalQueryTokens = tokens.length;
    
    const searchTargets = [];
    tokens.forEach(t => {
        const set = new Set();
        set.add(t); 
        
        if (SYNONYMS[t]) {
            SYNONYMS[t].forEach(s => set.add(s));
        }

        const normT = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normT !== t) set.add(normT);

        let weight = 25; 
        if (MODIFIER_PREFIXES.some(prefix => t.startsWith(prefix))) {
            weight = 5; 
        }

        searchTargets.push({
            candidates: Array.from(set),
            weight: weight
        });
    });

    return items.map(item => {
        if (!showAI && item.ai) return null;
        if (currentFormat !== "all" && item.fmt !== currentFormat) return null;

        const titleNorm = normalize(item.title);
        const authNorm = normalize(item.auth || "");
        
        let score = 0;
        let matchedTokenCount = 0;

        searchTargets.forEach(({ candidates, weight }) => {
            let tokenMatch = false;
            
            for (const str of candidates) {
                if (titleNorm.includes(str)) {
                    score += weight + (str.length * 1.5);
                    tokenMatch = true;
                    if (titleNorm.startsWith(str)) score += 10;
                    break; 
                }
                else if (authNorm.includes(str)) {
                    score += 5; 
                    tokenMatch = true;
                    break;
                }
            }

            if (tokenMatch) matchedTokenCount++;
        });

        if (totalQueryTokens > 0) {
            const matchRatio = matchedTokenCount / totalQueryTokens;
            score += (matchRatio * 100);
        }

        if (titleNorm.includes(normalize(query))) {
            score += 50;
        }

        return { item, score };
    })
    .filter(res => res && res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}