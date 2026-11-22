# -*- coding: utf-8 -*-
"""
Builds the enhanced (v3) easy-to-understand Arabic grammar & sarf dataset
for Surah Al-'Adiyat (100).

Color & Grammar System (v3 / color_palette: "surah_100"):
  - Ism (Noun) -> RED shades by subclass:
      * singular ('singular'): Crimson Red
      * plural ('plural'): Deep Ruby / Rose-Red (includes singular_ar & singular_en)
      * pronoun ('pronoun'): Warm Coral-Red
      * derived ('derived'): Bright Scarlet Red (verbal nouns, descriptive nouns, time nouns)
  - Verb (Fi'l) -> GREEN shades by tense:
      * past ('past'): Deep Forest Emerald
      * present ('present'): Vibrant Leaf Green
      * future ('future' / 'imperative'): Bright Mint / Teal Green
  - Harf (Particle) -> ROYAL BLUE:
      * standard particles
      * emphasis ('emphasis', emphasis=True): Slow pulsing Royal Blue
  - Idafa (Mudaf / Mudaf Ilayhi):
      * Annotated on possessive / "of" chains (لِرَبِّهِۦ، لِحُبِّ ٱلْخَيْرِ، رَبَّهُم، يَوْمَئِذٍ)
  - Full Verb Conjugation Table (conjugation_table):
      * Past Active, Present Active, Future, Passive Voice ("it was..."), Imperative/Command ("Do! / Amr")

Run:  python3 scripts/build-grammar-surah-100.py
"""
import json
import os
import unicodedata

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT_DIR, 'public', 'data', 'grammar', 'surah_100.json')
VERSES_PATH = os.path.join(ROOT_DIR, 'public', 'data', 'quran-verses.json')


def clusters(text):
    """Split Arabic text into clusters: a base char followed by its combining marks."""
    out = []
    for ch in text:
        if out and unicodedata.category(ch) == 'Mn':
            out[-1] += ch
        else:
            out.append(ch)
    return out


SHADDA = '\u0651'


def canon(text):
    """Canonical mark order used by the Tanzil/Uthmani source: shadda first in each cluster."""
    out = []
    for cl in clusters(text):
        base, marks = cl[0], cl[1:]
        if SHADDA in marks:
            marks = SHADDA + marks.replace(SHADDA, '')
        out.append(base + marks)
    return ''.join(out)


def canon_all(obj):
    if isinstance(obj, str):
        return canon(obj)
    if isinstance(obj, list):
        return [canon_all(x) for x in obj]
    if isinstance(obj, dict):
        return {k: canon_all(v) for k, v in obj.items()}
    return obj


def letters(text, labels):
    cl = clusters(text)
    assert len(cl) == len(labels), f'{text}: {len(cl)} clusters {cl} vs {len(labels)} labels {labels}'
    return [{'t': c, 'r': (None if r == '-' else r)} for c, r in zip(cl, labels)]


def seg(text, category, tag, role, en, desc_en=None,
        subclass=None, tense=None, emphasis=False, voice=None):
    data = {
        'text': text,
        'category': category,
        'tag': tag,
        'role': role,
        'pos_name_en': en,
        'desc_en': desc_en,
    }
    if subclass:
        data['subclass'] = subclass
    if tense:
        data['tense'] = tense
    if emphasis:
        data['emphasis'] = True
    if voice:
        data['voice'] = voice
    return data


AL_QAMARI = lambda: seg(
    'ٱلْ', 'harf', 'DET', 'prefix', 'The (definite article)',
    'Makes the noun specific ("the"). The "l" sound is pronounced clearly.',
    subclass='determiner'
)
AL_SHAMSI = lambda: seg(
    'ٱل', 'harf', 'DET', 'prefix', 'The (definite article)',
    'Makes the noun specific ("the"). The "l" blends into the next letter.',
    subclass='determiner'
)
FA_ATF = lambda desc_en='Means "and then" — shows the next action follows immediately.': seg(
    'فَ', 'harf', 'CONJ', 'prefix', 'And then (connector)', desc_en,
    subclass='conjunction'
)
WAW_ATF = lambda desc_en='Connects this phrase to the previous one ("and").': seg(
    'وَ', 'harf', 'CONJ', 'prefix', 'And (connector)', desc_en,
    subclass='conjunction'
)
LAM_TAWKID = lambda text='لَ': seg(
    text, 'harf', 'EMPH', 'prefix', 'Surely / indeed (emphasis)',
    'Adds a second layer of emphasis ("surely / truly") to the statement.',
    subclass='emphasis', emphasis=True
)


# ---------------------------------------------------------------------------
# Full Verb Conjugation Tables (Past, Present, Future, Passive, Imperative)
# ---------------------------------------------------------------------------

CONJ_ATHARNA = {
    'verb_lemma_ar': 'أَثَارَ',
    'verb_lemma_en': 'to stir up, raise (dust)',
    'root': ['ث', 'و', 'ر'],
    'form': 'Form IV (Causative)',
    'active_occurrence_pronoun': 'هُنَّ',
    'active_occurrence_tense': 'past',
    'rows': [
        {'pronoun_ar': 'هُوَ', 'pronoun_en': 'He', 'past_ar': 'أَثَارَ', 'past_en': 'he stirred up', 'present_ar': 'يُثِيرُ', 'present_en': 'he stirs up', 'future_ar': 'سَيُثِيرُ', 'future_en': 'he will stir up'},
        {'pronoun_ar': 'هِيَ', 'pronoun_en': 'She', 'past_ar': 'أَثَارَتْ', 'past_en': 'she stirred up', 'present_ar': 'تُثِيرُ', 'present_en': 'she stirs up', 'future_ar': 'سَتُثِيرُ', 'future_en': 'she will stir up'},
        {'pronoun_ar': 'هُمْ', 'pronoun_en': 'They (m.)', 'past_ar': 'أَثَارُوا', 'past_en': 'they stirred up', 'present_ar': 'يُثِيرُونَ', 'present_en': 'they stir up', 'future_ar': 'سَيُثِيرُونَ', 'future_en': 'they will stir up'},
        {'pronoun_ar': 'هُنَّ', 'pronoun_en': 'They (f.)', 'past_ar': 'أَثَرْنَ', 'past_en': 'they (f.) stirred up', 'present_ar': 'يُثِرْنَ', 'present_en': 'they (f.) stir up', 'future_ar': 'سَيُثِرْنَ', 'future_en': 'they (f.) will stir up', 'in_ayah': True},
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'past_ar': 'أَثَرْتَ', 'past_en': 'you stirred up', 'present_ar': 'تُثِيرُ', 'present_en': 'you stir up', 'future_ar': 'سَتُثِيرُ', 'future_en': 'you will stir up'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'past_ar': 'أَثَرْتِ', 'past_en': 'you (f.) stirred up', 'present_ar': 'تُثِيرِينَ', 'present_en': 'you (f.) stir up', 'future_ar': 'سَتُثِيرِينَ', 'future_en': 'you (f.) will stir up'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'past_ar': 'أَثَرْتُمْ', 'past_en': 'you all stirred up', 'present_ar': 'تُثِيرُونَ', 'present_en': 'you all stir up', 'future_ar': 'سَتُثِيرُونَ', 'future_en': 'you all will stir up'},
        {'pronoun_ar': 'أَنَا', 'pronoun_en': 'I', 'past_ar': 'أَثَرْتُ', 'past_en': 'I stirred up', 'present_ar': 'أُثِيرُ', 'present_en': 'I stir up', 'future_ar': 'سَأُثِيرُ', 'future_en': 'I will stir up'},
        {'pronoun_ar': 'نَحْنُ', 'pronoun_en': 'We', 'past_ar': 'أَثَرْنَا', 'past_en': 'we stirred up', 'present_ar': 'نُثِيرُ', 'present_en': 'we stir up', 'future_ar': 'سَنُثِيرُ', 'future_en': 'we will stir up'},
    ],
    'passive': [
        {'label_en': 'Past Passive (It / He)', 'ar': 'أُثِيرَ', 'en': 'it was stirred up'},
        {'label_en': 'Past Passive (She / It f.)', 'ar': 'أُثِيرَتْ', 'en': 'it (f.) was stirred up'},
        {'label_en': 'Present Passive (It / He)', 'ar': 'يُثَارُ', 'en': 'it is stirred up'},
        {'label_en': 'Present Passive (She / It f.)', 'ar': 'تُثَارُ', 'en': 'it (f.) is stirred up'},
    ],
    'imperative': [
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'ar': 'أَثِرْ', 'en': 'Stir up!'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'ar': 'أَثِيرِي', 'en': 'Stir up! (f.)'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'ar': 'أَثِيرُوا', 'en': 'Stir up! (all)'},
        {'pronoun_ar': 'لَا تَفْعَلْ', 'pronoun_en': 'Do not…', 'ar': 'لَا تُثِرْ', 'en': 'Do not stir up!'},
    ],
}

CONJ_WASATNA = {
    'verb_lemma_ar': 'وَسَطَ',
    'verb_lemma_en': 'to charge into the center of',
    'root': ['و', 'س', 'ط'],
    'form': 'Form I (Base Verb)',
    'active_occurrence_pronoun': 'هُنَّ',
    'active_occurrence_tense': 'past',
    'rows': [
        {'pronoun_ar': 'هُوَ', 'pronoun_en': 'He', 'past_ar': 'وَسَطَ', 'past_en': 'he cleaved the center', 'present_ar': 'يَسِطُ', 'present_en': 'he cleaves the center', 'future_ar': 'سَيَسِطُ', 'future_en': 'he will cleave the center'},
        {'pronoun_ar': 'هِيَ', 'pronoun_en': 'She', 'past_ar': 'وَسَطَتْ', 'past_en': 'she cleaved the center', 'present_ar': 'تَسِطُ', 'present_en': 'she cleaves the center', 'future_ar': 'سَتَسِطُ', 'future_en': 'she will cleave the center'},
        {'pronoun_ar': 'هُمْ', 'pronoun_en': 'They (m.)', 'past_ar': 'وَسَطُوا', 'past_en': 'they cleaved the center', 'present_ar': 'يَسِطُونَ', 'present_en': 'they cleave the center', 'future_ar': 'سَيَسِطُونَ', 'future_en': 'they will cleave the center'},
        {'pronoun_ar': 'هُنَّ', 'pronoun_en': 'They (f.)', 'past_ar': 'وَسَطْنَ', 'past_en': 'they (f.) cleaved the center', 'present_ar': 'يَسِطْنَ', 'present_en': 'they (f.) cleave the center', 'future_ar': 'سَيَسِطْنَ', 'future_en': 'they (f.) will cleave the center', 'in_ayah': True},
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'past_ar': 'وَسَطْتَ', 'past_en': 'you cleaved the center', 'present_ar': 'تَسِطُ', 'present_en': 'you cleave the center', 'future_ar': 'سَتَسِطُ', 'future_en': 'you will cleave the center'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'past_ar': 'وَسَطْتِ', 'past_en': 'you (f.) cleaved the center', 'present_ar': 'تَسِطِينَ', 'present_en': 'you (f.) cleave the center', 'future_ar': 'سَتَسِطِينَ', 'future_en': 'you (f.) will cleave the center'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'past_ar': 'وَسَطْتُمْ', 'past_en': 'you all cleaved the center', 'present_ar': 'تَسِطُونَ', 'present_en': 'you all cleave the center', 'future_ar': 'سَتَسِطُونَ', 'future_en': 'you all will cleave the center'},
        {'pronoun_ar': 'أَنَا', 'pronoun_en': 'I', 'past_ar': 'وَسَطْتُ', 'past_en': 'I cleaved the center', 'present_ar': 'أَسِطُ', 'present_en': 'I cleave the center', 'future_ar': 'سَأَسِطُ', 'future_en': 'I will cleave the center'},
        {'pronoun_ar': 'نَحْنُ', 'pronoun_en': 'We', 'past_ar': 'وَسَطْنَا', 'past_en': 'we cleaved the center', 'present_ar': 'نَسِطُ', 'present_en': 'we cleave the center', 'future_ar': 'سَنَسِطُ', 'future_en': 'we will cleave the center'},
    ],
    'passive': [
        {'label_en': 'Past Passive (It / He)', 'ar': 'وُسِطَ', 'en': 'its center was penetrated'},
        {'label_en': 'Past Passive (She / It f.)', 'ar': 'وُسِطَتْ', 'en': 'its (f.) center was penetrated'},
        {'label_en': 'Present Passive (It / He)', 'ar': 'يُوسَطُ', 'en': 'its center is penetrated'},
        {'label_en': 'Present Passive (She / It f.)', 'ar': 'تُوسَطُ', 'en': 'its (f.) center is penetrated'},
    ],
    'imperative': [
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'ar': 'سِطْ', 'en': 'Penetrate the center!'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'ar': 'سِطِي', 'en': 'Penetrate the center! (f.)'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'ar': 'سِطُوا', 'en': 'Penetrate the center! (all)'},
        {'pronoun_ar': 'لَا تَفْعَلْ', 'pronoun_en': 'Do not…', 'ar': 'لَا تَسِطْ', 'en': 'Do not penetrate!'},
    ],
}

CONJ_YALAMU = {
    'verb_lemma_ar': 'عَلِمَ',
    'verb_lemma_en': 'to know with certainty',
    'root': ['ع', 'ل', 'م'],
    'form': 'Form I (Base Verb)',
    'active_occurrence_pronoun': 'هُوَ',
    'active_occurrence_tense': 'present',
    'rows': [
        {'pronoun_ar': 'هُوَ', 'pronoun_en': 'He', 'past_ar': 'عَلِمَ', 'past_en': 'he knew', 'present_ar': 'يَعْلَمُ', 'present_en': 'he knows', 'future_ar': 'سَيَعْلَمُ', 'future_en': 'he will know', 'in_ayah': True},
        {'pronoun_ar': 'هِيَ', 'pronoun_en': 'She', 'past_ar': 'عَلِمَتْ', 'past_en': 'she knew', 'present_ar': 'تَعْلَمُ', 'present_en': 'she knows', 'future_ar': 'سَتَعْلَمُ', 'future_en': 'she will know'},
        {'pronoun_ar': 'هُمْ', 'pronoun_en': 'They (m.)', 'past_ar': 'عَلِمُوا', 'past_en': 'they knew', 'present_ar': 'يَعْلَمُونَ', 'present_en': 'they know', 'future_ar': 'سَيَعْلَمُونَ', 'future_en': 'they will know'},
        {'pronoun_ar': 'هُنَّ', 'pronoun_en': 'They (f.)', 'past_ar': 'عَلِمْنَ', 'past_en': 'they (f.) knew', 'present_ar': 'يَعْلَمْنَ', 'present_en': 'they (f.) know', 'future_ar': 'سَيَعْلَمْنَ', 'future_en': 'they (f.) will know'},
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'past_ar': 'عَلِمْتَ', 'past_en': 'you knew', 'present_ar': 'تَعْلَمُ', 'present_en': 'you know', 'future_ar': 'سَتَعْلَمُ', 'future_en': 'you will know'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'past_ar': 'عَلِمْتِ', 'past_en': 'you (f.) knew', 'present_ar': 'تَعْلَمِينَ', 'present_en': 'you (f.) know', 'future_ar': 'سَتَعْلَمِينَ', 'future_en': 'you (f.) will know'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'past_ar': 'عَلِمْتُمْ', 'past_en': 'you all knew', 'present_ar': 'تَعْلَمُونَ', 'present_en': 'you all know', 'future_ar': 'سَتَعْلَمُونَ', 'future_en': 'you all will know'},
        {'pronoun_ar': 'أَنَا', 'pronoun_en': 'I', 'past_ar': 'عَلِمْتُ', 'past_en': 'I knew', 'present_ar': 'أَعْلَمُ', 'present_en': 'I know', 'future_ar': 'سَأَعْلَمُ', 'future_en': 'I will know'},
        {'pronoun_ar': 'نَحْنُ', 'pronoun_en': 'We', 'past_ar': 'عَلِمْنَا', 'past_en': 'we knew', 'present_ar': 'نَعْلَمُ', 'present_en': 'we know', 'future_ar': 'سَنَعْلَمُ', 'future_en': 'we will know'},
    ],
    'passive': [
        {'label_en': 'Past Passive (It / He)', 'ar': 'عُلِمَ', 'en': 'it was known'},
        {'label_en': 'Past Passive (She / It f.)', 'ar': 'عُلِمَتْ', 'en': 'it (f.) was known'},
        {'label_en': 'Present Passive (It / He)', 'ar': 'يُعْلَمُ', 'en': 'it is known'},
        {'label_en': 'Present Passive (She / It f.)', 'ar': 'تُعْلَمُ', 'en': 'it (f.) is known'},
    ],
    'imperative': [
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'ar': 'ٱعْلَمْ', 'en': 'Know!'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'ar': 'ٱعْلَمِي', 'en': 'Know! (f.)'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'ar': 'ٱعْلَمُوا', 'en': 'Know! (all)'},
        {'pronoun_ar': 'لَا تَفْعَلْ', 'pronoun_en': 'Do not…', 'ar': 'لَا تَعْلَمْ', 'en': 'Do not know / disregard'},
    ],
}

CONJ_BUTHIRA = {
    'verb_lemma_ar': 'بَعْثَرَ',
    'verb_lemma_en': 'to overturn, scatter out',
    'root': ['ب', 'ع', 'ث', 'ر'],
    'form': '4-Letter Root Verb (Quadriliteral)',
    'active_occurrence_pronoun': 'Passive',
    'active_occurrence_tense': 'passive_past',
    'rows': [
        {'pronoun_ar': 'هُوَ', 'pronoun_en': 'He', 'past_ar': 'بَعْثَرَ', 'past_en': 'he overturned / scattered', 'present_ar': 'يُبَعْثِرُ', 'present_en': 'he overturns', 'future_ar': 'سَيُبَعْثِرُ', 'future_en': 'he will overturn'},
        {'pronoun_ar': 'هِيَ', 'pronoun_en': 'She', 'past_ar': 'بَعْثَرَتْ', 'past_en': 'she overturned / scattered', 'present_ar': 'تُبَعْثِرُ', 'present_en': 'she overturns', 'future_ar': 'سَتُبَعْثِرُ', 'future_en': 'she will overturn'},
        {'pronoun_ar': 'هُمْ', 'pronoun_en': 'They (m.)', 'past_ar': 'بَعْثَرُوا', 'past_en': 'they overturned', 'present_ar': 'يُبَعْثِرُونَ', 'present_en': 'they overturn', 'future_ar': 'سَيُبَعْثِرُونَ', 'future_en': 'they will overturn'},
        {'pronoun_ar': 'هُنَّ', 'pronoun_en': 'They (f.)', 'past_ar': 'بَعْثَرْنَ', 'past_en': 'they (f.) overturned', 'present_ar': 'يُبَعْثِرْنَ', 'present_en': 'they (f.) overturn', 'future_ar': 'سَيُبَعْثِرْنَ', 'future_en': 'they (f.) will overturn'},
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'past_ar': 'بَعْثَرْتَ', 'past_en': 'you overturned', 'present_ar': 'تُبَعْثِرُ', 'present_en': 'you overturn', 'future_ar': 'سَتُبَعْثِرُ', 'future_en': 'you will overturn'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'past_ar': 'بَعْثَرْتِ', 'past_en': 'you (f.) overturned', 'present_ar': 'تُبَعْثِرِينَ', 'present_en': 'you (f.) overturn', 'future_ar': 'سَتُبَعْثِرِينَ', 'future_en': 'you (f.) will overturn'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'past_ar': 'بَعْثَرْتُمْ', 'past_en': 'you all overturned', 'present_ar': 'تُبَعْثِرُونَ', 'present_en': 'you all overturn', 'future_ar': 'سَتُبَعْثِرُونَ', 'future_en': 'you all will overturn'},
        {'pronoun_ar': 'أَنَا', 'pronoun_en': 'I', 'past_ar': 'بَعْثَرْتُ', 'past_en': 'I overturned', 'present_ar': 'أُبَعْثِرُ', 'present_en': 'I overturn', 'future_ar': 'سَأُبَعْثِرُ', 'future_en': 'I will overturn'},
        {'pronoun_ar': 'نَحْنُ', 'pronoun_en': 'We', 'past_ar': 'بَعْثَرْنَا', 'past_en': 'we overturned / scattered', 'present_ar': 'نُبَعْثِرُ', 'present_en': 'we overturn', 'future_ar': 'سَنُبَعْثِرُ', 'future_en': 'we will overturn'},
    ],
    'passive': [
        {'label_en': 'Past Passive (It / He) — In this Ayah', 'ar': 'بُعْثِرَ', 'en': 'it was overturned / scattered out', 'in_ayah': True},
        {'label_en': 'Past Passive (She / It f.)', 'ar': 'بُعْثِرَتْ', 'en': 'it (f.) was overturned / scattered out'},
        {'label_en': 'Present Passive (It / He)', 'ar': 'يُبَعْثَرُ', 'en': 'it is overturned / scattered out'},
        {'label_en': 'Present Passive (She / It f.)', 'ar': 'تُبَعْثَرُ', 'en': 'it (f.) is overturned / scattered out'},
    ],
    'imperative': [
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'ar': 'بَعْثِرْ', 'en': 'Overturn / scatter!'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'ar': 'بَعْثِرِي', 'en': 'Overturn / scatter! (f.)'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'ar': 'بَعْثِرُوا', 'en': 'Overturn / scatter! (all)'},
        {'pronoun_ar': 'لَا تَفْعَلْ', 'pronoun_en': 'Do not…', 'ar': 'لَا تُبَعْثِرْ', 'en': 'Do not overturn / scatter!'},
    ],
}

CONJ_HUSSILA = {
    'verb_lemma_ar': 'حَصَّلَ',
    'verb_lemma_en': 'to extract, bring out the core',
    'root': ['ح', 'ص', 'ل'],
    'form': 'Form II (Intensive)',
    'active_occurrence_pronoun': 'Passive',
    'active_occurrence_tense': 'passive_past',
    'rows': [
        {'pronoun_ar': 'هُوَ', 'pronoun_en': 'He', 'past_ar': 'حَصَّلَ', 'past_en': 'he extracted / brought out', 'present_ar': 'يُحَصِّلُ', 'present_en': 'he extracts', 'future_ar': 'سَيُحَصِّلُ', 'future_en': 'he will extract'},
        {'pronoun_ar': 'هِيَ', 'pronoun_en': 'She', 'past_ar': 'حَصَّلَتْ', 'past_en': 'she extracted / brought out', 'present_ar': 'تُحَصِّلُ', 'present_en': 'she extracts', 'future_ar': 'سَتُحَصِّلُ', 'future_en': 'she will extract'},
        {'pronoun_ar': 'هُمْ', 'pronoun_en': 'They (m.)', 'past_ar': 'حَصَّلُوا', 'past_en': 'they extracted', 'present_ar': 'يُحَصِّلُونَ', 'present_en': 'they extract', 'future_ar': 'سَيُحَصِّلُونَ', 'future_en': 'they will extract'},
        {'pronoun_ar': 'هُنَّ', 'pronoun_en': 'They (f.)', 'past_ar': 'حَصَّلْنَ', 'past_en': 'they (f.) extracted', 'present_ar': 'يُحَصِّلْنَ', 'present_en': 'they (f.) extract', 'future_ar': 'سَيُحَصِّلْنَ', 'future_en': 'they (f.) will extract'},
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'past_ar': 'حَصَّلْتَ', 'past_en': 'you extracted', 'present_ar': 'تُحَصِّلُ', 'present_en': 'you extract', 'future_ar': 'سَتُحَصِّلُ', 'future_en': 'you will extract'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'past_ar': 'حَصَّلْتِ', 'past_en': 'you (f.) extracted', 'present_ar': 'تُحَصِّلِينَ', 'present_en': 'you (f.) extract', 'future_ar': 'سَتُحَصِّلِينَ', 'future_en': 'you (f.) will extract'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'past_ar': 'حَصَّلْتُمْ', 'past_en': 'you all extracted', 'present_ar': 'تُحَصِّلُونَ', 'present_en': 'you all extract', 'future_ar': 'سَتُحَصِّلُونَ', 'future_en': 'you all will extract'},
        {'pronoun_ar': 'أَنَا', 'pronoun_en': 'I', 'past_ar': 'حَصَّلْتُ', 'past_en': 'I extracted', 'present_ar': 'أُحَصِّلُ', 'present_en': 'I extract', 'future_ar': 'سَأُحَصِّلُ', 'future_en': 'I will extract'},
        {'pronoun_ar': 'نَحْنُ', 'pronoun_en': 'We', 'past_ar': 'حَصَّلْنَا', 'past_en': 'we extracted / brought out', 'present_ar': 'نُحَصِّلُ', 'present_en': 'we extract', 'future_ar': 'سَنُحَصِّلُ', 'future_en': 'we will extract'},
    ],
    'passive': [
        {'label_en': 'Past Passive (It / He) — In this Ayah', 'ar': 'حُصِّلَ', 'en': 'it was extracted / made distinct', 'in_ayah': True},
        {'label_en': 'Past Passive (She / It f.)', 'ar': 'حُصِّلَتْ', 'en': 'it (f.) was extracted / made distinct'},
        {'label_en': 'Present Passive (It / He)', 'ar': 'يُحَصَّلُ', 'en': 'it is extracted / made distinct'},
        {'label_en': 'Present Passive (She / It f.)', 'ar': 'تُحَصَّلُ', 'en': 'it (f.) is extracted / made distinct'},
    ],
    'imperative': [
        {'pronoun_ar': 'أَنتَ', 'pronoun_en': 'You (m. sg.)', 'ar': 'حَصِّلْ', 'en': 'Extract / distinguish!'},
        {'pronoun_ar': 'أَنتِ', 'pronoun_en': 'You (f. sg.)', 'ar': 'حَصِّلِي', 'en': 'Extract / distinguish! (f.)'},
        {'pronoun_ar': 'أَنتُمْ', 'pronoun_en': 'You (all)', 'ar': 'حَصِّلُوا', 'en': 'Extract / distinguish! (all)'},
        {'pronoun_ar': 'لَا تَفْعَلْ', 'pronoun_en': 'Do not…', 'ar': 'لَا تُحَصِّلْ', 'en': 'Do not extract!'},
    ],
}


# ---------------------------------------------------------------------------
# Surah Al-'Adiyat (100) — All 11 Ayahs, 40 Words (Easy-to-understand English)
# ---------------------------------------------------------------------------

AYAHS = {
    1: {
        'structure_en': 'Opening oath: "By" (oath particle) + "the racing horses" (plural noun) + "panting" (how they run).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'وَٱلْعَـٰدِيَـٰتِ',
                'translation': 'By the racers',
                'transliteration': 'wal-ʿādiyāti',
                'primary_category': 'ism',
                'subclass': 'plural',
                'has_emphasis': True,
                'role_en': 'The sworn-by plural noun after "By…" (oath)',
                'segments': [
                    seg('وَ', 'harf', 'P', 'prefix', 'By… (oath particle)',
                        'Starts a solemn oath to emphasize the message coming in Ayah 6.',
                        subclass='emphasis', emphasis=True),
                    AL_QAMARI(),
                    seg('عَـٰدِيَـٰتِ', 'ism', 'N', 'stem', 'Plural Noun (charging horses)',
                        'Feminine plural noun (singular: عَادِيَة — one charging horse).',
                        subclass='plural'),
                ],
                'sarf': {
                    'root': ['ع', 'د', 'و'],
                    'root_meaning': 'to run swiftly, gallop, charge forward',
                    'root_type_en': 'Weak 3rd letter (ends in wāw)',
                    'wazn': 'فَاعِلَات',
                    'wazn_original': 'عَادِوَات',
                    'stem_letters': letters('عَـٰدِيَـٰتِ', ['f', '-', 'a', 'l', '-', '-']),
                    'wazn_letters': letters('فَاعِلَاتِ', ['f', '-', 'a', 'l', '-', '-']),
                    'word_type_en': 'Plural noun (doer of the action: "ones who run")',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Feminine',
                        'number_en': 'Plural (feminine -āt ending)',
                        'singular_ar': 'عَادِيَة',
                        'singular_en': 'a charging horse',
                        'definiteness_en': 'Definite ("the")',
                        'case_en': 'Ends in -i (genitive after the oath "By")',
                        'subclass_en': 'Plural Noun',
                    },
                    'transformation': {
                        'type_en': 'Sound shift (w → y)',
                        'en': 'Originally ʿādiwāt from root ع-د-و: the "w" turned into "y" because it comes right after an "i" sound, making it smoother to pronounce (ʿādiyāt).',
                    },
                    'family': [
                        {'ar': 'فَمَنِ ٱعْتَدَىٰ', 'en': 'whoever crosses the limit', 'ref': '2:178'},
                        {'ar': 'وَلَا تَعْدُ عَيْنَاكَ', 'en': 'let not your eyes pass beyond', 'ref': '18:28'},
                        {'ar': 'عَدُوٌّ', 'en': 'an enemy (one who charges against)', 'ref': '2:36'},
                    ],
                },
                'irab': {
                    'en': 'Starts with وَ ("By…"), an oath particle that makes the noun after it end in an "-i" sound (genitive). The plural noun means "the galloping warhorses."',
                },
                'insight': {
                    'title_en': 'An oath by horses loyal to their master',
                    'en': 'The sūrah opens with a vivid oath by warhorses galloping at full speed for the rider who feeds and trains them — setting up a sharp contrast with human beings in Ayah 6, who receive infinitely more from their Lord yet remain ungrateful.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'ضَبْحًا',
                'translation': 'panting',
                'transliteration': 'ḍabḥan',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Describes how the horses are running',
                'segments': [
                    seg('ضَبْحًا', 'ism', 'N', 'stem', 'Action Noun (panting)',
                        'Names the heavy panting sound coming from a horse\'s chest as it runs.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ض', 'ب', 'ح'],
                    'root_meaning': 'to pant heavily from the chest while galloping',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعْلًا',
                    'stem_letters': letters('ضَبْحًا', ['f', 'a', 'l', '-']),
                    'wazn_letters': letters('فَعْلًا', ['f', 'a', 'l', '-']),
                    'word_type_en': 'Verbal noun (names an action/sound)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("a / -an")',
                        'case_en': 'Ends in -an (describes the manner of running)',
                        'subclass_en': 'Derived / Action Noun',
                    },
                    'family': [],
                },
                'irab': {
                    'en': 'Ends in "-an" (accusative) because it describes the manner of the horses\' running ("running while panting heavily").',
                },
                'insight': {
                    'title_en': 'A sound heard only at maximum effort',
                    'en': 'Ḍabḥ is neither neighing nor calm breathing — Arabic uses it specifically for the rhythmic heave of a horse\'s chest when it gives every ounce of energy in the charge.',
                },
            },
        ],
    },
    2: {
        'structure_en': 'Second oath stage: "And then" + "the spark-strikers" (plural noun) + "striking" (the forceful impact).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'فَٱلْمُورِيَـٰتِ',
                'translation': 'And the producers of sparks',
                'transliteration': 'fal-mūriyāti',
                'primary_category': 'ism',
                'subclass': 'plural',
                'role_en': 'Second sworn-by plural noun in the oath',
                'segments': [
                    FA_ATF(),
                    AL_QAMARI(),
                    seg('مُورِيَـٰتِ', 'ism', 'N', 'stem', 'Plural Noun (spark-strikers)',
                        'Feminine plural noun (singular: مُورِيَة — one horse striking sparks).',
                        subclass='plural'),
                ],
                'sarf': {
                    'root': ['و', 'ر', 'ي'],
                    'root_meaning': 'to kindle fire, strike sparks from stone',
                    'root_type_en': 'Two weak letters (1st letter wāw, 3rd letter yāʾ)',
                    'wazn': 'مُفْعِلَات',
                    'stem_letters': letters('مُورِيَـٰتِ', ['-', 'f', 'a', 'l', '-', '-']),
                    'wazn_letters': letters('مُفْعِلَاتِ', ['-', 'f', 'a', 'l', '-', '-']),
                    'word_type_en': 'Plural noun (doer of the action: "ones who ignite sparks")',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Feminine',
                        'number_en': 'Plural (feminine -āt ending)',
                        'singular_ar': 'مُورِيَة',
                        'singular_en': 'a spark-striking horse',
                        'definiteness_en': 'Definite ("the")',
                        'case_en': 'Ends in -i (connected to the oath in Ayah 1)',
                        'subclass_en': 'Plural Noun',
                    },
                    'transformation': {
                        'type_en': 'Long vowel smoothing',
                        'en': 'The prefix "mū-" makes the 1st root letter (wāw) stretch into a long "ū" sound: mūriyāt.',
                    },
                    'family': [
                        {'ar': 'ٱلنَّارَ ٱلَّتِى تُورُونَ', 'en': 'the fire which you kindle', 'ref': '56:71'},
                        {'ar': 'يُوَٰرِى سَوْءَةَ أَخِيهِ', 'en': 'to hide the body of his brother', 'ref': '5:31'},
                    ],
                },
                'irab': {
                    'en': 'Connected by فَ ("and then") to "the racers" in Ayah 1, so it also ends in "-i" (genitive) as the second part of the oath.',
                },
                'insight': {
                    'title_en': 'Sparks flying in the pre-dawn dark',
                    'en': 'First you hear their chests panting (Ayah 1); next you see bright sparks flashing under their hooves as they strike rocky ground in the dark before sunrise (Ayah 2).',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'قَدْحًا',
                'translation': 'striking',
                'transliteration': 'qadḥan',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Describes the forceful striking of sparks',
                'segments': [
                    seg('قَدْحًا', 'ism', 'N', 'stem', 'Action Noun (striking)',
                        'Names the forceful strike of hooves hitting rock to spark fire.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ق', 'د', 'ح'],
                    'root_meaning': 'to strike flint or stone to make sparks',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعْلًا',
                    'stem_letters': letters('قَدْحًا', ['f', 'a', 'l', '-']),
                    'wazn_letters': letters('فَعْلًا', ['f', 'a', 'l', '-']),
                    'word_type_en': 'Verbal noun (emphasizes the action)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("-an")',
                        'case_en': 'Ends in -an (reinforces the action)',
                        'subclass_en': 'Derived / Action Noun',
                    },
                    'family': [],
                },
                'irab': {
                    'en': 'Ends in "-an" (accusative) to emphasize the forceful action of striking sparks off stone.',
                },
                'insight': {
                    'title_en': 'Adding physical impact to the flash of fire',
                    'en': 'Pairing "spark-strikers" with qadḥan lets you both see the spark and hear the crack of hoof against stone.',
                },
            },
        ],
    },
    3: {
        'structure_en': 'Third oath stage: "And then" + "the raiders" (plural noun) + "at dawn" (when the raid happens).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'فَٱلْمُغِيرَٰتِ',
                'translation': 'And the chargers',
                'transliteration': 'fal-mughīrāti',
                'primary_category': 'ism',
                'subclass': 'plural',
                'role_en': 'Third sworn-by plural noun in the oath',
                'segments': [
                    FA_ATF(),
                    AL_QAMARI(),
                    seg('مُغِيرَٰتِ', 'ism', 'N', 'stem', 'Plural Noun (raiding horses)',
                        'Feminine plural noun (singular: مُغِيرَة — one raiding horse).',
                        subclass='plural'),
                ],
                'sarf': {
                    'root': ['غ', 'و', 'ر'],
                    'root_meaning': 'to sweep down in a swift raid; a deep hollow or cave',
                    'root_type_en': 'Weak middle letter (wāw)',
                    'wazn': 'مُفْعِلَات',
                    'wazn_original': 'مُغْوِرَات',
                    'stem_letters': letters('مُغِيرَٰتِ', ['-', 'f', 'a', 'l', '-']),
                    'wazn_letters': letters('مُفْعِلَٰتِ', ['-', 'f', 'a', 'l', '-']),
                    'word_type_en': 'Plural noun (doer of the action: "ones who raid")',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Feminine',
                        'number_en': 'Plural (feminine -āt ending)',
                        'singular_ar': 'مُغِيرَة',
                        'singular_en': 'a raiding horse',
                        'definiteness_en': 'Definite ("the")',
                        'case_en': 'Ends in -i (connected to the oath in Ayah 1)',
                        'subclass_en': 'Plural Noun',
                    },
                    'transformation': {
                        'type_en': 'Sound shift (w → ī)',
                        'en': 'Originally mughwirāt: the "i" vowel moved onto the letter before it and the middle "w" became a long "ī" — making mughīrāt smooth to say.',
                    },
                    'family': [
                        {'ar': 'إِذْ هُمَا فِى ٱلْغَارِ', 'en': 'when the two of them were in the cave', 'ref': '9:40'},
                        {'ar': 'أَوْ مُغَارَٰتٍ', 'en': 'or caves', 'ref': '9:57'},
                        {'ar': 'مَآؤُكُمْ غَوْرًا', 'en': 'your water sunken deep underground', 'ref': '67:30'},
                    ],
                },
                'irab': {
                    'en': 'Connected by فَ ("and then") to the oath, so it ends in "-i" (genitive) as the third sworn-by plural noun.',
                },
                'insight': {
                    'title_en': 'From night ride to dawn arrival',
                    'en': 'Follow the timeline linked by "and then" (fa-): galloping through the night (Ayah 1) → hooves sparking in the dark (Ayah 2) → launching the raid right at dawn (Ayah 3).',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'صُبْحًا',
                'translation': '(at) dawn',
                'transliteration': 'ṣubḥan',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Time word ("at dawn")',
                'segments': [
                    seg('صُبْحًا', 'ism', 'N', 'stem', 'Time Noun ("at dawn")',
                        'Tells when the raid happens — at first morning light.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ص', 'ب', 'ح'],
                    'root_meaning': 'dawn, morning light',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فُعْلًا',
                    'stem_letters': letters('صُبْحًا', ['f', 'a', 'l', '-']),
                    'wazn_letters': letters('فُعْلًا', ['f', 'a', 'l', '-']),
                    'word_type_en': 'Time noun (answers "when?")',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("-an")',
                        'case_en': 'Ends in -an (time expression: "at dawn")',
                        'subclass_en': 'Derived / Time Noun',
                    },
                    'family': [
                        {'ar': 'وَٱلصُّبْحِ إِذَا تَنَفَّسَ', 'en': 'and by the dawn when it breathes', 'ref': '81:18'},
                        {'ar': 'فَالِقُ ٱلْإِصْبَاحِ', 'en': 'Cleaver of daybreak', 'ref': '6:96'},
                        {'ar': 'مِصْبَاحٌ', 'en': 'a lamp', 'ref': '24:35'},
                    ],
                },
                'irab': {
                    'en': 'Ends in "-an" (accusative) because in Arabic, time words answering "when?" take an "-an" ending ("at dawn").',
                },
                'insight': {
                    'title_en': 'Same rhyme, new role',
                    'en': 'Ayahs 1 and 2 used "-an" words to describe how the horses moved; Ayah 3 keeps the exact same rhythm while telling you when the raid strikes — at dawn.',
                },
            },
        ],
    },
    4: {
        'structure_en': 'Action shifts to a past verb: "Then they stirred up" + "thereby" + "dust" (direct object).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'فَأَثَرْنَ',
                'translation': 'Then raise',
                'transliteration': 'fa-atharna',
                'primary_category': 'fil',
                'tense': 'past',
                'voice': 'active',
                'role_en': 'Past active verb + "they (f.)" subject ending',
                'segments': [
                    FA_ATF(),
                    seg('أَثَرْ', 'fil', 'V', 'stem', 'Past Verb (stirred up)',
                        'Past tense verb meaning "stirred up / kicked up" (Form IV).',
                        tense='past', voice='active'),
                    seg('نَ', 'ism', 'PRON', 'suffix', 'Pronoun: "they (f.)"',
                        'Attached ending meaning "they (feminine)" — referring to the horses.',
                        subclass='pronoun'),
                ],
                'sarf': {
                    'root': ['ث', 'و', 'ر'],
                    'root_meaning': 'to stir up, rise and billow (dust or clouds)',
                    'root_type_en': 'Weak middle letter (wāw)',
                    'wazn': 'أَفَلْنَ',
                    'wazn_original': 'أَفْعَلْنَ',
                    'stem_letters': letters('أَثَرْ', ['-', 'f', 'l']),
                    'wazn_letters': letters('أَفَلْ', ['-', 'f', 'l']),
                    'deleted_radicals': ['a'],
                    'word_type_en': 'Past active verb (Form IV — causative)',
                    'verb': {
                        'form': 'IV',
                        'pattern': 'أَثَارَ – يُثِيرُ',
                        'meaning_of_form_en': 'Causative — causing dust to rise into the air',
                        'tense_en': 'Past (completed action)',
                        'person_en': 'They (feminine plural)',
                        'voice_en': 'Active voice',
                        'conjugation': [
                            {'label_en': 'Past (he)', 'ar': 'أَثَارَ'},
                            {'label_en': 'Present (he)', 'ar': 'يُثِيرُ'},
                            {'label_en': 'Command', 'ar': 'أَثِرْ'},
                            {'label_en': 'Action noun', 'ar': 'إِثَارَة'},
                            {'label_en': 'Doer', 'ar': 'مُثِير'},
                        ],
                        'conjugation_table': CONJ_ATHARNA,
                    },
                    'noun': None,
                    'transformation': {
                        'type_en': 'Shortened middle vowel',
                        'en': 'The base past verb is athāra ("he stirred up"). When the "-na" ("they f.") ending attaches, the long "ā" shortens and drops so it is easy to pronounce: atharna.',
                    },
                    'family': [
                        {'ar': 'فَتُثِيرُ سَحَابًا', 'en': 'and they stir up clouds', 'ref': '30:48'},
                        {'ar': 'وَأَثَارُوا۟ ٱلْأَرْضَ', 'en': 'and they plowed up the earth', 'ref': '30:9'},
                        {'ar': 'تُثِيرُ ٱلْأَرْضَ', 'en': 'plowing the ground', 'ref': '2:71'},
                    ],
                },
                'irab': {
                    'en': 'Past active verb ("stirred up") with the attached ending نَ ("they [feminine]") as the subject doing the action.',
                },
                'insight': {
                    'title_en': 'Why switch from nouns to verbs in Ayah 4?',
                    'en': 'Ayahs 1–3 used descriptive nouns to paint the horses\' enduring qualities; Ayahs 4–5 switch to crisp past verbs ("stirred up", "penetrated") to capture the sudden burst of action.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'بِهِۦ',
                'translation': 'thereby',
                'transliteration': 'bihi',
                'primary_category': 'harf',
                'role_en': 'Preposition "by / in" + pronoun "it"',
                'segments': [
                    seg('بِ', 'harf', 'P', 'prefix', 'By / with (preposition)',
                        'Connects the verb to the means or place ("by that gallop / in that place").',
                        subclass='preposition'),
                    seg('هِۦ', 'ism', 'PRON', 'stem', 'Pronoun: "it"',
                        'Attached pronoun meaning "it" (referring to the gallop or the dawn raid).',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Made of a preposition (bi- "by") and a pronoun (-hi "it"). Neither changes by a 3-letter root pattern.',
                'irab': {
                    'en': 'Preposition بِ ("by / in") joined to the pronoun هِۦ ("it"), linking the dust directly to the horses\' charge.',
                },
                'insight': {
                    'title_en': 'What does "thereby" (bihi) refer to?',
                    'en': 'Commentators note two vivid meanings: "by means of that gallop" or "in that dawn time/place" — both show the dust cloud rising instantly from the charge.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'نَقْعًا',
                'translation': 'dust',
                'transliteration': 'naqʿan',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Direct object (what the horses stirred up)',
                'segments': [
                    seg('نَقْعًا', 'ism', 'N', 'stem', 'Noun (billowing dust)',
                        'Thick battle-dust kicked up into the air by hooves.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ن', 'ق', 'ع'],
                    'root_meaning': 'billowing dust raised by hooves',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعْلًا',
                    'stem_letters': letters('نَقْعًا', ['f', 'a', 'l', '-']),
                    'wazn_letters': letters('فَعْلًا', ['f', 'a', 'l', '-']),
                    'word_type_en': 'Noun (direct object)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular (mass noun)',
                        'definiteness_en': 'Indefinite ("a cloud of dust")',
                        'case_en': 'Ends in -an (direct object of "stirred up")',
                        'subclass_en': 'Derived Noun',
                    },
                    'family': [],
                },
                'irab': {
                    'en': 'Direct object of "stirred up", so it ends in "-an" (accusative) — answering "what did they stir up? Dust."',
                },
                'insight': {
                    'title_en': 'A curtain of dust filling the horizon',
                    'en': 'Here the "-an" word becomes the direct object: the horses\' charge physically raises a wall of dust before they plunge into the center of the ranks.',
                },
            },
        ],
    },
    5: {
        'structure_en': 'Climax of the oath scene: "Then they plunged into the middle" + "thereby" + "a crowd/host" (direct object).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'فَوَسَطْنَ',
                'translation': 'Then penetrate [into the center]',
                'transliteration': 'fawasaṭna',
                'primary_category': 'fil',
                'tense': 'past',
                'voice': 'active',
                'role_en': 'Past active verb + "they (f.)" subject ending',
                'segments': [
                    FA_ATF(),
                    seg('وَسَطْ', 'fil', 'V', 'stem', 'Past Verb (penetrated the center)',
                        'Past tense verb meaning "cleaved right into the middle of."',
                        tense='past', voice='active'),
                    seg('نَ', 'ism', 'PRON', 'suffix', 'Pronoun: "they (f.)"',
                        'Attached ending meaning "they (feminine)" — the horses.',
                        subclass='pronoun'),
                ],
                'sarf': {
                    'root': ['و', 'س', 'ط'],
                    'root_meaning': 'middle, center, heart of something; balanced',
                    'root_type_en': 'Starts with weak letter wāw',
                    'wazn': 'فَعَلْنَ',
                    'stem_letters': letters('وَسَطْ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعَلْ', ['f', 'a', 'l']),
                    'word_type_en': 'Past active verb (Form I — base verb)',
                    'verb': {
                        'form': 'I',
                        'pattern': 'وَسَطَ – يَسِطُ',
                        'meaning_of_form_en': 'To charge straight into the center of a crowd',
                        'tense_en': 'Past (completed action)',
                        'person_en': 'They (feminine plural)',
                        'voice_en': 'Active voice',
                        'conjugation': [
                            {'label_en': 'Past (he)', 'ar': 'وَسَطَ'},
                            {'label_en': 'Present (he)', 'ar': 'يَسِطُ'},
                            {'label_en': 'Command', 'ar': 'سِطْ'},
                            {'label_en': 'Action noun', 'ar': 'وَسْط'},
                            {'label_en': 'Doer', 'ar': 'وَاسِط'},
                        ],
                        'conjugation_table': CONJ_WASATNA,
                    },
                    'noun': None,
                    'family': [
                        {'ar': 'أُمَّةً وَسَطًا', 'en': 'a justly balanced nation', 'ref': '2:143'},
                        {'ar': 'ٱلصَّلَوٰةِ ٱلْوُسْطَىٰ', 'en': 'the middle prayer', 'ref': '2:238'},
                        {'ar': 'أَوْسَطُهُمْ', 'en': 'the most moderate of them', 'ref': '68:28'},
                    ],
                },
                'irab': {
                    'en': 'Past active verb ("penetrated the center") with the attached pronoun نَ ("they [feminine]") as the subject.',
                },
                'insight': {
                    'title_en': 'Fearless loyalty straight into danger',
                    'en': 'Horses naturally shy away from noisy crowds, yet out of loyalty to their rider they plunge straight into the middle of the enemy host — completing the 5-verse oath before the pivot to human ingratitude.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'بِهِۦ',
                'translation': 'thereby',
                'transliteration': 'bihi',
                'primary_category': 'harf',
                'role_en': 'Preposition "with / in" + pronoun "it"',
                'segments': [
                    seg('بِ', 'harf', 'P', 'prefix', 'With / by (preposition)',
                        'Means "while carrying the riders" or "cloaked in that dust."',
                        subclass='preposition'),
                    seg('هِۦ', 'ism', 'PRON', 'stem', 'Pronoun: "it"',
                        'Attached pronoun referring back to the dust cloud or the charge.',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Preposition (bi-) + attached pronoun (-hi). Fixed words with no 3-letter root pattern.',
                'irab': {
                    'en': 'Preposition بِ ("with / in") joined to the pronoun هِۦ ("it"), attached to the verb "penetrated."',
                },
                'insight': {
                    'title_en': 'Still shrouded in dust as they hit the center',
                    'en': 'Repeating bihi links Ayah 5 directly to the dust cloud of Ayah 4: before the dust has even settled, the horses have reached the middle of the host.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'جَمْعًا',
                'translation': 'a host / gathering',
                'transliteration': 'jamʿan',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Direct object (what they penetrated)',
                'segments': [
                    seg('جَمْعًا', 'ism', 'N', 'stem', 'Collective Noun (a host)',
                        'An assembled gathering or troop of people.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ج', 'م', 'ع'],
                    'root_meaning': 'to gather, assemble into one group',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعْلًا',
                    'stem_letters': letters('جَمْعًا', ['f', 'a', 'l', '-']),
                    'wazn_letters': letters('فَعْلًا', ['f', 'a', 'l', '-']),
                    'word_type_en': 'Collective noun (direct object)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular collective (represents a group)',
                        'definiteness_en': 'Indefinite ("a gathering")',
                        'case_en': 'Ends in -an (direct object of "penetrated")',
                        'subclass_en': 'Derived / Collective Noun',
                    },
                    'family': [
                        {'ar': 'يَوْمَ ٱلْجَمْعِ', 'en': 'the Day of Assembly', 'ref': '42:7'},
                        {'ar': 'سَيُهْزَمُ ٱلْجَمْعُ', 'en': 'the multitude will be defeated', 'ref': '54:45'},
                        {'ar': 'جَمَعَ مَالًا', 'en': 'who amassed wealth', 'ref': '104:2'},
                    ],
                },
                'irab': {
                    'en': 'Direct object of "penetrated", ending in "-an" (accusative) — answering "what did they cleave the center of? An assembled host."',
                },
                'insight': {
                    'title_en': 'The crescendo before the verdict',
                    'en': 'With jamʿan, the five-verse oath hits its dramatic peak. Now comes the thunderous verdict in Ayah 6.',
                },
            },
        ],
    },
    6: {
        'structure_en': 'Answer to the oath: "Indeed" (emphasis) + "mankind" + "to his Lord" (possessive Iḍāfa: Lord + his) + "is surely ungrateful" (second emphasis + description).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'إِنَّ',
                'translation': 'Indeed',
                'transliteration': 'inna',
                'primary_category': 'harf',
                'subclass': 'emphasis',
                'has_emphasis': True,
                'role_en': 'Strong emphasis particle opening the verdict',
                'segments': [
                    seg('إِنَّ', 'harf', 'ACC', 'stem', 'Indeed / truly (emphasis)',
                        'Strong emphasis particle that makes the next noun ("mankind") end in "-a".',
                        subclass='emphasis', emphasis=True),
                ],
                'sarf': None,
                'sarf_note_en': 'Particles never change form and do not come from a 3-letter root.',
                'irab': {
                    'en': 'Emphasis particle ("Indeed / without doubt") opening the answer to the five-verse oath. It causes its subject ("mankind") to end in "-a".',
                },
                'insight': {
                    'title_en': 'Emphasis stacked on a fivefold oath',
                    'en': 'After five verses of oath, the verdict opens with inna ("Indeed") and seals its predicate with la- ("surely") — triple emphasis for a truth human beings rarely want to admit.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'ٱلْإِنسَـٰنَ',
                'translation': 'mankind',
                'transliteration': 'l-insāna',
                'primary_category': 'ism',
                'subclass': 'singular',
                'role_en': 'Subject of "Indeed" (who the sentence is about)',
                'segments': [
                    seg('ٱلْ', 'harf', 'DET', 'prefix', 'The (all mankind)',
                        'Refers to the human race as a whole.',
                        subclass='determiner'),
                    seg('إِنسَـٰنَ', 'ism', 'N', 'stem', 'Singular Noun (mankind)',
                        'The human being as a species.',
                        subclass='singular'),
                ],
                'sarf': {
                    'root': ['أ', 'ن', 'س'],
                    'root_meaning': 'to be sociable, familiar, at ease; also linked by some scholars to forgetfulness',
                    'root_type_en': 'Starts with hamza (أ)',
                    'wazn': 'فِعْلَان',
                    'stem_letters': letters('إِنسَـٰنَ', ['f', 'a', 'l', '-', '-']),
                    'wazn_letters': letters('فِعْلَانَ', ['f', 'a', 'l', '-', '-']),
                    'word_type_en': 'Singular noun referring to the human species',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular (stands for all humanity)',
                        'definiteness_en': 'Definite ("the human being")',
                        'case_en': 'Ends in -a (subject after "Indeed")',
                        'subclass_en': 'Singular Noun',
                    },
                    'family': [
                        {'ar': 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ', 'en': 'Indeed mankind is in loss', 'ref': '103:2'},
                        {'ar': 'خُلِقَ ٱلْإِنسَٰنُ مِنْ عَجَلٍ', 'en': 'Man was created of haste', 'ref': '21:37'},
                        {'ar': 'ءَانَسَ مِن جَانِبِ ٱلطُّورِ نَارًا', 'en': 'he noticed a fire on the Mount', 'ref': '28:29'},
                    ],
                },
                'irab': {
                    'en': 'The subject of إِنَّ ("Indeed"), so it ends in "-a" (accusative).',
                },
                'insight': {
                    'title_en': 'The warhorse vs. the human being',
                    'en': 'A horse risks its life for a handful of grain given by its rider; yet a human being receives life, breath, mind, and provision from his Lord and still forgets his blessings.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'لِرَبِّهِۦ',
                'translation': 'to his Lord',
                'transliteration': 'lirabbihi',
                'primary_category': 'ism',
                'subclass': 'singular',
                'role_en': 'Preposition "to" + Possessive pair ("his Lord")',
                'idafa': {
                    'type': 'compound',
                    'pair_id': '100:6:rabb-hi',
                    'label_en': 'Possessive (Iḍāfa)',
                    'mudaf_ar': 'رَبِّ',
                    'mudaf_en': 'Lord (first word — drops "the" and "-un/-in")',
                    'mudaf_ilayhi_ar': 'ـهِۦ',
                    'mudaf_ilayhi_en': 'his (attached pronoun completing "his Lord")',
                    'explanation_en': 'The noun رَبِّ ("Lord, Caretaker") connects directly to the possessive pronoun هِۦ ("his"). This highlights the irony: man is ungrateful not to a stranger, but to his own Caretaker.',
                },
                'segments': [
                    seg('لِ', 'harf', 'P', 'prefix', 'To / toward (preposition)',
                        'Preposition "to", making the noun "Lord" end in "-i".',
                        subclass='preposition'),
                    seg('رَبِّ', 'ism', 'N', 'stem', 'Singular Noun: "Lord" (Muḍāf)',
                        'The Master and Nurturer, linked directly to "his" in a possessive pair.',
                        subclass='singular'),
                    seg('هِۦ', 'ism', 'PRON', 'suffix', 'Pronoun: "his" (Muḍāf Ilayhi)',
                        'Attached possessive pronoun meaning "his."',
                        subclass='pronoun'),
                ],
                'sarf': {
                    'root': ['ر', 'ب', 'ب'],
                    'root_meaning': 'to nurture, care for, sustain, and own',
                    'root_type_en': 'Doubled root (2nd & 3rd letters are both ب)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('رَبِّ', ['f', 'al']),
                    'wazn_letters': letters('فَعْلِ', ['f', 'a', 'l']),
                    'word_type_en': 'Singular noun in a possessive pair (Muḍāf)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Definite ("his Lord")',
                        'case_en': 'Ends in -i (after preposition "to")',
                        'subclass_en': 'Singular Noun (Muḍāf)',
                    },
                    'transformation': {
                        'type_en': 'Merged identical letters',
                        'en': 'The two "b" letters merge under one shadda (ّ), carrying both the 2nd and 3rd root letters in one doubled sound.',
                    },
                    'family': [
                        {'ar': 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'en': 'Praise be to Allah, Lord of the worlds', 'ref': '1:2'},
                        {'ar': 'كَمَا رَبَّيَانِى صَغِيرًا', 'en': 'as they raised me when I was small', 'ref': '17:24'},
                        {'ar': 'رَبَّٰنِيِّـۧنَ', 'en': 'devoted scholars of the Lord', 'ref': '3:79'},
                    ],
                },
                'irab': {
                    'en': 'Preposition لِ ("to") + noun رَبِّ ("Lord", ends in -i) + possessive pronoun هِۦ ("his"). Placed before "ungrateful" to highlight who is being wronged.',
                },
                'insight': {
                    'title_en': 'Why put "to his Lord" before "ungrateful"?',
                    'en': 'Moving "to his Lord" earlier in the sentence — and using the intimate possessive "his Lord" — puts the Creator\'s tender care right next to human ingratitude.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'لَكَنُودٌ',
                'translation': '(is) surely ungrateful',
                'transliteration': 'lakanūdun',
                'primary_category': 'ism',
                'subclass': 'derived',
                'has_emphasis': True,
                'role_en': 'Emphasis "surely" + descriptive statement about mankind',
                'segments': [
                    LAM_TAWKID('لَ'),
                    seg('كَنُودٌ', 'ism', 'N', 'stem', 'Intensive Noun (deeply ungrateful)',
                        'A strong descriptive noun meaning chronically ungrateful (like barren soil).',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ك', 'ن', 'د'],
                    'root_meaning': 'barren soil that yields nothing; deeply ungrateful',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعُول',
                    'stem_letters': letters('كَنُودٌ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فَعُولٌ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Intensive descriptive noun (pattern faʿūl = habitual, deep trait)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("-un")',
                        'case_en': 'Ends in -un (main statement / predicate)',
                        'subclass_en': 'Derived / Intensive Noun',
                    },
                    'family': [],
                },
                'irab': {
                    'en': 'لَ ("surely") adds strong emphasis to كَنُودٌ ("ungrateful"), which ends in "-un" as the main predicate describing mankind.',
                },
                'insight': {
                    'title_en': 'Barren earth that drinks rain and gives nothing back',
                    'en': 'In classical Arabic, kanūd described barren soil that drinks the rain yet grows nothing. Al-Ḥasan al-Baṣrī explained: al-kanūd is the one who counts his troubles and forgets his blessings.',
                },
            },
        ],
    },
    7: {
        'structure_en': 'Second emphasized statement: "And indeed, he" + "to that" + "is surely a witness."',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'وَإِنَّهُۥ',
                'translation': 'And indeed, he',
                'transliteration': 'wa-innahu',
                'primary_category': 'harf',
                'subclass': 'emphasis',
                'has_emphasis': True,
                'role_en': '"And" + emphasis "indeed" + pronoun "he"',
                'segments': [
                    WAW_ATF(),
                    seg('إِنَّ', 'harf', 'ACC', 'stem', 'Indeed (emphasis)',
                        'Strong emphasis particle starting a second verdict.',
                        subclass='emphasis', emphasis=True),
                    seg('هُۥ', 'ism', 'PRON', 'suffix', 'Pronoun: "he"',
                        'Attached pronoun meaning "he" (referring back to mankind).',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Three short building blocks joined together: "and" (wa-) + "indeed" (inna) + "he" (-hu). None use a 3-letter root pattern.',
                'irab': {
                    'en': 'Connector وَ ("and") + emphasis particle إِنَّ ("indeed") + attached pronoun هُۥ ("he") acting as the subject of the sentence.',
                },
                'insight': {
                    'title_en': 'A witness against himself',
                    'en': 'Deep down, man\'s own conscience, habits, and words testify to his ingratitude even when he tries to make excuses.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'عَلَىٰ',
                'translation': 'to / upon',
                'transliteration': 'ʿalā',
                'primary_category': 'harf',
                'role_en': 'Preposition ("to / upon")',
                'segments': [
                    seg('عَلَىٰ', 'harf', 'P', 'stem', 'Upon / to (preposition)',
                        'Links "witness" to what is being witnessed ("witness to that").',
                        subclass='preposition'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed preposition ("upon / to") — never changes form.',
                'irab': {
                    'en': 'Preposition meaning "upon / to", linking the word "witness" to "that."',
                },
                'insight': {
                    'title_en': 'Bearing witness "upon" an undeniable fact',
                    'en': 'In Arabic, witnessing ʿalā something means standing over an open, undeniable reality.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'ذَٰلِكَ',
                'translation': 'that',
                'transliteration': 'dhālika',
                'primary_category': 'ism',
                'subclass': 'pronoun',
                'role_en': 'Pointer word ("that" — referring to ingratitude)',
                'segments': [
                    seg('ذَٰ', 'ism', 'DEM', 'stem', 'Pronoun: "that"',
                        'Points back to man\'s ingratitude mentioned in Ayah 6.',
                        subclass='pronoun'),
                    seg('لِ', 'harf', 'PART', 'suffix', 'Distance marker',
                        'Adds weight and distance ("that" rather than "this").',
                        subclass='particle'),
                    seg('كَ', 'harf', 'PART', 'suffix', 'Listener marker',
                        'Addresses the listener directly.',
                        subclass='particle'),
                ],
                'sarf': None,
                'sarf_note_en': 'Pointer words ("this / that") are fixed words and do not come from a 3-letter root.',
                'irab': {
                    'en': 'Pointer pronoun ("that") following the preposition عَلَىٰ ("to"), pointing back to man\'s ingratitude.',
                },
                'insight': {
                    'title_en': 'Highlighting the weight of ingratitude',
                    'en': 'Saying "that" (dhālika) rather than "this" gives gravity to how glaring human ingratitude really is.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'لَشَهِيدٌ',
                'translation': '(is) surely a witness',
                'transliteration': 'lashahīdun',
                'primary_category': 'ism',
                'subclass': 'derived',
                'has_emphasis': True,
                'role_en': 'Emphasis "surely" + descriptive statement ("a witness")',
                'segments': [
                    LAM_TAWKID('لَ'),
                    seg('شَهِيدٌ', 'ism', 'N', 'stem', 'Intensive Noun (constant witness)',
                        'Means an ever-present, undeniable witness.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ش', 'ه', 'د'],
                    'root_meaning': 'to witness firsthand, be present, testify',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعِيل',
                    'stem_letters': letters('شَهِيدٌ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فَعِيلٌ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Intensive descriptive noun (pattern faʿīl = constant trait)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("a witness")',
                        'case_en': 'Ends in -un (main statement / predicate)',
                        'subclass_en': 'Derived / Intensive Noun',
                    },
                    'family': [
                        {'ar': 'وَٱللَّهُ عَلَىٰ كُلِّ شَىْءٍ شَهِيدٌ', 'en': 'and Allah is Witness over all things', 'ref': '85:9'},
                        {'ar': 'شَهِدَ ٱللَّهُ', 'en': 'Allah witnesses', 'ref': '3:18'},
                        {'ar': 'وَجِا۟ىٓءَ بِٱلنَّبِيِّـۧنَ وَٱلشُّهَدَآءِ', 'en': 'and the prophets and witnesses will be brought', 'ref': '39:69'},
                    ],
                },
                'irab': {
                    'en': 'لَ ("surely") emphasizes شَهِيدٌ ("a witness"), which ends in "-un" as the main predicate.',
                },
                'insight': {
                    'title_en': 'Why shahīd instead of shāhid?',
                    'en': 'Shāhid is someone who happens to see something once; shahīd (pattern faʿīl) is an ongoing, undeniable witness whose own life is permanent proof.',
                },
            },
        ],
    },
    8: {
        'structure_en': 'Third emphasized statement with a 2-word possessive link: "And indeed, he" + "in love of wealth" (Iḍāfa pair) + "is surely intense."',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'وَإِنَّهُۥ',
                'translation': 'And indeed, he',
                'transliteration': 'wa-innahu',
                'primary_category': 'harf',
                'subclass': 'emphasis',
                'has_emphasis': True,
                'role_en': '"And" + emphasis "indeed" + pronoun "he"',
                'segments': [
                    WAW_ATF(),
                    seg('إِنَّ', 'harf', 'ACC', 'stem', 'Indeed (emphasis)',
                        'Strong emphasis particle introducing the root cause of ingratitude.',
                        subclass='emphasis', emphasis=True),
                    seg('هُۥ', 'ism', 'PRON', 'suffix', 'Pronoun: "he"',
                        'Attached pronoun meaning "he" (mankind).',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Compound of "and" (wa-) + "indeed" (inna) + "he" (-hu). Fixed words with no 3-letter root pattern.',
                'irab': {
                    'en': 'Connector وَ ("and") + emphasis particle إِنَّ ("indeed") + pronoun هُۥ ("he") as the subject.',
                },
                'insight': {
                    'title_en': 'Exposing the root cause of ingratitude',
                    'en': 'Why is man ungrateful to his Lord (Ayah 6)? Ayah 8 pinpoints the reason: his consuming attachment to wealth.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'لِحُبِّ',
                'translation': 'in (the) love of',
                'transliteration': 'liḥubbi',
                'primary_category': 'ism',
                'subclass': 'singular',
                'role_en': 'First word of the "of" pair ("love of wealth")',
                'idafa': {
                    'type': 'mudaf',
                    'pair_id': '100:8:hubb-khayr',
                    'partner_position': 3,
                    'label_en': 'Muḍāf (of…)',
                    'mudaf_ar': 'حُبِّ',
                    'mudaf_en': 'love of (first word — drops "the" and "-un/-in")',
                    'mudaf_ilayhi_ar': 'ٱلْخَيْرِ',
                    'mudaf_ilayhi_en': 'wealth / good (second word — always ends in -i)',
                    'explanation_en': 'Two words linked in an "of" relationship (Iḍāfa): حُبِّ ("love of") binds directly to the next word ٱلْخَيْرِ ("wealth"). Because it is the first word in the pair, حُبِّ drops "al-" and tanwīn.',
                },
                'segments': [
                    seg('لِ', 'harf', 'P', 'prefix', 'Because of / in (preposition)',
                        'Means "because of / in his love of…", making "love" end in "-i".',
                        subclass='preposition'),
                    seg('حُبِّ', 'ism', 'N', 'stem', 'Singular Noun: "love of" (Muḍāf)',
                        'First word in the possessive link ("love of wealth").',
                        subclass='singular'),
                ],
                'sarf': {
                    'root': ['ح', 'ب', 'ب'],
                    'root_meaning': 'to love deeply; also a seed or core (ḥabba)',
                    'root_type_en': 'Doubled root (2nd & 3rd letters are both ب)',
                    'wazn': 'فُعْل',
                    'stem_letters': letters('حُبِّ', ['f', 'al']),
                    'wazn_letters': letters('فُعْلِ', ['f', 'a', 'l']),
                    'word_type_en': 'Action noun in a possessive pair (Muḍāf)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Made definite by "wealth" right after it',
                        'case_en': 'Ends in -i (after preposition "in / because of")',
                        'subclass_en': 'Singular Noun (Muḍāf)',
                    },
                    'transformation': {
                        'type_en': 'Merged identical letters',
                        'en': 'The two "b" letters merge under one shadda (ّ), carrying both the 2nd and 3rd root letters.',
                    },
                    'family': [
                        {'ar': 'وَتُحِبُّونَ ٱلْمَالَ حُبًّا جَمًّا', 'en': 'and you love wealth with immense love', 'ref': '89:20'},
                        {'ar': 'كَمَثَلِ حَبَّةٍ أَنۢبَتَتْ سَبْعَ سَنَابِلَ', 'en': 'like a grain of seed that sprouts seven ears', 'ref': '2:261'},
                    ],
                },
                'irab': {
                    'en': 'Preposition لِ ("because of / in") + noun حُبِّ ("love of", ends in -i). It links directly to the next word ٱلْخَيْرِ ("wealth") as a 2-word Iḍāfa pair.',
                },
                'insight': {
                    'title_en': 'Ḥubb and ḥabba — the seed planted in the heart',
                    'en': 'Ḥubb (love) shares its root with ḥabba (a seed/core): whatever you love settles into the core of your heart and grows until it steers your whole life.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'ٱلْخَيْرِ',
                'translation': 'wealth / good',
                'transliteration': 'l-khayri',
                'primary_category': 'ism',
                'subclass': 'singular',
                'role_en': 'Second word of the "of" pair ("love of wealth")',
                'idafa': {
                    'type': 'mudaf_ilayhi',
                    'pair_id': '100:8:hubb-khayr',
                    'partner_position': 2,
                    'label_en': 'Muḍāf Ilayhi',
                    'mudaf_ar': 'حُبِّ',
                    'mudaf_en': 'love of (previous word)',
                    'mudaf_ilayhi_ar': 'ٱلْخَيْرِ',
                    'mudaf_ilayhi_en': 'wealth / good (completes the "of" phrase, ends in -i)',
                    'explanation_en': 'Completes the 2-word "of" link with حُبِّ ("love of wealth"). The second word in an Iḍāfa always takes the "-i" (genitive) ending.',
                },
                'segments': [
                    AL_QAMARI(),
                    seg('خَيْرِ', 'ism', 'N', 'stem', 'Singular Noun: "wealth" (Muḍāf Ilayhi)',
                        'Second word in the "of" pair ("love of wealth"), ending in "-i".',
                        subclass='singular'),
                ],
                'sarf': {
                    'root': ['خ', 'ي', 'ر'],
                    'root_meaning': 'good, benefit, wealth',
                    'root_type_en': 'Weak middle letter (yāʾ)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('خَيْرِ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعْلِ', ['f', 'a', 'l']),
                    'word_type_en': 'Singular noun completing a possessive pair (Muḍāf Ilayhi)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Definite ("the wealth")',
                        'case_en': 'Ends in -i (always genitive as 2nd word in Iḍāfa)',
                        'subclass_en': 'Singular Noun (Muḍāf Ilayhi)',
                    },
                    'family': [
                        {'ar': 'إِن تَرَكَ خَيْرًا', 'en': 'if he leaves behind wealth', 'ref': '2:180'},
                        {'ar': 'إِنِّىٓ أَحْبَبْتُ حُبَّ ٱلْخَيْرِ', 'en': 'Indeed I loved the love of good/horses', 'ref': '38:32'},
                    ],
                },
                'irab': {
                    'en': 'Second word of the possessive pair ("love of wealth"), so it automatically takes the "-i" ending (genitive).',
                },
                'insight': {
                    'title_en': 'Why does the Qur\'ān call wealth al-khayr ("good")?',
                    'en': 'Arabic uses al-khayr for wealth both because people view money as the ultimate good, and because wealth itself can be good — until greed makes a person tight-fisted.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'لَشَدِيدٌ',
                'translation': '(is) surely intense',
                'transliteration': 'lashadīdun',
                'primary_category': 'ism',
                'subclass': 'derived',
                'has_emphasis': True,
                'role_en': 'Emphasis "surely" + descriptive statement ("intense")',
                'segments': [
                    LAM_TAWKID('لَ'),
                    seg('شَدِيدٌ', 'ism', 'N', 'stem', 'Intensive Noun (intense / tight-fisted)',
                        'Means fiercely gripped, intense, and tight-fisted.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['ش', 'د', 'د'],
                    'root_meaning': 'to tie tightly, grip hard, be intense or stingy',
                    'root_type_en': 'Doubled root (2nd & 3rd letters are both د)',
                    'wazn': 'فَعِيل',
                    'stem_letters': letters('شَدِيدٌ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فَعِيلٌ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Intensive descriptive noun (pattern faʿīl)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("-un")',
                        'case_en': 'Ends in -un (main statement / predicate)',
                        'subclass_en': 'Derived / Intensive Noun',
                    },
                    'family': [
                        {'ar': 'وَشَدَدْنَا مُلْكَهُۥ', 'en': 'and We strengthened his kingdom', 'ref': '38:20'},
                        {'ar': 'إِنَّ بَطْشَ رَبِّكَ لَشَدِيدٌ', 'en': 'Indeed the grip of your Lord is severe', 'ref': '85:12'},
                    ],
                },
                'irab': {
                    'en': 'لَ ("surely") emphasizes شَدِيدٌ ("intense"), which ends in "-un" as the main predicate of the sentence.',
                },
                'insight': {
                    'title_en': 'Shadīd — knotted tight with greed',
                    'en': 'Shadda means to pull a knot tight: because of his love of wealth, man becomes tightly knotted, unyielding, and stingy.',
                },
            },
        ],
    },
    9: {
        'structure_en': 'Wake-up question shifting to present active, then past passive: "Then does he not know" + "when" + "is overturned" (passive verb) + "what is in the graves" (plural noun).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'أَفَلَا',
                'translation': 'Then does not',
                'transliteration': 'afalā',
                'primary_category': 'harf',
                'role_en': 'Three particles: Question + "then" + "not"',
                'segments': [
                    seg('أَ', 'harf', 'INTG', 'prefix', 'Question particle',
                        'Turns the sentence into a pointed wake-up question.',
                        subclass='interrogative'),
                    FA_ATF('Means "then / so", linking back to man\'s ingratitude.'),
                    seg('لَا', 'harf', 'NEG', 'stem', 'Not (negation)',
                        'Negates the verb right after it ("does he not know?").',
                        subclass='negation'),
                ],
                'sarf': None,
                'sarf_note_en': 'Three short particles joined into one word: question (a-) + "then" (fa-) + "not" (lā). Particles do not have a 3-letter root.',
                'irab': {
                    'en': 'Combines a question marker أَ, the connector فَ ("then"), and negation لَا ("not") to ask: "Then does he not know?!"',
                },
                'insight': {
                    'title_en': 'Three short particles that jolt the sleeper awake',
                    'en': 'A-fa-lā packs a question, a consequence, and a negation into four letters: "After all this, does he still not realize?!"',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'يَعْلَمُ',
                'translation': 'he know',
                'transliteration': 'yaʿlamu',
                'primary_category': 'fil',
                'tense': 'present',
                'voice': 'active',
                'role_en': 'Present active verb ("he knows")',
                'segments': [
                    seg('يَعْلَمُ', 'fil', 'V', 'stem', 'Present Verb ("he knows")',
                        'Present tense verb with an implied subject "he" (mankind).',
                        tense='present', voice='active'),
                ],
                'sarf': {
                    'root': ['ع', 'ل', 'م'],
                    'root_meaning': 'to know with certainty',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'يَفْعَلُ',
                    'stem_letters': letters('يَعْلَمُ', ['-', 'f', 'a', 'l']),
                    'wazn_letters': letters('يَفْعَلُ', ['-', 'f', 'a', 'l']),
                    'word_type_en': 'Present active verb (Form I — base verb)',
                    'verb': {
                        'form': 'I',
                        'pattern': 'عَلِمَ – يَعْلَمُ',
                        'meaning_of_form_en': 'To know and realize a truth clearly',
                        'tense_en': 'Present tense',
                        'person_en': 'He (3rd person masculine singular)',
                        'voice_en': 'Active voice',
                        'conjugation': [
                            {'label_en': 'Past (he)', 'ar': 'عَلِمَ'},
                            {'label_en': 'Present (he)', 'ar': 'يَعْلَمُ'},
                            {'label_en': 'Command', 'ar': 'ٱعْلَمْ'},
                            {'label_en': 'Action noun', 'ar': 'عِلْم'},
                            {'label_en': 'Doer', 'ar': 'عَالِم'},
                        ],
                        'conjugation_table': CONJ_YALAMU,
                    },
                    'noun': None,
                    'family': [
                        {'ar': 'كَلَّا سَوْفَ تَعْلَمُونَ', 'en': 'No! Soon you will know', 'ref': '102:3'},
                        {'ar': 'عَلَّمَ ٱلْإِنسَٰنَ مَا لَمْ يَعْلَمْ', 'en': 'taught man what he did not know', 'ref': '96:5'},
                        {'ar': 'عَٰلِمُ ٱلْغَيْبِ وَٱلشَّهَٰدَةِ', 'en': 'Knower of the unseen and seen', 'ref': '59:22'},
                    ],
                },
                'irab': {
                    'en': 'Present tense active verb ending in "-u" (normal statement form). The subject "he" (mankind) is understood inside the verb.',
                },
                'insight': {
                    'title_en': 'The only present-tense verb in Surah Al-ʿĀdiyāt',
                    'en': 'Yaʿlamu is the sole present-tense verb in the whole sūrah — addressing man in his living present moment right now, while there is still time to wake up.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'إِذَا',
                'translation': 'when',
                'transliteration': 'idhā',
                'primary_category': 'ism',
                'subclass': 'pronoun',
                'role_en': 'Time word ("when" — for a certain future event)',
                'segments': [
                    seg('إِذَا', 'ism', 'T', 'stem', 'Time Word: "when"',
                        'Used in Arabic for future events that are guaranteed to happen.',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed time word ("when") — does not follow a 3-letter root pattern.',
                'irab': {
                    'en': 'Time word ("when") introducing a certain future moment — the Day the graves are overturned.',
                },
                'insight': {
                    'title_en': 'Why "when" (idhā) instead of "if" (in)?',
                    'en': 'Arabic uses in ("if") for uncertain possibilities, and idhā ("when") for events guaranteed to arrive.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'بُعْثِرَ',
                'translation': 'is scattered / overturned',
                'transliteration': 'buʿthira',
                'primary_category': 'fil',
                'tense': 'past',
                'voice': 'passive',
                'role_en': 'Past passive verb (rare 4-letter root)',
                'segments': [
                    seg('بُعْثِرَ', 'fil', 'V', 'stem', 'Past Passive Verb ("is overturned")',
                        'Passive verb with an "u–i" vowel pattern meaning "turned upside down and emptied out."',
                        tense='past', voice='passive'),
                ],
                'sarf': {
                    'root': ['ب', 'ع', 'ث', 'ر'],
                    'root_meaning': 'to turn upside down and scatter out what was buried',
                    'root_type_en': '4-letter root (quadriliteral: ب – ع – ث – ر)',
                    'wazn': 'فُعْلِلَ',
                    'stem_letters': letters('بُعْثِرَ', ['f', 'a', 'l', 'l2']),
                    'wazn_letters': letters('فُعْلِلَ', ['f', 'a', 'l', 'l2']),
                    'word_type_en': 'Past passive verb from a 4-letter root',
                    'verb': {
                        'form': '4-Letter Root (Quadriliteral)',
                        'pattern': 'بَعْثَرَ – يُبَعْثِرُ (passive: بُعْثِرَ)',
                        'meaning_of_form_en': 'Turning a grave upside down so everything buried inside spills out',
                        'tense_en': 'Past form (used in Arabic for future certainty)',
                        'person_en': 'It (3rd person singular)',
                        'voice_en': 'Passive voice ("it was overturned")',
                        'conjugation': [
                            {'label_en': 'Active past', 'ar': 'بَعْثَرَ'},
                            {'label_en': 'Passive past', 'ar': 'بُعْثِرَ'},
                            {'label_en': 'Active present', 'ar': 'يُبَعْثِرُ'},
                            {'label_en': 'Command', 'ar': 'بَعْثِرْ'},
                            {'label_en': 'Action noun', 'ar': 'بَعْثَرَة'},
                        ],
                        'conjugation_table': CONJ_BUTHIRA,
                    },
                    'noun': None,
                    'scholarly_note_en': 'Classical scholars noted that the 4-letter root b-ʿ-th-r blends baʿatha ("to resurrect") and athāra ("to stir up" — echoing Ayah 4!).',
                    'family': [
                        {'ar': 'وَإِذَا ٱلْقُبُورُ بُعْثِرَتْ', 'en': 'and when the graves are overturned', 'ref': '82:4'},
                        {'ar': 'ثُمَّ بَعَثْنَٰكُم مِّنۢ بَعْدِ مَوْتِكُمْ', 'en': 'then We revived you after your death', 'ref': '2:56'},
                    ],
                },
                'irab': {
                    'en': 'Past passive verb ("is overturned / scattered out"). The doer is left unnamed for awe; what receives the action is the next word مَا ("what is in the graves").',
                },
                'insight': {
                    'title_en': 'The echo between "stirred up" (Ayah 4) and "overturned" (Ayah 9)',
                    'en': 'Just as the horses stirred up the earth\'s dust in Ayah 4, the earth itself will be overturned in Ayah 9 — and the passive voice conveys sudden, unstoppable command.',
                },
            },
            {
                'position': 5,
                'text_uthmani': 'مَا',
                'translation': 'what',
                'transliteration': 'mā',
                'primary_category': 'ism',
                'subclass': 'pronoun',
                'role_en': 'Pronoun ("what" — the thing overturned)',
                'segments': [
                    seg('مَا', 'ism', 'REL', 'stem', 'Pronoun: "what / that which"',
                        'Stands for everything resting inside the graves.',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed pronoun ("what / that which") — does not follow a 3-letter root pattern.',
                'irab': {
                    'en': 'Pronoun meaning "what / that which", acting as the subject receiving the passive verb "is overturned."',
                },
                'insight': {
                    'title_en': 'Why "what" (mā) instead of "who" (man)?',
                    'en': 'Inside the grave, bodies have turned into dust and bones ("what is in the graves") before being restored into living people.',
                },
            },
            {
                'position': 6,
                'text_uthmani': 'فِى',
                'translation': '(is) in',
                'transliteration': 'fī',
                'primary_category': 'harf',
                'role_en': 'Preposition ("in / inside")',
                'segments': [
                    seg('فِى', 'harf', 'P', 'stem', 'In / inside (preposition)',
                        'Means "deep inside", making the next noun ("the graves") end in "-i".',
                        subclass='preposition'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed preposition ("in") — does not change form.',
                'irab': {
                    'en': 'Preposition meaning "in / inside", causing "the graves" after it to end in "-i".',
                },
                'insight': {
                    'title_en': 'From deep underground into the open',
                    'en': 'Fī ("deep inside") contrasts sharply with buʿthira ("turned inside out"): nothing buried in the ground stays hidden.',
                },
            },
            {
                'position': 7,
                'text_uthmani': 'ٱلْقُبُورِ',
                'translation': 'the graves',
                'transliteration': 'l-qubūri',
                'primary_category': 'ism',
                'subclass': 'plural',
                'role_en': 'Plural noun after "in"',
                'segments': [
                    AL_QAMARI(),
                    seg('قُبُورِ', 'ism', 'N', 'stem', 'Plural Noun ("graves")',
                        'Broken plural of قَبْر ("grave").',
                        subclass='plural'),
                ],
                'sarf': {
                    'root': ['ق', 'ب', 'ر'],
                    'root_meaning': 'to bury in the earth; a grave',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فُعُول',
                    'stem_letters': letters('قُبُورِ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فُعُولِ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Broken plural noun (singular: قَبْر)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine (inanimate plural)',
                        'number_en': 'Plural (broken plural)',
                        'singular_ar': 'قَبْر',
                        'singular_en': 'a grave',
                        'definiteness_en': 'Definite ("the graves")',
                        'case_en': 'Ends in -i (after preposition "in")',
                        'subclass_en': 'Plural Noun',
                    },
                    'family': [
                        {'ar': 'ثُمَّ أَمَاتَهُۥ فَأَقْبَرَهُۥ', 'en': 'then caused him to die and gave him a grave', 'ref': '80:21'},
                        {'ar': 'وَأَنَّ ٱللَّهَ يَبْعَثُ مَن فِى ٱلْقُبُورِ', 'en': 'and Allah will resurrect those in the graves', 'ref': '22:7'},
                    ],
                },
                'irab': {
                    'en': 'Plural of قَبْر ("grave"). Ends in "-i" (genitive) because it comes right after the preposition فِى ("in").',
                },
                'insight': {
                    'title_en': 'The twin vaults: graves and chests',
                    'en': 'Both al-qubūr ("the graves", Ayah 9) and al-ṣudūr ("the chests", Ayah 10) share the exact same broken-plural pattern (fuʿūl): one hides the body, the other hides intentions, and both will be opened.',
                },
            },
        ],
    },
    10: {
        'structure_en': 'Second passive scene: "And is extracted" (passive verb) + "what" + "is in" + "the breasts/chests" (plural noun).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'وَحُصِّلَ',
                'translation': 'And is made apparent / extracted',
                'transliteration': 'waḥuṣṣila',
                'primary_category': 'fil',
                'tense': 'past',
                'voice': 'passive',
                'role_en': '"And" + past passive verb ("is extracted")',
                'segments': [
                    WAW_ATF(),
                    seg('حُصِّلَ', 'fil', 'V', 'stem', 'Past Passive Verb ("is extracted")',
                        'Form II passive verb ("u–i" vowels) meaning "extracted, sorted out, and exposed."',
                        tense='past', voice='passive'),
                ],
                'sarf': {
                    'root': ['ح', 'ص', 'ل'],
                    'root_meaning': 'to extract the true kernel, peel away the husk, sum up',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فُعِّلَ',
                    'stem_letters': letters('حُصِّلَ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فُعِّلَ', ['f', 'a', 'l']),
                    'word_type_en': 'Past passive verb (Form II — doubled middle letter)',
                    'verb': {
                        'form': 'II',
                        'pattern': 'حَصَّلَ – يُحَصِّلُ (passive: حُصِّلَ)',
                        'meaning_of_form_en': 'Thoroughly extracting the core truth from every outward excuse',
                        'tense_en': 'Past form (used for guaranteed future certainty)',
                        'person_en': 'It (3rd person singular)',
                        'voice_en': 'Passive voice ("it was extracted")',
                        'conjugation': [
                            {'label_en': 'Active past', 'ar': 'حَصَّلَ'},
                            {'label_en': 'Passive past', 'ar': 'حُصِّلَ'},
                            {'label_en': 'Active present', 'ar': 'يُحَصِّلُ'},
                            {'label_en': 'Command', 'ar': 'حَصِّلْ'},
                            {'label_en': 'Action noun', 'ar': 'تَحْصِيل'},
                        ],
                        'conjugation_table': CONJ_HUSSILA,
                    },
                    'noun': None,
                    'family': [],
                },
                'irab': {
                    'en': 'Connector وَ ("and") + past passive verb حُصِّلَ ("is extracted and sorted"). What gets extracted is the next word مَا ("what is in the chests").',
                },
                'insight': {
                    'title_en': 'Shelling the nut to expose the kernel',
                    'en': 'In Arabic, taḥṣīl means cracking away a husk to pull out the core inside. On Judgment Day, outward excuses fall away and the true inner motives in the chest are brought out.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'مَا',
                'translation': 'what',
                'transliteration': 'mā',
                'primary_category': 'ism',
                'subclass': 'pronoun',
                'role_en': 'Pronoun ("what" — the hidden motives extracted)',
                'segments': [
                    seg('مَا', 'ism', 'REL', 'stem', 'Pronoun: "what / that which"',
                        'Refers to every hidden intention, belief, and secret inside the chest.',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed pronoun ("what / that which") — no 3-letter root pattern.',
                'irab': {
                    'en': 'Pronoun ("what / that which") acting as the subject receiving the passive verb "is extracted."',
                },
                'insight': {
                    'title_en': 'The unseen contents of the heart',
                    'en': 'In this life people judge by appearances; on that Day, what was hidden inside the chest becomes the decisive record.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'فِى',
                'translation': '(is) in',
                'transliteration': 'fī',
                'primary_category': 'harf',
                'role_en': 'Preposition ("in / inside")',
                'segments': [
                    seg('فِى', 'harf', 'P', 'stem', 'In / inside (preposition)',
                        'Means "inside", making the next noun ("the breasts") end in "-i".',
                        subclass='preposition'),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed preposition ("in") — does not change form.',
                'irab': {
                    'en': 'Preposition ("in / inside"), causing "the breasts / chests" after it to end in "-i".',
                },
                'insight': {
                    'title_en': 'Hidden in clay vs. hidden in the chest',
                    'en': 'Repeating fī ("inside") mirrors Ayah 9 directly: what is inside the graves and what is inside the chests will both come out together.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'ٱلصُّدُورِ',
                'translation': 'the breasts',
                'transliteration': 'l-ṣudūri',
                'primary_category': 'ism',
                'subclass': 'plural',
                'role_en': 'Plural noun after "in"',
                'segments': [
                    AL_SHAMSI(),
                    seg('صُّدُورِ', 'ism', 'N', 'stem', 'Plural Noun ("chests / breasts")',
                        'Broken plural of صَدْر ("chest / breast").',
                        subclass='plural'),
                ],
                'sarf': {
                    'root': ['ص', 'د', 'ر'],
                    'root_meaning': 'chest, breast, forefront',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فُعُول',
                    'stem_letters': letters('صُّدُورِ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فُعُولِ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Broken plural noun (singular: صَدْر)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine (inanimate plural)',
                        'number_en': 'Plural (broken plural)',
                        'singular_ar': 'صَدْر',
                        'singular_en': 'a chest / breast',
                        'definiteness_en': 'Definite ("the chests")',
                        'case_en': 'Ends in -i (after preposition "in")',
                        'subclass_en': 'Plural Noun',
                    },
                    'family': [
                        {'ar': 'يَعْلَمُ خَآئِنَةَ ٱلْأَعْيُنِ وَمَا تُخْفِى ٱلصُّدُورُ', 'en': 'He knows the stealthy glance and what the breasts hide', 'ref': '40:19'},
                        {'ar': 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', 'en': 'Did We not expand for you your chest?', 'ref': '94:1'},
                        {'ar': 'يَوْمَئِذٍ يَصْدُرُ ٱلنَّاسُ أَشتَاتًا', 'en': 'That Day people will proceed forth in scattered groups', 'ref': '99:6'},
                    ],
                },
                'irab': {
                    'en': 'Plural of صَدْر ("chest / breast"). Ends in "-i" (genitive) because it follows the preposition فِى ("in").',
                },
                'insight': {
                    'title_en': 'Why is there a shadda on ṣād in al-ṣudūr?',
                    'en': 'The doubled "ṣ" comes from "al-" blending into the sun-letter ṣād (aṣ-ṣudūr), while the root is the regular 3-letter root ص-د-ر.',
                },
            },
        ],
    },
    11: {
        'structure_en': 'Grand finale with double emphasis and two possessive links: "Indeed" + "their Lord" (Iḍāfa) + "about them" + "that Day" (Iḍāfa) + "is surely All-Aware."',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'إِنَّ',
                'translation': 'Indeed',
                'transliteration': 'inna',
                'primary_category': 'harf',
                'subclass': 'emphasis',
                'has_emphasis': True,
                'role_en': 'Strong emphasis particle sealing the sūrah',
                'segments': [
                    seg('إِنَّ', 'harf', 'ACC', 'stem', 'Indeed (emphasis)',
                        'Seals the sūrah with emphatic certainty about God\'s complete awareness.',
                        subclass='emphasis', emphasis=True),
                ],
                'sarf': None,
                'sarf_note_en': 'Fixed emphasis particle — does not follow a 3-letter root pattern.',
                'irab': {
                    'en': 'Emphasis particle ("Indeed") causing the next noun ("their Lord") to end in "-a".',
                },
                'insight': {
                    'title_en': 'Naming the One behind the passive verbs',
                    'en': 'After the unnamed doer of "is overturned" and "is extracted" in Ayahs 9–10, Ayah 11 reveals Who commands that Day: "Indeed, their Lord…"',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'رَبَّهُم',
                'translation': 'their Lord',
                'transliteration': 'rabbahum',
                'primary_category': 'ism',
                'subclass': 'singular',
                'role_en': 'Subject of "Indeed" + Possessive pair ("their Lord")',
                'idafa': {
                    'type': 'compound',
                    'pair_id': '100:11:rabb-hum',
                    'label_en': 'Possessive (Iḍāfa)',
                    'mudaf_ar': 'رَبَّ',
                    'mudaf_en': 'Lord (first word — ends in -a after "Indeed")',
                    'mudaf_ilayhi_ar': 'ـهُم',
                    'mudaf_ilayhi_en': 'their (attached plural pronoun completing "their Lord")',
                    'explanation_en': 'Joins رَبَّ ("Lord") directly to هُم ("their") in a possessive pair (Iḍāfa). Notice the shift from singular "his Lord" in Ayah 6 to plural "their Lord" here as all humanity stands resurrected.',
                },
                'segments': [
                    seg('رَبَّ', 'ism', 'N', 'stem', 'Singular Noun: "Lord" (Muḍāf)',
                        'Subject after "Indeed" (ends in -a), linked directly to "their."',
                        subclass='singular'),
                    seg('هُم', 'ism', 'PRON', 'suffix', 'Pronoun: "their" (Muḍāf Ilayhi)',
                        'Attached plural possessive pronoun meaning "their."',
                        subclass='pronoun'),
                ],
                'sarf': {
                    'root': ['ر', 'ب', 'ب'],
                    'root_meaning': 'to nurture, sustain, own, and hold accountable',
                    'root_type_en': 'Doubled root (2nd & 3rd letters are both ب)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('رَبَّ', ['f', 'al']),
                    'wazn_letters': letters('فَعْلَ', ['f', 'a', 'l']),
                    'word_type_en': 'Singular noun in a possessive pair (Muḍāf)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Definite ("their Lord")',
                        'case_en': 'Ends in -a (subject after "Indeed")',
                        'subclass_en': 'Singular Noun (Muḍāf)',
                    },
                    'transformation': {
                        'type_en': 'Merged identical letters',
                        'en': 'The two "b" letters merge under one shadda (ّ), carrying both the 2nd and 3rd root letters.',
                    },
                    'family': [
                        {'ar': 'إِنَّ ٱلْإِنسَٰنَ لِرَبِّهِۦ لَكَنُودٌ', 'en': 'Indeed mankind to his Lord is ungrateful', 'ref': '100:6'},
                        {'ar': 'إِلَىٰ رَبِّكَ يَوْمَئِذٍ ٱلْمُسْتَقَرُّ', 'en': 'To your Lord, that Day, is the final place', 'ref': '75:12'},
                    ],
                },
                'irab': {
                    'en': 'رَبَّ ("Lord") ends in "-a" as the subject of إِنَّ ("Indeed"), and joins with the possessive pronoun هُم ("their") in an Iḍāfa pair.',
                },
                'insight': {
                    'title_en': 'From "his Lord" (Ayah 6) to "their Lord" (Ayah 11)',
                    'en': 'Ayahs 6–8 spoke of "man" in the singular ("his Lord"); once all graves and chests are opened in Ayahs 9–10, the pronoun expands to the plural ("their Lord") as every generation stands together.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'بِهِمْ',
                'translation': 'about them',
                'transliteration': 'bihim',
                'primary_category': 'harf',
                'role_en': 'Preposition "about / with" + pronoun "them"',
                'segments': [
                    seg('بِ', 'harf', 'P', 'prefix', 'About / with (preposition)',
                        'Connects "All-Aware" to "them" ("All-Aware about them").',
                        subclass='preposition'),
                    seg('هِمْ', 'ism', 'PRON', 'stem', 'Pronoun: "them"',
                        'Attached plural pronoun meaning "them."',
                        subclass='pronoun'),
                ],
                'sarf': None,
                'sarf_note_en': 'Preposition (bi-) + plural pronoun (-him). Fixed words with no 3-letter root pattern.',
                'irab': {
                    'en': 'Preposition بِ ("about") joined to the pronoun هِمْ ("them"), placed early to emphasize that no one is missed.',
                },
                'insight': {
                    'title_en': 'Placed early for focus',
                    'en': 'Putting "about them" right beside "their Lord" reassures us that not a single person or hidden deed goes unnoticed.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'يَوْمَئِذٍ',
                'translation': 'that Day',
                'transliteration': 'yawma-idhin',
                'primary_category': 'ism',
                'subclass': 'derived',
                'role_en': 'Time phrase in an "of" link ("on the Day of that event")',
                'idafa': {
                    'type': 'compound',
                    'pair_id': '100:11:yawma-idhin',
                    'label_en': 'Possessive Time Pair (Iḍāfa)',
                    'mudaf_ar': 'يَوْمَ',
                    'mudaf_en': 'Day of (first word — time noun)',
                    'mudaf_ilayhi_ar': 'إِذٍ',
                    'mudaf_ilayhi_en': 'that [moment] (the "-in" ending stands in for the entire scene of Ayahs 9–10)',
                    'explanation_en': 'Combines يَوْمَ ("on the Day of") with إِذٍ ("that moment") in one Iḍāfa word. The "-in" ending acts as shorthand for the omitted clause: "on the Day when the graves are overturned and the chests are exposed."',
                },
                'segments': [
                    seg('يَوْمَ', 'ism', 'T', 'stem', 'Time Noun: "Day of" (Muḍāf)',
                        'Time word ending in "-a", linked directly to "that moment."',
                        subclass='derived'),
                    seg('ئِذٍ', 'ism', 'T', 'suffix', 'Time Word: "that moment" (Muḍāf Ilayhi)',
                        'Its "-in" ending stands in for the whole resurrection scene just described.',
                        subclass='pronoun'),
                ],
                'sarf': {
                    'root': ['ي', 'و', 'م'],
                    'root_meaning': 'a day or momentous time',
                    'root_type_en': 'Weak middle letter (wāw)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('يَوْمَ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعْلَ', ['f', 'a', 'l']),
                    'word_type_en': 'Time noun linked in an Iḍāfa compound',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Specified by "that moment"',
                        'case_en': 'Ends in -a (time expression: "on that Day")',
                        'subclass_en': 'Derived / Time Noun (Muḍāf)',
                    },
                    'family': [
                        {'ar': 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'en': 'Master of the Day of Judgment', 'ref': '1:4'},
                        {'ar': 'يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا', 'en': 'That Day it will report its news', 'ref': '99:4'},
                    ],
                },
                'irab': {
                    'en': 'Compound time phrase: يَوْمَ ("on the Day of") linked in Iḍāfa to إِذٍ ("that moment"), where the "-in" ending summarizes Ayahs 9–10.',
                },
                'insight': {
                    'title_en': 'Two whole verses compressed into two syllables',
                    'en': 'Instead of repeating "on the Day when the graves are overturned and the chests are exposed", Arabic compresses the entire scene into the "-in" ending of yawma-idhin!',
                },
            },
            {
                'position': 5,
                'text_uthmani': 'لَّخَبِيرٌۢ',
                'translation': '(is) surely All-Aware',
                'transliteration': 'lakhabīrun',
                'primary_category': 'ism',
                'subclass': 'derived',
                'has_emphasis': True,
                'role_en': 'Emphasis "surely" + final statement ("All-Aware")',
                'segments': [
                    LAM_TAWKID('لَّ'),
                    seg('خَبِيرٌۢ', 'ism', 'N', 'stem', 'Intensive Noun (All-Aware)',
                        'Means deeply, intimately aware of hidden inner realities.',
                        subclass='derived'),
                ],
                'sarf': {
                    'root': ['خ', 'ب', 'ر'],
                    'root_meaning': 'to know the hidden inner truth thoroughly; news/report',
                    'root_type_en': 'Regular 3-letter root',
                    'wazn': 'فَعِيل',
                    'stem_letters': letters('خَبِيرٌۢ', ['f', 'a', '-', 'l']),
                    'wazn_letters': letters('فَعِيلٌ', ['f', 'a', '-', 'l']),
                    'word_type_en': 'Intensive Divine Attribute (pattern faʿīl)',
                    'verb': None,
                    'noun': {
                        'gender_en': 'Masculine',
                        'number_en': 'Singular',
                        'definiteness_en': 'Indefinite ("-un" for greatness)',
                        'case_en': 'Ends in -un (main statement / predicate)',
                        'subclass_en': 'Derived / Intensive Noun',
                    },
                    'family': [
                        {'ar': 'وَٱللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ', 'en': 'and Allah is All-Aware of what you do', 'ref': '2:234'},
                        {'ar': 'ٱللَّطِيفُ ٱلْخَبِيرُ', 'en': 'the Subtle, the All-Aware', 'ref': '6:103'},
                        {'ar': 'يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا', 'en': 'That Day it will report its news', 'ref': '99:4'},
                    ],
                },
                'irab': {
                    'en': 'لَّ ("surely") emphasizes خَبِيرٌۢ ("All-Aware"), which ends in "-un" as the concluding predicate of the sūrah.',
                },
                'insight': {
                    'title_en': 'Why end with Khabīr ("All-Aware") rather than ʿAlīm ("All-Knowing")?',
                    'en': 'ʿIlm is broad knowledge, whereas khibra (Khabīr) is intimate knowledge of what lies hidden beneath the surface — answering Ayah 10 ("what is inside the chests is extracted") with precision.',
                },
            },
        ],
    },
}


def validate(payload):
    verses = json.load(open(VERSES_PATH, encoding='utf-8'))['100']['verses']
    verse_text = {v['verse_number']: v['text_uthmani'] for v in verses}
    assert len(payload['ayahs']) == 11, f"Expected 11 ayahs, got {len(payload['ayahs'])}"
    for num, ayah in payload['ayahs'].items():
        words = ayah['words']
        joined = ' '.join(w['text_uthmani'] for w in words)
        assert joined == verse_text[int(num)], f'Ayah {num} mismatch:\n{joined!r}\n{verse_text[int(num)]!r}'
        for w in words:
            seg_join = ''.join(s['text'] for s in w['segments'])
            assert seg_join == w['text_uthmani'], f"{w['text_uthmani']}: segments join to {seg_join}"
            sarf = w['sarf']
            if sarf:
                stem = next(s for s in w['segments'] if s['role'] == 'stem')
                stem_join = ''.join(l['t'] for l in sarf['stem_letters'])
                assert stem_join == stem['text'], f"{w['text_uthmani']}: {stem_join!r} != {stem['text']!r}"
                assert len(sarf['root']) in (3, 4), f"Invalid root length for {w['text_uthmani']}"
                labels = {l['r'] for l in sarf['stem_letters'] if l['r']}
                base_slots = {'f', 'a', 'l'} if len(sarf['root']) == 3 else {'f', 'a', 'l', 'l2'}
                expected = base_slots - set(sarf.get('deleted_radicals', []))
                flat = set()
                for lab in labels:
                    if lab == 'l2':
                        flat.add('l2')
                    else:
                        flat.update(list(lab))
                assert flat == expected, f"{w['text_uthmani']}: radicals {flat} vs {expected}"
                if w['primary_category'] == 'fil':
                    assert sarf.get('verb') and sarf['verb'].get('conjugation_table'), (
                        f"Verb {w['text_uthmani']} must have a full conjugation_table"
                    )
                if w.get('subclass') == 'plural':
                    assert sarf.get('noun', {}).get('singular_ar'), (
                        f"Plural word {w['text_uthmani']} must define singular_ar"
                    )
            else:
                assert w.get('sarf_note_en'), f"{w['text_uthmani']} needs a sarf note"


def main():
    payload = {
        'surah_number': 100,
        'surah_name': 'Al-ʿĀdiyāt',
        'surah_name_ar': 'العاديات',
        'total_verses': 11,
        'version': 3,
        'enhanced': True,
        'color_palette': 'surah_100',
        'sources': [
            'Quranic Arabic Corpus (corpus.quran.com) — morphology v0.4',
            'Quran.com word-by-word translation',
        ],
        'ayahs': {str(k): {'verse_key': f'100:{k}', 'verse_number': k, **v} for k, v in AYAHS.items()},
    }
    for ayah in payload['ayahs'].values():
        for w in ayah['words']:
            s = w['sarf']
            w['root'] = ' '.join(s['root']) if s else None
            w['root_meaning'] = s['root_meaning'] if s else None
            w['wazn'] = s['wazn'] if s else None
            w['color_palette'] = 'surah_100'
    payload = canon_all(payload)
    validate(payload)
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    total = sum(len(a['words']) for a in payload['ayahs'].values())
    print(f'Wrote {OUT_PATH} — {total} words across {len(payload["ayahs"])} ayahs, all checks passed.')


if __name__ == '__main__':
    main()
