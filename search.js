/**
 * search.js
 * Advanced Concept-Based Search Engine
 */

// ==========================================
// 1. CONCEPT MAPPING (Input -> Concept ID)
// ==========================================
// This locks specific phrases into single concepts to prevent partial matching conflicts.
// Order matters: Longer phrases should generally come first.
const CONCEPT_MAP = {
    // --- MATHEMATICS (AP/Standard) ---
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

    // --- MATHEMATICS (IB) ---
    // Broad "IB Math" search should find everything
    "ib math": "CONCEPT_IB_MATH_BROAD",
    "ib maths": "CONCEPT_IB_MATH_BROAD",
    
    // Specifics
    "aa hl": "CONCEPT_MATH_AA_HL",
    "aahl": "CONCEPT_MATH_AA_HL",
    "aa sl": "CONCEPT_MATH_AA_SL",
    "aasl": "CONCEPT_MATH_AA_SL",
    "ai hl": "CONCEPT_MATH_AI_HL",
    "aihl": "CONCEPT_MATH_AI_HL",
    "ai sl": "CONCEPT_MATH_AI_SL",
    "aisl": "CONCEPT_MATH_AI_SL",
    "math aa": "CONCEPT_MATH_AA_GEN",
    "math ai": "CONCEPT_MATH_AI_GEN",

    // --- ENGLISH / LANGUAGES ---
    "lang lit": "CONCEPT_ENG_LL",
    "lang & lit": "CONCEPT_ENG_LL",
    "lang and lit": "CONCEPT_ENG_LL",
    "l&l": "CONCEPT_ENG_LL",
    "l+l": "CONCEPT_ENG_LL",
    "ll": "CONCEPT_ENG_LL",
    "lit": "CONCEPT_ENG_LIT",
    "ab initio": "CONCEPT_LANG_AB",
    "lang ab": "CONCEPT_LANG_AB", // To distinguish from Calc AB
    
    // --- SCIENCES ---
    "comp sci": "CONCEPT_CS",
    "comp science": "CONCEPT_CS",
    "env sys": "CONCEPT_ESS", // IB ESS
    "env sci": "CONCEPT_APES", // AP ES
    "sports ex": "CONCEPT_SEHS",
    
    // --- HUMANITIES / SOCIAL STUDIES ---
    "us hist": "CONCEPT_USH",
    "u.s. hist": "CONCEPT_USH",
    "euro hist": "CONCEPT_EURO",
    "mod hist": "CONCEPT_MOD_HIST",
    "w hist": "CONCEPT_WHIST",
    "world hist": "CONCEPT_WHIST",
    "human geo": "CONCEPT_HUG",
    "glob pol": "CONCEPT_GLOPO",
    "glo po": "CONCEPT_GLOPO",
    "glopo": "CONCEPT_GLOPO",
    "bus man": "CONCEPT_BUSMAN",
    "comp gov": "CONCEPT_COMPGOV",
    "us gov": "CONCEPT_USGOV",
    
    // --- STANDARDIZED TESTS ---
    "std test": "CONCEPT_TEST_PREP",
    "test prep": "CONCEPT_TEST_PREP"
};

// ==========================================
// 2. EXPANSION DICTIONARY (Word/ID -> Synonyms)
// ==========================================
// When a token is found, we search for ALL of these values in the Title/Author.
const SYNONYMS = {
    // --- CONCEPTS (From Map Above) ---
    "CONCEPT_CALC_AB": ["calculus ab", "ap calc ab", "limit", "derivative", "integral"], 
    "CONCEPT_CALC_BC": ["calculus bc", "ap calc bc", "series", "polar"],
    "CONCEPT_PRECALC": ["precalculus", "pre-calculus", "functions", "trigonometry"],
    "CONCEPT_ALG_1": ["algebra i", "algebra 1", "linear equations"],
    "CONCEPT_ALG_2": ["algebra ii", "algebra 2", "quadratics", "polynomials"],
    "CONCEPT_LIN_ALG": ["linear algebra", "matrices", "vectors"],
    "CONCEPT_DIFF_EQ": ["differential equations", "ode"],
    "CONCEPT_MULTIVAR": ["multivariable calculus", "vector calculus", "calc 3"],

    // IB Math Concepts
    "CONCEPT_IB_MATH_BROAD": ["mathematics", "analysis and approaches", "applications and interpretation", "aa", "ai", "sl", "hl"],
    "CONCEPT_MATH_AA_HL": ["mathematics analysis and approaches higher level", "aa hl", "aahl"],
    "CONCEPT_MATH_AA_SL": ["mathematics analysis and approaches standard level", "aa sl", "aasl"],
    "CONCEPT_MATH_AI_HL": ["mathematics applications and interpretation higher level", "ai hl", "aihl"],
    "CONCEPT_MATH_AI_SL": ["mathematics applications and interpretation standard level", "ai sl", "aisl"],
    "CONCEPT_MATH_AA_GEN": ["analysis and approaches", "math aa"],
    "CONCEPT_MATH_AI_GEN": ["applications and interpretation", "math ai"],

    // Language Concepts
    "CONCEPT_ENG_LL": ["language and literature", "lang lit", "english a"],
    "CONCEPT_ENG_LIT": ["literature", "english a literature"],
    "CONCEPT_LANG_AB": ["ab initio", "spanish ab", "french ab", "german ab", "mandarin ab"],

    // Science Concepts
    "CONCEPT_CS": ["computer science", "csa", "csp", "java", "python", "programming"],
    "CONCEPT_ESS": ["environmental systems and societies", "ess"],
    "CONCEPT_APES": ["environmental science", "apes"],
    "CONCEPT_SEHS": ["sports exercise and health science", "sehs"],
    
    // Humanities Concepts
    "CONCEPT_USH": ["united states history", "apush", "american history", "hoa", "history of the americas"],
    "CONCEPT_EURO": ["european history", "euro"],
    "CONCEPT_WHIST": ["world history", "whap"],
    "CONCEPT_HUG": ["human geography", "aphug"],
    "CONCEPT_GLOPO": ["global politics", "glopo"],
    "CONCEPT_BUSMAN": ["business management", "bm", "business"],
    "CONCEPT_COMPGOV": ["comparative government", "comp gov"],
    "CONCEPT_USGOV": ["united states government", "us government", "gov"],
    
    // --- SINGLE WORD EXPANSIONS (If user types just "Math" or "Bio") ---
    
    // Subjects
    "math": ["maths", "mathematics"],
    "maths": ["math", "mathematics"],
    "bio": ["biology"],
    "chem": ["chemistry"],
    "phys": ["physics"],
    "econ": ["economics", "micro", "macro"],
    "psych": ["psychology"],
    "philo": ["philosophy"],
    "geo": ["geography"],
    "hist": ["history"],
    "eng": ["english"],
    "tok": ["theory of knowledge"],
    "cas": ["creativity activity service"],
    "ee": ["extended essay"],
    "ia": ["internal assessment"],
    "io": ["individual oral"],

    // AP Specifics (Single word triggers)
    "ap": ["advanced placement"],
    "apush": ["united states history", "us history"],
    "whap": ["world history"],
    "aphug": ["human geography"],
    "csa": ["computer science a"],
    "csp": ["computer science principles"],
    "apes": ["environmental science"],
    "sem": ["seminar"],
    "res": ["research"],

    // Tests
    "sat": ["scholastic assessment test", "college board"],
    "act": ["american college testing"],
    "psat": ["preliminary sat", "nmsqt"],
    "lsat": ["law school admission test"],
    "mcat": ["medical college admission test"],
    "toefl": ["test of english"],
    "ielts": ["international english language testing"],

    // Symbols / Connectors
    "&": ["and"],
    "+": ["and", "plus"],
    "vs": ["versus"]
};

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

function normalize(text) {
    if (!text) return "";
    return text.toLowerCase()
        .replace(/&/g, " & ")     // Keep & for phrase mapping first
        .replace(/\+/g, " + ")    // Keep + for phrase mapping first
        .replace(/[:\-\(\)\/\\,.]/g, " ") // Remove hard punctuation
        .replace(/\s+/g, " ")     // Collapse spaces
        .trim();
}

/**
 * Main Search Algorithm
 */
export function searchNotes(items, query, options = {}) {
    const { showAI = true, currentFormat = "all" } = options;
    
    // 1. Prepare Query
    let workingQuery = normalize(query);
    
    // 2. PHASE 1: Concept Locking
    // We replace known phrases with their Concept IDs.
    // e.g. "calc ab" becomes "CONCEPT_CALC_AB"
    // This prevents "ab" from being matched loosely later.
    for (const [phrase, conceptId] of Object.entries(CONCEPT_MAP)) {
        // We use a RegExp with word boundaries so "calc ab" matches but "calc about" doesn't
        // Escape special chars in phrase (like +)
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'g');
        
        if (regex.test(workingQuery)) {
            workingQuery = workingQuery.replace(regex, conceptId);
        } else if (workingQuery.includes(phrase)) {
            // Fallback for symbols that might fail word boundary checks (like l&l)
             workingQuery = workingQuery.split(phrase).join(` ${conceptId} `);
        }
    }

    // 3. Clean up leftover symbols after locking
    workingQuery = workingQuery
        .replace(/&/g, "and")
        .replace(/\+/g, "plus")
        .replace(/\s+/g, " ")
        .trim();

    // 4. Tokenize
    const tokens = workingQuery.split(" ");
    
    // 5. Expand Tokens
    // Each token (word or Concept ID) gets a list of valid strings to look for.
    const searchTargets = [];
    tokens.forEach(t => {
        const set = new Set();
        set.add(t); // Add the token itself (e.g. "biology")
        
        if (SYNONYMS[t]) {
            SYNONYMS[t].forEach(s => set.add(s));
        }
        
        searchTargets.push(Array.from(set));
    });

    // 6. Score Items
    return items.map(item => {
        // Filter Check
        if (!showAI && item.ai) return null;
        if (currentFormat !== "all" && item.fmt !== currentFormat) return null;

        // Prepare Item Text
        const titleNorm = normalize(item.title)
            .replace(/&/g, "and")
            .replace(/\+/g, "plus");
        const authNorm = normalize(item.auth || "");
        
        let score = 0;
        let matchesAllTokens = true;

        // Iterate through every token group in the query
        searchTargets.forEach(targetGroup => {
            // TargetGroup is ["CONCEPT_CALC_AB", "calculus ab", "ap calc ab"] OR ["bio", "biology"]
            
            let tokenMatch = false;
            
            // Check if ANY of the synonyms for this token exist in the title/author
            for (const str of targetGroup) {
                if (titleNorm.includes(str)) {
                    score += 20 + (str.length * 2); // Longer specific matches weigh more
                    tokenMatch = true;
                    // Boost if it's the start of the title
                    if (titleNorm.startsWith(str)) score += 10;
                    break; // Found a match for this token, move to next token
                }
                else if (authNorm.includes(str)) {
                    score += 5;
                    tokenMatch = true;
                    break;
                }
            }

            if (!tokenMatch) matchesAllTokens = false;
        });

        // Penalize / Filter partial concept matches
        // If user typed "Calc AB" (CONCEPT_CALC_AB), and we didn't find "calculus ab" or synonyms,
        // we shouldn't show "Spanish AB" just because of a loose string match.
        // *However*, strict 'matchesAllTokens' can be too harsh for fuzzy search.
        // Strategy: Heavy boost for full match.
        
        if (matchesAllTokens) score += 100;

        // EXACT STRING BONUS (The "Lazy" Check)
        // If the user typed "AA HL" and the title literally contains "AA HL", huge boost.
        if (titleNorm.includes(normalize(query).replace(/&/g, "and"))) {
            score += 50;
        }

        return { item, score };
    })
    .filter(res => res && res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}