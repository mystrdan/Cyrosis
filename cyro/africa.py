AFRICA_TERMS = {"africa", "african", "ghana", "nigeria", "kenya", "rwanda", "uganda", "tanzania", "ethiopia", "south africa", "senegal", "ivory coast", "cote d'ivoire", "cameroon", "zambia", "zimbabwe", "togo", "benin"}

def is_africa_relevant(question: str) -> bool:
    normalized = question.casefold()
    return any(term in normalized for term in AFRICA_TERMS)

def research_scope(question: str) -> str:
    return "Africa-first sources where relevant." if is_africa_relevant(question) else "Use the strongest available sources."
