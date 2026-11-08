# -*- coding: utf-8 -*-
"""
Builds the enhanced (v2) sarf + i'rab dataset for Surah Al-'Asr (103).

Morphological segmentation, roots, POS tags and verb forms are cross-checked
against the Quranic Arabic Corpus (corpus.quran.com, v0.4). Word glosses and
transliteration follow the Quran.com word-by-word data.

Every stem is split into letter clusters (base letter + its diacritics) and each
cluster is labelled with the radical it represents:
  'f' = fa' al-fi'l (1st radical), 'a' = 'ayn (2nd), 'l' = lam (3rd),
  'al' = 'ayn+lam merged by idgham (shadda), '-' = augment letter (za'id).
The script asserts that segments re-join to the exact Uthmani word, that each
stem's clusters re-join to the stem text, and that the words re-join to the
verse text in public/data/quran-verses.json.

Run:  python3 scripts/build-grammar-surah-103.py
"""
import json
import os
import unicodedata

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT_DIR, 'public', 'data', 'grammar', 'surah_103.json')
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


# ---------------------------------------------------------------------------
# Reusable segment definitions
# ---------------------------------------------------------------------------
def seg(text, category, tag, role, ar, en, desc_ar=None, desc_en=None):
    return {
        'text': text, 'category': category, 'tag': tag, 'role': role,
        'pos_name_ar': ar, 'pos_name_en': en,
        'desc_ar': desc_ar, 'desc_en': desc_en,
    }


AL_QAMARI = lambda: seg('ٱلْ', 'harf', 'DET', 'prefix', 'أل التعريف', 'Definite article',
                       'لام قمرية: تُنطق اللام', 'Moon-letter lām: the lām is pronounced')
AL_SHAMSI = lambda: seg('ٱل', 'harf', 'DET', 'prefix', 'أل التعريف', 'Definite article',
                       'لام شمسية: تُدغم اللام في الحرف التالي فيُشدَّد', 'Sun-letter lām: assimilated into the next letter (hence the shadda)')
WAW_ATF = lambda: seg('وَ', 'harf', 'CONJ', 'prefix', 'حرف عطف', 'Conjunction', 'واو العطف: تجمع بين المتعاطفين', 'Coordinating wāw: "and"')
BA_JARR = lambda: seg('بِ', 'harf', 'P', 'prefix', 'حرف جر', 'Preposition', 'باء الجر', 'Prepositional bā\': "with / to"')
WAW_JAMA = lambda text: seg(text, 'ism', 'PRON', 'suffix', 'واو الجماعة', 'Subject pronoun "they"',
                            'ضمير متصل في محل رفع فاعل، والألف بعده فارقة لا تُنطق',
                            'Attached pronoun (subject); the alif after it is silent (alif fāriqa)')

TAWASAW_SARF = {
    'root': ['و', 'ص', 'ي'],
    'root_meaning': 'to enjoin, entrust, give lasting counsel; to bequeath',
    'root_type_ar': 'لفيف مفروق', 'root_type_en': 'Doubly weak (1st & 3rd radicals weak, separated)',
    'wazn': 'تَفَاعَوْا', 'wazn_original': 'تَفَاعَلُوا',
    'stem_letters': letters('تَوَاصَ', ['-', 'f', '-', 'a']),
    'wazn_letters': letters('تَفَاعَ', ['-', 'f', '-', 'a']),
    'deleted_radicals': ['l'],
    'word_type_ar': 'فعل ماضٍ مزيد بحرفين (التاء والألف)',
    'word_type_en': 'Form VI perfect verb (augmented by tā\' and alif)',
    'verb': {
        'form': 'VI', 'pattern': 'تَفَاعَلَ – يَتَفَاعَلُ – تَفَاعُل',
        'meaning_of_form_ar': 'المشاركة والتبادل بين اثنين فأكثر',
        'meaning_of_form_en': 'Reciprocity — an action done mutually, to one another',
        'tense_ar': 'ماضٍ', 'tense_en': 'Perfect (past)',
        'person_ar': 'غائب – جمع – مذكر', 'person_en': '3rd person · masculine · plural',
        'voice_ar': 'مبني للمعلوم', 'voice_en': 'Active voice',
        'conjugation': [
            {'label_ar': 'الماضي', 'label_en': 'Perfect', 'ar': 'تَوَاصَى'},
            {'label_ar': 'المضارع', 'label_en': 'Imperfect', 'ar': 'يَتَوَاصَى'},
            {'label_ar': 'الأمر', 'label_en': 'Imperative', 'ar': 'تَوَاصَ'},
            {'label_ar': 'المصدر', 'label_en': 'Verbal noun', 'ar': 'تَوَاصٍ (التَّوَاصِي)'},
            {'label_ar': 'اسم الفاعل', 'label_en': 'Active participle', 'ar': 'مُتَوَاصٍ'},
        ],
    },
    'noun': None,
    'transformation': {
        'type_ar': 'إعلال بالقلب ثم بالحذف', 'type_en': 'Weak-letter change, then deletion',
        'ar': 'أصله «تَوَاصَيُوا»: تحرّكت الياء وانفتح ما قبلها فقُلبت ألفًا «تَوَاصَاوْا»، ثم حُذفت الألف لالتقاء الساكنين فصار «تَوَاصَوْا» على وزن «تَفَاعَوْا».',
        'en': 'Originally tawāṣayū: the yā\' (3rd radical) became an alif, which was then dropped to avoid two consecutive sukūns — leaving tawāṣaw on the pattern tafāʿaw.',
    },
    'family': [
        {'ar': 'وَصَّىٰ', 'en': 'he enjoined', 'ref': '2:132'},
        {'ar': 'ٱلْوَصِيَّةُ', 'en': 'the bequest / will', 'ref': '2:180'},
        {'ar': 'يُوصِيكُمُ', 'en': 'He instructs you', 'ref': '4:11'},
        {'ar': 'وَأَوْصَٰنِى', 'en': 'and He enjoined upon me', 'ref': '19:31'},
        {'ar': 'وَتَوَاصَوْا۟ بِٱلْمَرْحَمَةِ', 'en': 'and enjoined one another to mercy', 'ref': '90:17'},
    ],
}

TAWASAW_IRAB = {
    'ar': 'الواو: حرف عطف مبني على الفتح. تواصوا: فعل ماضٍ مبني على الفتح المقدّر على الألف المحذوفة لالتقاء الساكنين، والواو ضمير متصل مبني على السكون في محل رفع فاعل، والألف فارقة. والجملة معطوفة على جملة الصلة لا محل لها من الإعراب.',
    'en': 'wa: conjunction. tawāṣaw: perfect verb, built on an implied fatḥa over the deleted alif; the wāw is the attached subject pronoun (nominative position); the final alif is silent. The clause is coordinated with the relative clause and has no grammatical case.',
}


def tawasaw_word(position, insight):
    return {
        'position': position,
        'text_uthmani': 'وَتَوَاصَوْا۟',
        'translation': 'and enjoin (each other)',
        'transliteration': 'watawāṣaw',
        'primary_category': 'fil',
        'role_ar': 'معطوف على الصلة', 'role_en': 'Coordinated relative clause',
        'segments': [
            WAW_ATF(),
            seg('تَوَاصَ', 'fil', 'V', 'stem', 'فعل ماضٍ', 'Perfect verb', 'الوزن السادس: تَفَاعَلَ', 'Form VI: tafāʿala'),
            WAW_JAMA('وْا۟'),
        ],
        'sarf': TAWASAW_SARF,
        'irab': TAWASAW_IRAB,
        'insight': insight,
    }


# ---------------------------------------------------------------------------
# Surah Al-'Asr
# ---------------------------------------------------------------------------
AYAHS = {
    1: {
        'structure_ar': 'جملة القسم: واو القسم + المُقسَم به (العصر)، متعلقان بفعل محذوف تقديره: أُقسِمُ.',
        'structure_en': 'Oath clause: the wāw of oath + the thing sworn by (al-ʿaṣr), attached to an implied verb "I swear".',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'وَٱلْعَصْرِ',
                'translation': 'By the time',
                'transliteration': 'wal-ʿaṣri',
                'primary_category': 'ism',
                'role_ar': 'مُقسَم به', 'role_en': 'The thing sworn by',
                'segments': [
                    seg('وَ', 'harf', 'P', 'prefix', 'واو القسم', 'Wāw of oath', 'حرف جر يفيد القسم', 'A preposition used for swearing an oath: "By…"'),
                    AL_QAMARI(),
                    seg('عَصْرِ', 'ism', 'N', 'stem', 'اسم مجرور', 'Noun (genitive)', 'المُقسَم به', 'The thing sworn by'),
                ],
                'sarf': {
                    'root': ['ع', 'ص', 'ر'],
                    'root_meaning': 'to press, squeeze out; an age or epoch; late afternoon',
                    'root_type_ar': 'صحيح سالم', 'root_type_en': 'Sound root (no weak letters)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('عَصْرِ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعْلِ', ['f', 'a', 'l']),
                    'word_type_ar': 'اسم ثلاثي مجرد (أصله مصدر «عَصَرَ»)',
                    'word_type_en': 'Triliteral noun (originally the verbal noun of ʿaṣara, "to press")',
                    'verb': None,
                    'noun': {'gender_ar': 'مذكر', 'gender_en': 'Masculine', 'number_ar': 'مفرد', 'number_en': 'Singular',
                             'definiteness_ar': 'معرفة بأل', 'definiteness_en': 'Definite (al-)', 'case_ar': 'مجرور', 'case_en': 'Genitive'},
                    'family': [
                        {'ar': 'أَعْصِرُ', 'en': 'I press (grapes)', 'ref': '12:36'},
                        {'ar': 'يَعْصِرُونَ', 'en': 'they will press (juice)', 'ref': '12:49'},
                        {'ar': 'ٱلْمُعْصِرَٰتِ', 'en': 'the rain-clouds (squeezed)', 'ref': '78:14'},
                        {'ar': 'إِعْصَارٌ', 'en': 'a whirlwind', 'ref': '2:266'},
                    ],
                },
                'irab': {
                    'ar': 'الواو: واو القسم، حرف جر مبني على الفتح. العصرِ: اسم مجرور بالواو وعلامة جره الكسرة الظاهرة، والجار والمجرور متعلقان بفعل محذوف تقديره: أُقسِمُ.',
                    'en': 'wa: the wāw of oath, a preposition. al-ʿaṣri: genitive noun governed by the wāw, marked by kasra. The phrase attaches to an omitted verb: "I swear".',
                },
                'insight': {
                    'title_ar': 'الزمن الذي يُعصَر', 'title_en': 'Time that is being squeezed',
                    'en': 'The root ʿ-ṣ-r means to press or squeeze out. Time is constantly being "pressed" — each moment is squeezed out of your life and never returns. By swearing by al-ʿaṣr, the passing of time itself becomes the witness to the verdict that follows.',
                },
            },
        ],
    },
    2: {
        'structure_ar': 'جواب القسم: إنّ + اسمها (الإنسان) + اللام المزحلقة + خبرها شبه الجملة (في خسر). والجملة لا محل لها من الإعراب لأنها جواب القسم.',
        'structure_en': 'Answer to the oath: inna + its subject (al-insān) + the emphatic lām + its predicate, the prepositional phrase (fī khusr).',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'إِنَّ',
                'translation': 'Indeed',
                'transliteration': 'inna',
                'primary_category': 'harf',
                'role_ar': 'حرف توكيد ونصب', 'role_en': 'Particle of emphasis',
                'segments': [
                    seg('إِنَّ', 'harf', 'ACC', 'stem', 'حرف توكيد ونصب', 'Accusative particle',
                        'من الحروف المشبهة بالفعل: تنصب الاسم وترفع الخبر', 'One of the "verb-like particles": makes its subject accusative'),
                ],
                'sarf': None,
                'sarf_note_ar': 'الحروف مبنية لا تتصرّف، فلا جذر لها ولا ميزان صرفي.',
                'sarf_note_en': 'Particles are fixed (mabnī) and never inflect, so they have no root pattern (wazn).',
                'irab': {
                    'ar': 'حرف توكيد ونصب مبني على الفتح لا محل له من الإعراب.',
                    'en': 'Particle of emphasis and accusative, built on fatḥa, with no grammatical case of its own.',
                },
                'insight': {
                    'title_ar': 'توكيد ثلاثي', 'title_en': 'A triple emphasis',
                    'en': 'The verdict is stressed three times: by the oath (wal-ʿaṣr), by inna, and by the lām in lafī. The Qur\'ān addresses a listener who would deny it — because no one naturally believes they are losing.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'ٱلْإِنسَـٰنَ',
                'translation': 'mankind',
                'transliteration': 'l-insāna',
                'primary_category': 'ism',
                'role_ar': 'اسم إنّ', 'role_en': 'Subject of inna',
                'segments': [
                    seg('ٱلْ', 'harf', 'DET', 'prefix', 'أل الجنسية', 'Generic definite article',
                        'لام قمرية؛ وأل هنا لاستغراق الجنس: كلّ إنسان', 'Moon-letter lām; "al" here covers the whole species: every human being'),
                    seg('إِنسَـٰنَ', 'ism', 'N', 'stem', 'اسم منصوب', 'Noun (accusative)', 'اسم إنّ', 'Subject of inna'),
                ],
                'sarf': {
                    'root': ['أ', 'ن', 'س'],
                    'root_meaning': 'to be familiar, sociable, at ease with; to perceive',
                    'root_type_ar': 'مهموز الفاء', 'root_type_en': 'Hamzated root (1st radical is hamza)',
                    'wazn': 'فِعْلَان',
                    'stem_letters': letters('إِنسَـٰنَ', ['f', 'a', 'l', '-', '-']),
                    'wazn_letters': letters('فِعْلَانَ', ['f', 'a', 'l', '-', '-']),
                    'word_type_ar': 'اسم جنس',
                    'word_type_en': 'Generic noun (ism jins)',
                    'verb': None,
                    'noun': {'gender_ar': 'مذكر', 'gender_en': 'Masculine', 'number_ar': 'مفرد (يدلّ على الجنس)', 'number_en': 'Singular (denotes the species)',
                             'definiteness_ar': 'معرفة بأل', 'definiteness_en': 'Definite (al-)', 'case_ar': 'منصوب', 'case_en': 'Accusative'},
                    'scholarly_note_ar': 'اختُلف في أصله: من «أنس» على وزن «فِعْلَان»، وقيل من «نسي» على وزن «إِفْعَان».',
                    'scholarly_note_en': 'Scholars differ: from ʾ-n-s (familiarity) on fiʿlān, or from n-s-y (forgetfulness) on ifʿān — man is both the sociable one and the forgetful one.',
                    'family': [
                        {'ar': 'ٱلْإِنسِ', 'en': 'mankind', 'ref': '6:112'},
                        {'ar': 'أُنَاسٍ', 'en': 'people', 'ref': '2:60'},
                        {'ar': 'ءَانَسَ', 'en': 'he perceived', 'ref': '28:29'},
                        {'ar': 'تَسْتَأْنِسُوا۟', 'en': 'you ask permission (become familiar)', 'ref': '24:27'},
                    ],
                },
                'irab': {
                    'ar': 'اسم إنّ منصوب وعلامة نصبه الفتحة الظاهرة على آخره.',
                    'en': 'The subject (ism) of inna, accusative, marked by the visible fatḥa.',
                },
                'insight': {
                    'title_ar': 'أل الجنسية', 'title_en': 'Not one man — all of humanity',
                    'en': 'The "al" here is generic (al-jinsiyya): it refers to the human species as a whole, not a specific person. That is exactly why an exception (illā…) can follow — you can only make an exception out of a complete category.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'لَفِى',
                'translation': '(is) surely, in',
                'transliteration': 'lafī',
                'primary_category': 'harf',
                'role_ar': 'لام التوكيد + حرف جر', 'role_en': 'Emphatic lām + preposition',
                'segments': [
                    seg('لَ', 'harf', 'EMPH', 'prefix', 'اللام المزحلقة', 'Emphatic lām', 'لام التوكيد زُحلقت إلى الخبر', 'The lām of emphasis, "slid" onto the predicate'),
                    seg('فِى', 'harf', 'P', 'stem', 'حرف جر', 'Preposition', 'تفيد الظرفية: «في داخل»', 'Denotes containment: "inside"'),
                ],
                'sarf': None,
                'sarf_note_ar': 'كلاهما حرف مبني، فلا جذر لهما ولا ميزان.',
                'sarf_note_en': 'Both are particles (mabnī): no root, no pattern.',
                'irab': {
                    'ar': 'اللام: اللام المزحلقة للتوكيد، حرف مبني على الفتح لا محل له من الإعراب. في: حرف جر مبني على السكون.',
                    'en': 'la-: the "slid" lām of emphasis, no grammatical case. fī: preposition, built on sukūn.',
                },
                'insight': {
                    'title_ar': 'اللام المزحلقة', 'title_en': 'The lām that "slid" forward',
                    'en': 'Grammarians call it al-lām al-muzaḥlaqa — the lām that slid. It belongs at the start of the sentence, but two emphasizers (inna and la-) may not stand side by side, so it slides onto the predicate. And note fī ("inside"): mankind is not near loss — it is immersed in it, contained within it.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'خُسْرٍ',
                'translation': 'loss',
                'transliteration': 'khus\'rin',
                'primary_category': 'ism',
                'role_ar': 'خبر إنّ (شبه جملة)', 'role_en': 'Predicate of inna (with fī)',
                'segments': [
                    seg('خُسْرٍ', 'ism', 'N', 'stem', 'اسم مجرور', 'Noun (genitive)', 'نكرة منوّنة', 'Indefinite, with tanwīn'),
                ],
                'sarf': {
                    'root': ['خ', 'س', 'ر'],
                    'root_meaning': 'to lose, suffer loss (esp. of capital in trade); to diminish',
                    'root_type_ar': 'صحيح سالم', 'root_type_en': 'Sound root (no weak letters)',
                    'wazn': 'فُعْل',
                    'stem_letters': letters('خُسْرٍ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فُعْلٍ', ['f', 'a', 'l']),
                    'word_type_ar': 'مصدر الفعل «خَسِرَ يَخْسَرُ»',
                    'word_type_en': 'Verbal noun (maṣdar) of khasira – yakhsaru',
                    'verb': None,
                    'noun': {'gender_ar': 'مذكر', 'gender_en': 'Masculine', 'number_ar': 'مفرد', 'number_en': 'Singular',
                             'definiteness_ar': 'نكرة (تنوين)', 'definiteness_en': 'Indefinite (tanwīn)', 'case_ar': 'مجرور', 'case_en': 'Genitive'},
                    'family': [
                        {'ar': 'خَسِرَ ٱلدُّنْيَا وَٱلْءَاخِرَةَ', 'en': 'he lost this world and the next', 'ref': '22:11'},
                        {'ar': 'ٱلْخَٰسِرُونَ', 'en': 'the losers', 'ref': '2:27'},
                        {'ar': 'خُسْرَانًا مُّبِينًا', 'en': 'a manifest loss', 'ref': '4:119'},
                        {'ar': 'بِٱلْأَخْسَرِينَ', 'en': 'the greatest losers', 'ref': '18:103'},
                        {'ar': 'وَلَا تُخْسِرُوا۟ ٱلْمِيزَانَ', 'en': 'and do not short the scale', 'ref': '55:9'},
                    ],
                },
                'irab': {
                    'ar': 'اسم مجرور بـ«في» وعلامة جره الكسرة الظاهرة (تنوين الكسر)، والجار والمجرور متعلقان بمحذوف خبر إنّ.',
                    'en': 'Genitive noun governed by fī, marked by kasra (with tanwīn). The phrase fī khusr attaches to an omitted predicate of inna.',
                },
                'insight': {
                    'title_ar': 'تنكير للتهويل', 'title_en': 'An indefinite of magnitude',
                    'en': 'Khusr is indefinite (nakira) with tanwīn — not "the loss" but "a loss" so vast it is left undefined (tanwīn al-tahwīl). And khasira is a trader\'s word: your life is the capital, and every moment of time is currency being spent.',
                },
            },
        ],
    },
    3: {
        'structure_ar': 'استثناء: إلّا + المستثنى (الذين) + أربع جمل صلة متعاطفة: آمنوا، وعملوا الصالحات، وتواصوا بالحق، وتواصوا بالصبر.',
        'structure_en': 'Exception: illā + the excepted (alladhīna) + four coordinated relative clauses — believe, do righteous deeds, counsel one another to truth, counsel one another to patience.',
        'words': [
            {
                'position': 1,
                'text_uthmani': 'إِلَّا',
                'translation': 'Except',
                'transliteration': 'illā',
                'primary_category': 'harf',
                'role_ar': 'أداة استثناء', 'role_en': 'Particle of exception',
                'segments': [
                    seg('إِلَّا', 'harf', 'EXP', 'stem', 'أداة استثناء', 'Exceptive particle', 'تُخرج ما بعدها من حكم ما قبلها', 'Removes what follows from the ruling before it'),
                ],
                'sarf': None,
                'sarf_note_ar': 'حرف مبني لا يدخله التصريف.',
                'sarf_note_en': 'A fixed particle — no morphological pattern.',
                'irab': {
                    'ar': 'أداة استثناء مبنية على السكون لا محل لها من الإعراب.',
                    'en': 'Particle of exception, built on sukūn, with no grammatical case.',
                },
                'insight': {
                    'title_ar': 'باب النجاة الوحيد', 'title_en': 'The single door of rescue',
                    'en': 'One word lifts people out of a universal verdict. The exception is not by wealth, lineage or intellect — only by four qualities that follow, all of which are within anyone\'s reach.',
                },
            },
            {
                'position': 2,
                'text_uthmani': 'ٱلَّذِينَ',
                'translation': 'those who',
                'transliteration': 'alladhīna',
                'primary_category': 'ism',
                'role_ar': 'مستثنى', 'role_en': 'The excepted',
                'segments': [
                    seg('ٱلَّذِينَ', 'ism', 'REL', 'stem', 'اسم موصول', 'Relative pronoun', 'لجمع المذكر العاقل', 'For a masculine plural group'),
                ],
                'sarf': None,
                'sarf_note_ar': 'الأسماء المبنية (كالأسماء الموصولة) لا تدخلها الأوزان الصرفية؛ فالصرف يختص بالأسماء المعربة والأفعال المتصرفة.',
                'sarf_note_en': 'Built-in (mabnī) nouns such as relative pronouns are outside the scope of ṣarf, which deals only with inflecting nouns and verbs.',
                'irab': {
                    'ar': 'اسم موصول مبني على الفتح في محل نصب مستثنى بـ«إلّا».',
                    'en': 'Relative pronoun, built on fatḥa, in the accusative position as the excepted (mustathnā).',
                },
                'insight': {
                    'title_ar': 'الهوية بالعمل', 'title_en': 'Identity defined by action',
                    'en': 'A relative pronoun is empty until its ṣila (relative clause) defines it. "Those who…" means nothing on its own — in this sūrah a person is identified not by name or tribe, but by what they believe and do.',
                },
            },
            {
                'position': 3,
                'text_uthmani': 'ءَامَنُوا۟',
                'translation': 'believe',
                'transliteration': 'āmanū',
                'primary_category': 'fil',
                'role_ar': 'صلة الموصول', 'role_en': 'Relative clause',
                'segments': [
                    seg('ءَامَنُ', 'fil', 'V', 'stem', 'فعل ماضٍ', 'Perfect verb', 'الوزن الرابع: أَفْعَلَ', 'Form IV: afʿala'),
                    WAW_JAMA('وا۟'),
                ],
                'sarf': {
                    'root': ['أ', 'م', 'ن'],
                    'root_meaning': 'safety, security, trust; to believe, have faith',
                    'root_type_ar': 'مهموز الفاء', 'root_type_en': 'Hamzated root (1st radical is hamza)',
                    'wazn': 'أَفْعَلُوا',
                    'stem_letters': letters('ءَامَنُ', ['-', 'f', 'a', 'l']),
                    'wazn_letters': letters('أَفْعَلُ', ['-', 'f', 'a', 'l']),
                    'word_type_ar': 'فعل ماضٍ مزيد بحرف (الهمزة)',
                    'word_type_en': 'Form IV perfect verb (augmented by one letter: hamza)',
                    'verb': {
                        'form': 'IV', 'pattern': 'أَفْعَلَ – يُفْعِلُ – إِفْعَال',
                        'meaning_of_form_ar': 'التعدية: جعل الشيء ذا صفة',
                        'meaning_of_form_en': 'Causative — to make or grant something',
                        'tense_ar': 'ماضٍ', 'tense_en': 'Perfect (past)',
                        'person_ar': 'غائب – جمع – مذكر', 'person_en': '3rd person · masculine · plural',
                        'voice_ar': 'مبني للمعلوم', 'voice_en': 'Active voice',
                        'conjugation': [
                            {'label_ar': 'الماضي', 'label_en': 'Perfect', 'ar': 'ءَامَنَ'},
                            {'label_ar': 'المضارع', 'label_en': 'Imperfect', 'ar': 'يُؤْمِنُ'},
                            {'label_ar': 'الأمر', 'label_en': 'Imperative', 'ar': 'ءَامِنْ'},
                            {'label_ar': 'المصدر', 'label_en': 'Verbal noun', 'ar': 'إِيمَان'},
                            {'label_ar': 'اسم الفاعل', 'label_en': 'Active participle', 'ar': 'مُؤْمِن'},
                        ],
                    },
                    'noun': None,
                    'transformation': {
                        'type_ar': 'إبدال', 'type_en': 'Hamza substitution',
                        'ar': 'أصله «أَأْمَنَ»: اجتمعت همزتان والثانية ساكنة، فأُبدلت الثانية ألفًا من جنس حركة الأولى فصار «آمَنَ».',
                        'en': 'Originally aʾmana: two hamzas met with the second one silent, so the second (the root\'s fāʾ) turned into a long alif — āmana.',
                    },
                    'family': [
                        {'ar': 'بَلَدًا ءَامِنًا', 'en': 'a secure land', 'ref': '2:126'},
                        {'ar': 'ٱلْأَمَانَةَ', 'en': 'the trust', 'ref': '33:72'},
                        {'ar': 'ٱلْأَمِينُ', 'en': 'the trustworthy', 'ref': '26:193'},
                        {'ar': 'ٱلْمُؤْمِنُ', 'en': 'the Granter of security (a Divine Name)', 'ref': '59:23'},
                        {'ar': 'ٱلْإِيمَٰنِ', 'en': 'faith', 'ref': '49:7'},
                    ],
                },
                'irab': {
                    'ar': 'فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، والواو ضمير متصل مبني على السكون في محل رفع فاعل، والألف فارقة. والجملة صلة الموصول لا محل لها من الإعراب.',
                    'en': 'Perfect verb built on ḍamma because of the attached wāw; the wāw is the subject pronoun (nominative position); the alif is silent. The clause is the ṣila of the relative pronoun and has no grammatical case.',
                },
                'insight': {
                    'title_ar': 'الإيمان: أمانٌ وثقة', 'title_en': 'Faith as security and trust',
                    'en': 'Form IV often means "to make/grant". From amina (to be safe) comes āmana: to trust someone so completely that you feel safe with them. Īmān is not mere information — it is a relationship of trust in which the heart finds security.',
                },
            },
            {
                'position': 4,
                'text_uthmani': 'وَعَمِلُوا۟',
                'translation': 'and do',
                'transliteration': 'waʿamilū',
                'primary_category': 'fil',
                'role_ar': 'معطوف على الصلة', 'role_en': 'Coordinated relative clause',
                'segments': [
                    WAW_ATF(),
                    seg('عَمِلُ', 'fil', 'V', 'stem', 'فعل ماضٍ', 'Perfect verb', 'ثلاثي مجرد: فَعِلَ يَفْعَلُ', 'Form I: faʿila – yafʿalu'),
                    WAW_JAMA('وا۟'),
                ],
                'sarf': {
                    'root': ['ع', 'م', 'ل'],
                    'root_meaning': 'to work, act, do deeds with intention and effort',
                    'root_type_ar': 'صحيح سالم', 'root_type_en': 'Sound root (no weak letters)',
                    'wazn': 'فَعِلُوا',
                    'stem_letters': letters('عَمِلُ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعِلُ', ['f', 'a', 'l']),
                    'word_type_ar': 'فعل ماضٍ ثلاثي مجرد',
                    'word_type_en': 'Form I perfect verb (bare triliteral)',
                    'verb': {
                        'form': 'I', 'pattern': 'فَعِلَ – يَفْعَلُ (الباب الرابع)',
                        'meaning_of_form_ar': 'الفعل المجرد: أصل المعنى',
                        'meaning_of_form_en': 'Base form — the core meaning of the root',
                        'tense_ar': 'ماضٍ', 'tense_en': 'Perfect (past)',
                        'person_ar': 'غائب – جمع – مذكر', 'person_en': '3rd person · masculine · plural',
                        'voice_ar': 'مبني للمعلوم', 'voice_en': 'Active voice',
                        'conjugation': [
                            {'label_ar': 'الماضي', 'label_en': 'Perfect', 'ar': 'عَمِلَ'},
                            {'label_ar': 'المضارع', 'label_en': 'Imperfect', 'ar': 'يَعْمَلُ'},
                            {'label_ar': 'الأمر', 'label_en': 'Imperative', 'ar': 'ٱعْمَلْ'},
                            {'label_ar': 'المصدر', 'label_en': 'Verbal noun', 'ar': 'عَمَل'},
                            {'label_ar': 'اسم الفاعل', 'label_en': 'Active participle', 'ar': 'عَامِل'},
                        ],
                    },
                    'noun': None,
                    'family': [
                        {'ar': 'عَمَلًا صَٰلِحًا', 'en': 'a righteous deed', 'ref': '18:110'},
                        {'ar': 'أَعْمَٰلُهُمْ', 'en': 'their deeds', 'ref': '18:105'},
                        {'ar': 'عَامِلَةٌ نَّاصِبَةٌ', 'en': 'labouring, exhausted', 'ref': '88:3'},
                        {'ar': 'ٱعْمَلُوا۟', 'en': 'work! (act!)', 'ref': '9:105'},
                    ],
                },
                'irab': {
                    'ar': 'الواو: حرف عطف مبني على الفتح. عملوا: فعل ماضٍ مبني على الضم لاتصاله بواو الجماعة، والواو ضمير متصل في محل رفع فاعل، والألف فارقة. والجملة معطوفة على جملة «آمنوا» لا محل لها من الإعراب.',
                    'en': 'wa: conjunction. ʿamilū: perfect verb built on ḍamma; the wāw is the subject pronoun; the alif is silent. The clause is coordinated with "āmanū" and has no grammatical case.',
                },
                'insight': {
                    'title_ar': 'العمل لا مجرد الفعل', 'title_en': 'ʿAmal, not just fiʿl',
                    'en': 'Arabic has two words for doing: fiʿl (any act) and ʿamal (deliberate, sustained effort with intention). The Qur\'ān pairs belief with ʿamal — faith must become a steady practice, not a single moment.',
                },
            },
            {
                'position': 5,
                'text_uthmani': 'ٱلصَّـٰلِحَـٰتِ',
                'translation': 'righteous deeds',
                'transliteration': 'l-ṣāliḥāti',
                'primary_category': 'ism',
                'role_ar': 'مفعول به', 'role_en': 'Direct object',
                'segments': [
                    AL_SHAMSI(),
                    seg('صَّـٰلِحَـٰتِ', 'ism', 'N', 'stem', 'اسم فاعل (جمع مؤنث سالم)', 'Active participle (fem. plural)', 'صفة لموصوف محذوف: الأعمالَ الصالحات', 'Adjective of an omitted noun: (the) righteous (deeds)'),
                ],
                'sarf': {
                    'root': ['ص', 'ل', 'ح'],
                    'root_meaning': 'to be sound, right, fitting; to repair, set right',
                    'root_type_ar': 'صحيح سالم', 'root_type_en': 'Sound root (no weak letters)',
                    'wazn': 'فَاعِلَات',
                    'stem_letters': letters('صَّـٰلِحَـٰتِ', ['f', '-', 'a', 'l', '-', '-']),
                    'wazn_letters': letters('فَاعِلَاتِ', ['f', '-', 'a', 'l', '-', '-']),
                    'word_type_ar': 'اسم فاعل من «صَلَحَ» — جمع مؤنث سالم',
                    'word_type_en': 'Active participle of ṣalaḥa — feminine sound plural',
                    'verb': None,
                    'noun': {'gender_ar': 'مؤنث', 'gender_en': 'Feminine', 'number_ar': 'جمع مؤنث سالم', 'number_en': 'Sound feminine plural',
                             'definiteness_ar': 'معرفة بأل', 'definiteness_en': 'Definite (al-)', 'case_ar': 'منصوب (بالكسرة)', 'case_en': 'Accusative (marked by kasra)'},
                    'family': [
                        {'ar': 'صَٰلِحًا', 'en': 'righteous', 'ref': '18:110'},
                        {'ar': 'ٱلْإِصْلَٰحَ', 'en': 'reform, setting right', 'ref': '11:88'},
                        {'ar': 'مُصْلِحُونَ', 'en': 'reformers', 'ref': '2:11'},
                        {'ar': 'وَٱلصُّلْحُ خَيْرٌ', 'en': 'and reconciliation is best', 'ref': '4:128'},
                    ],
                },
                'irab': {
                    'ar': 'مفعول به منصوب وعلامة نصبه الكسرة نيابةً عن الفتحة لأنه جمع مؤنث سالم.',
                    'en': 'Direct object, accusative — but marked by kasra instead of fatḥa, because sound feminine plurals take kasra in the accusative.',
                },
                'insight': {
                    'title_ar': 'حذف الموصوف للتعميم', 'title_en': 'A dropped noun that widens the meaning',
                    'en': 'Ṣāliḥāt is an adjective whose noun was left out: (al-aʿmāl) al-ṣāliḥāt, "(the) righteous (deeds)". Omitting the noun opens it to every kind of good. And ṣ-l-ḥ means "fitting, repairing" — a righteous deed fits its place and mends what is broken.',
                },
            },
            tawasaw_word(6, {
                'title_ar': 'تفاعَل: التبادل', 'title_en': 'Counsel that flows both ways',
                'en': 'Form VI (tafāʿala) expresses mutuality: everyone both gives and receives. Tawāṣaw is not "they lectured others" but "they counselled one another" — no one is only a preacher, and no one is only a listener. Waṣiyya is weighty, lasting counsel: the same word used for a dying person\'s final will.',
            }),
            {
                'position': 7,
                'text_uthmani': 'بِٱلْحَقِّ',
                'translation': 'to the truth',
                'transliteration': 'bil-ḥaqqi',
                'primary_category': 'ism',
                'role_ar': 'جار ومجرور متعلق بـ«تواصوا»', 'role_en': 'Prepositional phrase (linked to tawāṣaw)',
                'segments': [
                    BA_JARR(),
                    AL_QAMARI(),
                    seg('حَقِّ', 'ism', 'N', 'stem', 'اسم مجرور', 'Noun (genitive)', 'مصدر في الأصل', 'Originally a verbal noun'),
                ],
                'sarf': {
                    'root': ['ح', 'ق', 'ق'],
                    'root_meaning': 'to be true, firmly established, binding; a right or due',
                    'root_type_ar': 'مضعّف ثلاثي', 'root_type_en': 'Doubled root (2nd & 3rd radicals identical)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('حَقِّ', ['f', 'al']),
                    'wazn_letters': letters('فَعْلِ', ['f', 'a', 'l']),
                    'word_type_ar': 'اسم ثلاثي (مصدر «حَقَّ يَحِقُّ» في الأصل)',
                    'word_type_en': 'Triliteral noun (originally the maṣdar of ḥaqqa – yaḥiqqu)',
                    'verb': None,
                    'noun': {'gender_ar': 'مذكر', 'gender_en': 'Masculine', 'number_ar': 'مفرد', 'number_en': 'Singular',
                             'definiteness_ar': 'معرفة بأل', 'definiteness_en': 'Definite (al-)', 'case_ar': 'مجرور', 'case_en': 'Genitive'},
                    'transformation': {
                        'type_ar': 'إدغام', 'type_en': 'Assimilation (idghām)',
                        'ar': 'أصله «حَقْقٌ»: اجتمع حرفان متماثلان أولهما ساكن، فأُدغم الأول في الثاني فصار «حَقّ» — والشدّة تجمع العين واللام.',
                        'en': 'Originally ḥaqq-q: two identical letters met, the first silent, so they merged into one doubled letter. The shadda holds both the ʿayn and the lām of the pattern.',
                    },
                    'family': [
                        {'ar': 'لَقَدْ حَقَّ ٱلْقَوْلُ', 'en': 'the word has come true', 'ref': '36:7'},
                        {'ar': 'ٱلْحَآقَّةُ', 'en': 'the Inevitable Reality', 'ref': '69:1'},
                        {'ar': 'حَقِيقٌ', 'en': 'obligated, worthy', 'ref': '7:105'},
                        {'ar': 'لِيُحِقَّ ٱلْحَقَّ', 'en': 'to establish the truth', 'ref': '8:8'},
                    ],
                },
                'irab': {
                    'ar': 'الباء: حرف جر مبني على الكسر. الحقِّ: اسم مجرور بالباء وعلامة جره الكسرة الظاهرة، والجار والمجرور متعلقان بالفعل «تواصوا».',
                    'en': 'bi-: preposition. al-ḥaqqi: genitive noun, marked by kasra. The phrase attaches to the verb tawāṣaw.',
                },
                'insight': {
                    'title_ar': 'الحق: الثابت الملزِم', 'title_en': 'Truth that makes a claim on you',
                    'en': 'Al-ḥaqq is what is firmly established and binding — truth that demands something of you. Al-Ḥāqqa, a name of the Day of Judgment, comes from the same root. Counselling with al-ḥaqq covers truth in belief and the rights owed to others.',
                },
            },
            tawasaw_word(8, {
                'title_ar': 'لماذا تكرّر الفعل؟', 'title_en': 'Why repeat the verb?',
                'en': 'The verse could have said "counselled one another to truth and patience". Repeating tawāṣaw makes each counsel its own independent act: urging truth and urging patience are two separate duties — and the second is needed precisely because standing for truth brings hardship.',
            }),
            {
                'position': 9,
                'text_uthmani': 'بِٱلصَّبْرِ',
                'translation': 'to [the] patience',
                'transliteration': 'bil-ṣabri',
                'primary_category': 'ism',
                'role_ar': 'جار ومجرور متعلق بـ«تواصوا»', 'role_en': 'Prepositional phrase (linked to tawāṣaw)',
                'segments': [
                    BA_JARR(),
                    AL_SHAMSI(),
                    seg('صَّبْرِ', 'ism', 'N', 'stem', 'اسم مجرور', 'Noun (genitive)', 'مصدر', 'Verbal noun'),
                ],
                'sarf': {
                    'root': ['ص', 'ب', 'ر'],
                    'root_meaning': 'to restrain, hold back, bind firmly; to persevere',
                    'root_type_ar': 'صحيح سالم', 'root_type_en': 'Sound root (no weak letters)',
                    'wazn': 'فَعْل',
                    'stem_letters': letters('صَّبْرِ', ['f', 'a', 'l']),
                    'wazn_letters': letters('فَعْلِ', ['f', 'a', 'l']),
                    'word_type_ar': 'مصدر الفعل «صَبَرَ يَصْبِرُ»',
                    'word_type_en': 'Verbal noun (maṣdar) of ṣabara – yaṣbiru',
                    'verb': None,
                    'noun': {'gender_ar': 'مذكر', 'gender_en': 'Masculine', 'number_ar': 'مفرد', 'number_en': 'Singular',
                             'definiteness_ar': 'معرفة بأل', 'definiteness_en': 'Definite (al-)', 'case_ar': 'مجرور', 'case_en': 'Genitive'},
                    'family': [
                        {'ar': 'ٱصْبِرُوا۟ وَصَابِرُوا۟', 'en': 'be patient and outlast (in patience)', 'ref': '3:200'},
                        {'ar': 'ٱلصَّٰبِرِينَ', 'en': 'the patient ones', 'ref': '2:155'},
                        {'ar': 'صَبَّارٍ شَكُورٍ', 'en': 'deeply patient, grateful', 'ref': '14:5'},
                        {'ar': 'وَٱصْطَبِرْ', 'en': 'and be steadfast', 'ref': '19:65'},
                    ],
                },
                'irab': {
                    'ar': 'الباء: حرف جر مبني على الكسر. الصبرِ: اسم مجرور بالباء وعلامة جره الكسرة الظاهرة، والجار والمجرور متعلقان بالفعل «تواصوا» الثاني.',
                    'en': 'bi-: preposition. al-ṣabri: genitive noun, marked by kasra. The phrase attaches to the second tawāṣaw.',
                },
                'insight': {
                    'title_ar': 'الصبر: حبسٌ إيجابي', 'title_en': 'Patience is active restraint',
                    'en': 'Ṣ-b-r means to hold back, to bind something firmly in place. Ṣabr is not passive waiting: it is holding the self firm upon obedience, away from sin, and steady through hardship. (The shadda on ṣ comes from the sun-letter "al", not from the root.)',
                },
            },
        ],
    },
}


def validate(payload):
    verses = json.load(open(VERSES_PATH, encoding='utf-8'))['103']['verses']
    verse_text = {v['verse_number']: v['text_uthmani'] for v in verses}
    for num, ayah in payload['ayahs'].items():
        words = ayah['words']
        joined = ' '.join(w['text_uthmani'] for w in words)
        assert joined == verse_text[int(num)], f'Ayah {num} mismatch:\n{joined}\n{verse_text[int(num)]}'
        for w in words:
            seg_join = ''.join(s['text'] for s in w['segments'])
            assert seg_join == w['text_uthmani'], f"{w['text_uthmani']}: segments join to {seg_join}"
            sarf = w['sarf']
            if sarf:
                stem = next(s for s in w['segments'] if s['role'] == 'stem')
                stem_join = ''.join(l['t'] for l in sarf['stem_letters'])
                assert stem_join == stem['text'], f'{stem_join} != {stem["text"]}'
                assert len(sarf['root']) == 3
                labels = {l['r'] for l in sarf['stem_letters'] if l['r']}
                expected = {'f', 'a', 'l'} - set(sarf.get('deleted_radicals', []))
                flat = set()
                for lab in labels:
                    flat.update(list(lab))
                assert flat == expected, f"{w['text_uthmani']}: radicals {flat} vs {expected}"
            else:
                assert w.get('sarf_note_en'), f"{w['text_uthmani']} needs a sarf note"


def main():
    payload = {
        'surah_number': 103,
        'surah_name': 'Al-ʿAsr',
        'surah_name_ar': 'العصر',
        'total_verses': 3,
        'version': 2,
        'enhanced': True,
        'sources': [
            'Quranic Arabic Corpus (corpus.quran.com) — morphology v0.4',
            'Quran.com word-by-word translation',
        ],
        'ayahs': {str(k): {'verse_key': f'103:{k}', 'verse_number': k, **v} for k, v in AYAHS.items()},
    }
    # Normalize: give every word a flat root string for backwards compatibility
    for ayah in payload['ayahs'].values():
        for w in ayah['words']:
            s = w['sarf']
            w['root'] = ' '.join(s['root']) if s else None
            w['root_meaning'] = s['root_meaning'] if s else None
            w['wazn'] = s['wazn'] if s else None
    payload = canon_all(payload)
    validate(payload)
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    total = sum(len(a['words']) for a in payload['ayahs'].values())
    print(f'Wrote {OUT_PATH} — {total} words, all checks passed.')


if __name__ == '__main__':
    main()
