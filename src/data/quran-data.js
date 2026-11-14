// Offline Quran data parsed from quran-uthmani.xml
// This provides complete offline access to all Quran verses

// Surah information with English names and metadata
export const surahsInfo = [
  { id: 1, name_simple: "Al-Fatihah", name_arabic: "الفاتحة", translated_name: { name: "The Opening" }, revelation_place: "makkah", verses_count: 7, arabicPreview: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translationPreview: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
  { id: 2, name_simple: "Al-Baqarah", name_arabic: "البقرة", translated_name: { name: "The Cow" }, revelation_place: "madinah", verses_count: 286, arabicPreview: "الٓمٓ ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ …", translationPreview: "Alif, Lam, Meem. This is the Book about which there is no doubt, a…" },
  { id: 3, name_simple: "Ali 'Imran", name_arabic: "آل عمران", translated_name: { name: "Family of Imran" }, revelation_place: "madinah", verses_count: 200, arabicPreview: "الٓمٓ ٱللَّهُ لَآ إِلَـٰهَ إِلَّا …", translationPreview: "Alif, Lam, Meem. Allah - there is no deity except Him, the Ever-Living, the…" },
  { id: 4, name_simple: "An-Nisa", name_arabic: "النساء", translated_name: { name: "The Women" }, revelation_place: "madinah", verses_count: 176, arabicPreview: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمُ ٱلَّذِى …", translationPreview: "O mankind, fear your Lord, who created you from one soul and created from…" },
  { id: 5, name_simple: "Al-Ma'idah", name_arabic: "المائدة", translated_name: { name: "The Table Spread" }, revelation_place: "madinah", verses_count: 120, arabicPreview: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَوْفُوا۟ بِٱلْعُقُودِ …", translationPreview: "O you who have believed, fulfill [all] contracts. Lawful for you are the animals…" },
  { id: 6, name_simple: "Al-An'am", name_arabic: "الأنعام", translated_name: { name: "The Cattle" }, revelation_place: "makkah", verses_count: 165, arabicPreview: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِى خَلَقَ ٱلسَّمَـٰوَٰتِ …", translationPreview: "[All] praise is [due] to Allah, who created the heavens and the earth and…" },
  { id: 7, name_simple: "Al-A'raf", name_arabic: "الأعراف", translated_name: { name: "The Heights" }, revelation_place: "makkah", verses_count: 206, arabicPreview: "الٓمٓصٓ كِتَـٰبٌ أُنزِلَ إِلَيْكَ فَلَا …", translationPreview: "Alif, Lam, Meem, Sad. [This is] a Book revealed to you, [O Muhammad] -…" },
  { id: 8, name_simple: "Al-Anfal", name_arabic: "الأنفال", translated_name: { name: "The Spoils of War" }, revelation_place: "madinah", verses_count: 75, arabicPreview: "يَسْـَٔلُونَكَ عَنِ ٱلْأَنفَالِ قُلِ ٱلْأَنفَالُ …", translationPreview: "They ask you, [O Muhammad], about the bounties [of war]. Say, \"The [decision…" },
  { id: 9, name_simple: "At-Tawbah", name_arabic: "التوبة", translated_name: { name: "The Repentance" }, revelation_place: "madinah", verses_count: 129, arabicPreview: "بَرَآءَةٌ مِّنَ ٱللَّهِ وَرَسُولِهِۦٓ إِلَى …", translationPreview: "[This is a declaration of] disassociation, from Allah and His Messenger, to those with…" },
  { id: 10, name_simple: "Yunus", name_arabic: "يونس", translated_name: { name: "Jonah" }, revelation_place: "makkah", verses_count: 109, arabicPreview: "الٓر تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ ٱلْحَكِيمِ", translationPreview: "Alif, Lam, Ra. These are the verses of the wise Book" },
  { id: 11, name_simple: "Hud", name_arabic: "هود", translated_name: { name: "Hud" }, revelation_place: "makkah", verses_count: 123, arabicPreview: "الٓر كِتَـٰبٌ أُحْكِمَتْ ءَايَـٰتُهُۥ ثُمَّ …", translationPreview: "Alif, Lam, Ra. [This is] a Book whose verses are perfected and then presented…" },
  { id: 12, name_simple: "Yusuf", name_arabic: "يوسف", translated_name: { name: "Joseph" }, revelation_place: "makkah", verses_count: 111, arabicPreview: "الٓر تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ ٱلْمُبِينِ", translationPreview: "Alif, Lam, Ra. These are the verses of the clear Book." },
  { id: 13, name_simple: "Ar-Ra'd", name_arabic: "الرعد", translated_name: { name: "The Thunder" }, revelation_place: "madinah", verses_count: 43, arabicPreview: "الٓمٓر تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ وَٱلَّذِىٓ …", translationPreview: "Alif, Lam, Meem, Ra. These are the verses of the Book; and what has…" },
  { id: 14, name_simple: "Ibrahim", name_arabic: "ابراهيم", translated_name: { name: "Abraham" }, revelation_place: "makkah", verses_count: 52, arabicPreview: "الٓر كِتَـٰبٌ أَنزَلْنَـٰهُ إِلَيْكَ لِتُخْرِجَ …", translationPreview: "Alif, Lam, Ra. [This is] a Book which We have revealed to you, [O…" },
  { id: 15, name_simple: "Al-Hijr", name_arabic: "الحجر", translated_name: { name: "The Rocky Tract" }, revelation_place: "makkah", verses_count: 99, arabicPreview: "الٓر تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ وَقُرْءَانٍ …", translationPreview: "Alif, Lam, Ra. These are the verses of the Book and a clear Qur'an." },
  { id: 16, name_simple: "An-Nahl", name_arabic: "النحل", translated_name: { name: "The Bee" }, revelation_place: "makkah", verses_count: 128, arabicPreview: "أَتَىٰٓ أَمْرُ ٱللَّهِ فَلَا تَسْتَعْجِلُوهُ …", translationPreview: "The command of Allah is coming, so be not impatient for it. Exalted is…" },
  { id: 17, name_simple: "Al-Isra", name_arabic: "الإسراء", translated_name: { name: "The Night Journey" }, revelation_place: "makkah", verses_count: 111, arabicPreview: "سُبْحَـٰنَ ٱلَّذِىٓ أَسْرَىٰ بِعَبْدِهِۦ لَيْلًا …", translationPreview: "Exalted is He who took His Servant by night from al-Masjid al-Haram to al-Masjid…" },
  { id: 18, name_simple: "Al-Kahf", name_arabic: "الكهف", translated_name: { name: "The Cave" }, revelation_place: "makkah", verses_count: 110, arabicPreview: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ …", translationPreview: "[All] praise is [due] to Allah, who has sent down upon His Servant the…" },
  { id: 19, name_simple: "Maryam", name_arabic: "مريم", translated_name: { name: "Mary" }, revelation_place: "makkah", verses_count: 98, arabicPreview: "كٓهيعٓصٓ ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُۥ …", translationPreview: "Kaf, Ha, Ya, 'Ayn, Sad. [This is] a mention of the mercy of your…" },
  { id: 20, name_simple: "Taha", name_arabic: "طه", translated_name: { name: "Ta-Ha" }, revelation_place: "makkah", verses_count: 135, arabicPreview: "طه مَآ أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ …", translationPreview: "Ta, Ha. We have not sent down to you the Qur'an that you be…" },
  { id: 21, name_simple: "Al-Anbya", name_arabic: "الأنبياء", translated_name: { name: "The Prophets" }, revelation_place: "makkah", verses_count: 112, arabicPreview: "ٱقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ وَهُمْ فِى …", translationPreview: "[The time of] their account has approached for the people, while they are in…" },
  { id: 22, name_simple: "Al-Hajj", name_arabic: "الحج", translated_name: { name: "The Pilgrimage" }, revelation_place: "madinah", verses_count: 78, arabicPreview: "يَـٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمْ إِنَّ …", translationPreview: "O mankind, fear your Lord. Indeed, the convulsion of the [final] Hour is a…" },
  { id: 23, name_simple: "Al-Mu'minun", name_arabic: "المؤمنون", translated_name: { name: "The Believers" }, revelation_place: "makkah", verses_count: 118, arabicPreview: "قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ", translationPreview: "Certainly will the believers have succeeded:" },
  { id: 24, name_simple: "An-Nur", name_arabic: "النور", translated_name: { name: "The Light" }, revelation_place: "madinah", verses_count: 64, arabicPreview: "سُورَةٌ أَنزَلْنَـٰهَا وَفَرَضْنَـٰهَا وَأَنزَلْنَا فِيهَآ …", translationPreview: "[This is] a surah which We have sent down and made [that within it]…" },
  { id: 25, name_simple: "Al-Furqan", name_arabic: "الفرقان", translated_name: { name: "The Criterion" }, revelation_place: "makkah", verses_count: 77, arabicPreview: "تَبَارَكَ ٱلَّذِى نَزَّلَ ٱلْفُرْقَانَ عَلَىٰ …", translationPreview: "Blessed is He who sent down the Criterion upon His Servant that he may…" },
  { id: 26, name_simple: "Ash-Shu'ara", name_arabic: "الشعراء", translated_name: { name: "The Poets" }, revelation_place: "makkah", verses_count: 227, arabicPreview: "طسٓمٓ تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ ٱلْمُبِينِ", translationPreview: "Ta, Seen, Meem. These are the verses of the clear Book." },
  { id: 27, name_simple: "An-Naml", name_arabic: "النمل", translated_name: { name: "The Ant" }, revelation_place: "makkah", verses_count: 93, arabicPreview: "طسٓ تِلْكَ ءَايَـٰتُ ٱلْقُرْءَانِ وَكِتَابٍ …", translationPreview: "Ta, Seen. These are the verses of the Qur'an and a clear Book" },
  { id: 28, name_simple: "Al-Qasas", name_arabic: "القصص", translated_name: { name: "The Stories" }, revelation_place: "makkah", verses_count: 88, arabicPreview: "طسٓمٓ تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ ٱلْمُبِينِ", translationPreview: "Ta, Seen, Meem. These are the verses of the clear Book." },
  { id: 29, name_simple: "Al-'Ankabut", name_arabic: "العنكبوت", translated_name: { name: "The Spider" }, revelation_place: "makkah", verses_count: 69, arabicPreview: "الٓمٓ أَحَسِبَ ٱلنَّاسُ أَن يُتْرَكُوٓا۟ …", translationPreview: "Alif, Lam, Meem Do the people think that they will be left to say,…" },
  { id: 30, name_simple: "Ar-Rum", name_arabic: "الروم", translated_name: { name: "The Romans" }, revelation_place: "makkah", verses_count: 60, arabicPreview: "الٓمٓ غُلِبَتِ ٱلرُّومُ", translationPreview: "Alif, Lam, Meem. The Byzantines have been defeated" },
  { id: 31, name_simple: "Luqman", name_arabic: "لقمان", translated_name: { name: "Luqman" }, revelation_place: "makkah", verses_count: 34, arabicPreview: "الٓمٓ تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ ٱلْحَكِيمِ", translationPreview: "Alif, Lam, Meem. These are verses of the wise Book," },
  { id: 32, name_simple: "As-Sajdah", name_arabic: "السجدة", translated_name: { name: "The Prostration" }, revelation_place: "makkah", verses_count: 30, arabicPreview: "الٓمٓ تَنزِيلُ ٱلْكِتَـٰبِ لَا رَيْبَ …", translationPreview: "Alif, Lam, Meem. [This is] the revelation of the Book about which there is…" },
  { id: 33, name_simple: "Al-Ahzab", name_arabic: "الأحزاب", translated_name: { name: "The Clans" }, revelation_place: "madinah", verses_count: 73, arabicPreview: "يَـٰٓأَيُّهَا ٱلنَّبِىُّ ٱتَّقِ ٱللَّهَ وَلَا …", translationPreview: "O Prophet, fear Allah and do not obey the disbelievers and the hypocrites. Indeed,…" },
  { id: 34, name_simple: "Saba", name_arabic: "سبأ", translated_name: { name: "Sheba" }, revelation_place: "makkah", verses_count: 54, arabicPreview: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِى لَهُۥ مَا …", translationPreview: "[All] praise is [due] to Allah, to whom belongs whatever is in the heavens…" },
  { id: 35, name_simple: "Fatir", name_arabic: "فاطر", translated_name: { name: "Originator" }, revelation_place: "makkah", verses_count: 45, arabicPreview: "ٱلْحَمْدُ لِلَّهِ فَاطِرِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ …", translationPreview: "[All] praise is [due] to Allah, Creator of the heavens and the earth, [who]…" },
  { id: 36, name_simple: "Ya-Sin", name_arabic: "يس", translated_name: { name: "Ya Sin" }, revelation_place: "makkah", verses_count: 83, arabicPreview: "يسٓ وَٱلْقُرْءَانِ ٱلْحَكِيمِ", translationPreview: "Ya, Seen. By the wise Qur'an." },
  { id: 37, name_simple: "As-Saffat", name_arabic: "الصافات", translated_name: { name: "Those who set the Ranks" }, revelation_place: "makkah", verses_count: 182, arabicPreview: "وَٱلصَّـٰٓفَّـٰتِ صَفًّا فَٱلزَّٰجِرَٰتِ زَجْرًا", translationPreview: "By those [angels] lined up in rows And those who drive [the clouds]" },
  { id: 38, name_simple: "Sad", name_arabic: "ص", translated_name: { name: "The Letter \"Saad\"" }, revelation_place: "makkah", verses_count: 88, arabicPreview: "صٓ وَٱلْقُرْءَانِ ذِى ٱلذِّكْرِ", translationPreview: "Sad. By the Qur'an containing reminder..." },
  { id: 39, name_simple: "Az-Zumar", name_arabic: "الزمر", translated_name: { name: "The Troops" }, revelation_place: "makkah", verses_count: 75, arabicPreview: "تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ ٱلْعَزِيزِ …", translationPreview: "The revelation of the Qur'an is from Allah, the Exalted in Might, the Wise." },
  { id: 40, name_simple: "Ghafir", name_arabic: "غافر", translated_name: { name: "The Forgiver" }, revelation_place: "makkah", verses_count: 85, arabicPreview: "حمٓ تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ …", translationPreview: "Ha, Meem. The revelation of the Book is from Allah, the Exalted in Might,…" },
  { id: 41, name_simple: "Fussilat", name_arabic: "فصلت", translated_name: { name: "Explained in Detail" }, revelation_place: "makkah", verses_count: 54, arabicPreview: "حمٓ تَنزِيلٌ مِّنَ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translationPreview: "Ha, Meem. [This is] a revelation from the Entirely Merciful, the Especially Merciful -" },
  { id: 42, name_simple: "Ash-Shuraa", name_arabic: "الشورى", translated_name: { name: "The Consultation" }, revelation_place: "makkah", verses_count: 53, arabicPreview: "حمٓ عٓسٓقٓ كَذَٰلِكَ يُوحِىٓ إِلَيْكَ …", translationPreview: "Ha, Meem. 'Ayn, Seen, Qaf. Thus has He revealed to you, [O Muhammad], and…" },
  { id: 43, name_simple: "Az-Zukhruf", name_arabic: "الزخرف", translated_name: { name: "The Ornaments of Gold" }, revelation_place: "makkah", verses_count: 89, arabicPreview: "حمٓ وَٱلْكِتَـٰبِ ٱلْمُبِينِ", translationPreview: "Ha, Meem. By the clear Book," },
  { id: 44, name_simple: "Ad-Dukhan", name_arabic: "الدخان", translated_name: { name: "The Smoke" }, revelation_place: "makkah", verses_count: 59, arabicPreview: "حمٓ وَٱلْكِتَـٰبِ ٱلْمُبِينِ", translationPreview: "Ha, Meem. By the clear Book," },
  { id: 45, name_simple: "Al-Jathiyah", name_arabic: "الجاثية", translated_name: { name: "The Crouching" }, revelation_place: "makkah", verses_count: 37, arabicPreview: "حمٓ تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ …", translationPreview: "Ha, Meem. The revelation of the Book is from Allah, the Exalted in Might,…" },
  { id: 46, name_simple: "Al-Ahqaf", name_arabic: "الأحقاف", translated_name: { name: "The Wind-Curved Sandhills" }, revelation_place: "makkah", verses_count: 35, arabicPreview: "حمٓ تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ …", translationPreview: "Ha, Meem. The revelation of the Book is from Allah, the Exalted in Might,…" },
  { id: 47, name_simple: "Muhammad", name_arabic: "محمد", translated_name: { name: "Muhammad" }, revelation_place: "madinah", verses_count: 38, arabicPreview: "ٱلَّذِينَ كَفَرُوا۟ وَصَدُّوا۟ عَن سَبِيلِ …", translationPreview: "Those who disbelieve and avert [people] from the way of Allah - He will…" },
  { id: 48, name_simple: "Al-Fath", name_arabic: "الفتح", translated_name: { name: "The Victory" }, revelation_place: "madinah", verses_count: 29, arabicPreview: "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا", translationPreview: "Indeed, We have given you, [O Muhammad], a clear conquest" },
  { id: 49, name_simple: "Al-Hujurat", name_arabic: "الحجرات", translated_name: { name: "The Rooms" }, revelation_place: "madinah", verses_count: 18, arabicPreview: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تُقَدِّمُوا۟ …", translationPreview: "O you who have believed, do not put [yourselves] before Allah and His Messenger…" },
  { id: 50, name_simple: "Qaf", name_arabic: "ق", translated_name: { name: "The Letter \"Qaf\"" }, revelation_place: "makkah", verses_count: 45, arabicPreview: "قٓ وَٱلْقُرْءَانِ ٱلْمَجِيدِ", translationPreview: "Qaf. By the honored Qur'an..." },
  { id: 51, name_simple: "Adh-Dhariyat", name_arabic: "الذاريات", translated_name: { name: "The Winnowing Winds" }, revelation_place: "makkah", verses_count: 60, arabicPreview: "وَٱلذَّٰرِيَـٰتِ ذَرْوًا فَٱلْحَـٰمِلَـٰتِ وِقْرًا", translationPreview: "By those [winds] scattering [dust] dispersing And those [clouds] carrying a load [of…" },
  { id: 52, name_simple: "At-Tur", name_arabic: "الطور", translated_name: { name: "The Mount" }, revelation_place: "makkah", verses_count: 49, arabicPreview: "وَٱلطُّورِ وَكِتَـٰبٍ مَّسْطُورٍ", translationPreview: "By the mount And [by] a Book inscribed" },
  { id: 53, name_simple: "An-Najm", name_arabic: "النجم", translated_name: { name: "The Star" }, revelation_place: "makkah", verses_count: 62, arabicPreview: "وَٱلنَّجْمِ إِذَا هَوَىٰ", translationPreview: "By the star when it descends," },
  { id: 54, name_simple: "Al-Qamar", name_arabic: "القمر", translated_name: { name: "The Moon" }, revelation_place: "makkah", verses_count: 55, arabicPreview: "ٱقْتَرَبَتِ ٱلسَّاعَةُ وَٱنشَقَّ ٱلْقَمَرُ", translationPreview: "The Hour has come near, and the moon has split [in two]." },
  { id: 55, name_simple: "Ar-Rahman", name_arabic: "الرحمن", translated_name: { name: "The Beneficent" }, revelation_place: "madinah", verses_count: 78, arabicPreview: "ٱلرَّحْمَـٰنُ عَلَّمَ ٱلْقُرْءَانَ", translationPreview: "The Most Merciful Taught the Qur'an," },
  { id: 56, name_simple: "Al-Waqi'ah", name_arabic: "الواقعة", translated_name: { name: "The Inevitable" }, revelation_place: "makkah", verses_count: 96, arabicPreview: "إِذَا وَقَعَتِ ٱلْوَاقِعَةُ", translationPreview: "When the Occurrence occurs," },
  { id: 57, name_simple: "Al-Hadid", name_arabic: "الحديد", translated_name: { name: "The Iron" }, revelation_place: "madinah", verses_count: 29, arabicPreview: "سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ …", translationPreview: "Whatever is in the heavens and earth exalts Allah, and He is the Exalted…" },
  { id: 58, name_simple: "Al-Mujadila", name_arabic: "المجادلة", translated_name: { name: "The Pleading Woman" }, revelation_place: "madinah", verses_count: 22, arabicPreview: "قَدْ سَمِعَ ٱللَّهُ قَوْلَ ٱلَّتِى …", translationPreview: "Certainly has Allah heard the speech of the one who argues with you, [O…" },
  { id: 59, name_simple: "Al-Hashr", name_arabic: "الحشر", translated_name: { name: "The Exile" }, revelation_place: "madinah", verses_count: 24, arabicPreview: "سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ …", translationPreview: "Whatever is in the heavens and whatever is on the earth exalts Allah, and…" },
  { id: 60, name_simple: "Al-Mumtahanah", name_arabic: "الممتحنة", translated_name: { name: "She that is to be examined" }, revelation_place: "madinah", verses_count: 13, arabicPreview: "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَتَّخِذُوا۟ …", translationPreview: "O you who have believed, do not take My enemies and your enemies as…" },
  { id: 61, name_simple: "As-Saf", name_arabic: "الصف", translated_name: { name: "The Ranks" }, revelation_place: "madinah", verses_count: 14, arabicPreview: "سَبَّحَ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ …", translationPreview: "Whatever is in the heavens and whatever is on the earth exalts Allah, and…" },
  { id: 62, name_simple: "Al-Jumu'ah", name_arabic: "الجمعة", translated_name: { name: "The Congregation, Friday" }, revelation_place: "madinah", verses_count: 11, arabicPreview: "يُسَبِّحُ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ …", translationPreview: "Whatever is in the heavens and whatever is on the earth is exalting Allah,…" },
  { id: 63, name_simple: "Al-Munafiqun", name_arabic: "المنافقون", translated_name: { name: "The Hypocrites" }, revelation_place: "madinah", verses_count: 11, arabicPreview: "إِذَا جَآءَكَ ٱلْمُنَـٰفِقُونَ قَالُوا۟ نَشْهَدُ …", translationPreview: "When the hypocrites come to you, [O Muhammad], they say, \"We testify that you…" },
  { id: 64, name_simple: "At-Taghabun", name_arabic: "التغابن", translated_name: { name: "The Mutual Disillusion" }, revelation_place: "madinah", verses_count: 18, arabicPreview: "يُسَبِّحُ لِلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ …", translationPreview: "Whatever is in the heavens and whatever is on the earth is exalting Allah.…" },
  { id: 65, name_simple: "At-Talaq", name_arabic: "الطلاق", translated_name: { name: "The Divorce" }, revelation_place: "madinah", verses_count: 12, arabicPreview: "يَـٰٓأَيُّهَا ٱلنَّبِىُّ إِذَا طَلَّقْتُمُ ٱلنِّسَآءَ …", translationPreview: "O Prophet, when you [Muslims] divorce women, divorce them for [the commencement of]…" },
  { id: 66, name_simple: "At-Tahrim", name_arabic: "التحريم", translated_name: { name: "The Prohibition" }, revelation_place: "madinah", verses_count: 12, arabicPreview: "يَـٰٓأَيُّهَا ٱلنَّبِىُّ لِمَ تُحَرِّمُ مَآ …", translationPreview: "O Prophet, why do you prohibit [yourself from] what Allah has made lawful for…" },
  { id: 67, name_simple: "Al-Mulk", name_arabic: "الملك", translated_name: { name: "The Sovereignty" }, revelation_place: "makkah", verses_count: 30, arabicPreview: "تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ …", translationPreview: "Blessed is He in whose hand is dominion, and He is over all things…" },
  { id: 68, name_simple: "Al-Qalam", name_arabic: "القلم", translated_name: { name: "The Pen" }, revelation_place: "makkah", verses_count: 52, arabicPreview: "نٓ وَٱلْقَلَمِ وَمَا يَسْطُرُونَ", translationPreview: "Nun. By the pen and what they inscribe," },
  { id: 69, name_simple: "Al-Haqqah", name_arabic: "الحاقة", translated_name: { name: "The Reality" }, revelation_place: "makkah", verses_count: 52, arabicPreview: "ٱلْحَآقَّةُ مَا ٱلْحَآقَّةُ", translationPreview: "The Inevitable Reality - What is the Inevitable Reality?" },
  { id: 70, name_simple: "Al-Ma'arij", name_arabic: "المعارج", translated_name: { name: "The Ascending Stairways" }, revelation_place: "makkah", verses_count: 44, arabicPreview: "سَأَلَ سَآئِلٌۢ بِعَذَابٍ وَاقِعٍ", translationPreview: "A supplicant asked for a punishment bound to happen" },
  { id: 71, name_simple: "Nuh", name_arabic: "نوح", translated_name: { name: "Noah" }, revelation_place: "makkah", verses_count: 28, arabicPreview: "إِنَّآ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِۦٓ …", translationPreview: "Indeed, We sent Noah to his people, [saying], \"Warn your people before there comes…" },
  { id: 72, name_simple: "Al-Jinn", name_arabic: "الجن", translated_name: { name: "The Jinn" }, revelation_place: "makkah", verses_count: 28, arabicPreview: "قُلْ أُوحِىَ إِلَىَّ أَنَّهُ ٱسْتَمَعَ …", translationPreview: "Say, [O Muhammad], \"It has been revealed to me that a group of the…" },
  { id: 73, name_simple: "Al-Muzzammil", name_arabic: "المزمل", translated_name: { name: "The Enshrouded One" }, revelation_place: "makkah", verses_count: 20, arabicPreview: "يَـٰٓأَيُّهَا ٱلْمُزَّمِّلُ قُمِ ٱلَّيْلَ إِلَّا …", translationPreview: "O you who wraps himself [in clothing], Arise [to pray] the night, except for…" },
  { id: 74, name_simple: "Al-Muddaththir", name_arabic: "المدثر", translated_name: { name: "The Cloaked One" }, revelation_place: "makkah", verses_count: 56, arabicPreview: "يَـٰٓأَيُّهَا ٱلْمُدَّثِّرُ قُمْ فَأَنذِرْ", translationPreview: "O you who covers himself [with a garment], Arise and warn" },
  { id: 75, name_simple: "Al-Qiyamah", name_arabic: "القيامة", translated_name: { name: "The Resurrection" }, revelation_place: "makkah", verses_count: 40, arabicPreview: "لَآ أُقْسِمُ بِيَوْمِ ٱلْقِيَـٰمَةِ", translationPreview: "I swear by the Day of Resurrection" },
  { id: 76, name_simple: "Al-Insan", name_arabic: "الإنسان", translated_name: { name: "The Man" }, revelation_place: "madinah", verses_count: 31, arabicPreview: "هَلْ أَتَىٰ عَلَى ٱلْإِنسَـٰنِ حِينٌ …", translationPreview: "Has there [not] come upon man a period of time when he was not…" },
  { id: 77, name_simple: "Al-Mursalat", name_arabic: "المرسلات", translated_name: { name: "The Emissaries" }, revelation_place: "makkah", verses_count: 50, arabicPreview: "وَٱلْمُرْسَلَـٰتِ عُرْفًا فَٱلْعَـٰصِفَـٰتِ عَصْفًا", translationPreview: "By those [winds] sent forth in gusts And the winds that blow violently" },
  { id: 78, name_simple: "An-Naba", name_arabic: "النبأ", translated_name: { name: "The Tidings" }, revelation_place: "makkah", verses_count: 40, arabicPreview: "عَمَّ يَتَسَآءَلُونَ عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ", translationPreview: "About what are they asking one another? About the great news -" },
  { id: 79, name_simple: "An-Nazi'at", name_arabic: "النازعات", translated_name: { name: "Those who drag forth" }, revelation_place: "makkah", verses_count: 46, arabicPreview: "وَٱلنَّـٰزِعَـٰتِ غَرْقًا وَٱلنَّـٰشِطَـٰتِ نَشْطًا", translationPreview: "By those [angels] who extract with violence And [by] those who remove with ease" },
  { id: 80, name_simple: "'Abasa", name_arabic: "عبس", translated_name: { name: "He Frowned" }, revelation_place: "makkah", verses_count: 42, arabicPreview: "عَبَسَ وَتَوَلَّىٰٓ أَن جَآءَهُ ٱلْأَعْمَىٰ", translationPreview: "The Prophet frowned and turned away Because there came to him the blind man,…" },
  { id: 81, name_simple: "At-Takwir", name_arabic: "التكوير", translated_name: { name: "The Overthrowing" }, revelation_place: "makkah", verses_count: 29, arabicPreview: "إِذَا ٱلشَّمْسُ كُوِّرَتْ", translationPreview: "When the sun is wrapped up [in darkness]" },
  { id: 82, name_simple: "Al-Infitar", name_arabic: "الإنفطار", translated_name: { name: "The Cleaving" }, revelation_place: "makkah", verses_count: 19, arabicPreview: "إِذَا ٱلسَّمَآءُ ٱنفَطَرَتْ", translationPreview: "When the sky breaks apart" },
  { id: 83, name_simple: "Al-Mutaffifin", name_arabic: "المطففين", translated_name: { name: "The Defrauding" }, revelation_place: "makkah", verses_count: 36, arabicPreview: "وَيْلٌ لِّلْمُطَفِّفِينَ ٱلَّذِينَ إِذَا ٱكْتَالُوا۟ …", translationPreview: "Woe to those who give less [than due], Who, when they take a measure…" },
  { id: 84, name_simple: "Al-Inshiqaq", name_arabic: "الإنشقاق", translated_name: { name: "The Splitting Open" }, revelation_place: "makkah", verses_count: 25, arabicPreview: "إِذَا ٱلسَّمَآءُ ٱنشَقَّتْ", translationPreview: "When the sky has split [open]" },
  { id: 85, name_simple: "Al-Buruj", name_arabic: "البروج", translated_name: { name: "The Mansions of the Stars" }, revelation_place: "makkah", verses_count: 22, arabicPreview: "وَٱلسَّمَآءِ ذَاتِ ٱلْبُرُوجِ", translationPreview: "By the sky containing great stars" },
  { id: 86, name_simple: "At-Tariq", name_arabic: "الطارق", translated_name: { name: "The Morning Star" }, revelation_place: "makkah", verses_count: 17, arabicPreview: "وَٱلسَّمَآءِ وَٱلطَّارِقِ وَمَآ أَدْرَىٰكَ مَا …", translationPreview: "By the sky and the night comer - And what can make you know…" },
  { id: 87, name_simple: "Al-A'la", name_arabic: "الأعلى", translated_name: { name: "The Most High" }, revelation_place: "makkah", verses_count: 19, arabicPreview: "سَبِّحِ ٱسْمَ رَبِّكَ ٱلْأَعْلَى", translationPreview: "Exalt the name of your Lord, the Most High," },
  { id: 88, name_simple: "Al-Ghashiyah", name_arabic: "الغاشية", translated_name: { name: "The Overwhelming" }, revelation_place: "makkah", verses_count: 26, arabicPreview: "هَلْ أَتَىٰكَ حَدِيثُ ٱلْغَـٰشِيَةِ", translationPreview: "Has there reached you the report of the Overwhelming [event]?" },
  { id: 89, name_simple: "Al-Fajr", name_arabic: "الفجر", translated_name: { name: "The Dawn" }, revelation_place: "makkah", verses_count: 30, arabicPreview: "وَٱلْفَجْرِ وَلَيَالٍ عَشْرٍ", translationPreview: "By the dawn And [by] ten nights" },
  { id: 90, name_simple: "Al-Balad", name_arabic: "البلد", translated_name: { name: "The City" }, revelation_place: "makkah", verses_count: 20, arabicPreview: "لَآ أُقْسِمُ بِهَـٰذَا ٱلْبَلَدِ", translationPreview: "I swear by this city, Makkah -" },
  { id: 91, name_simple: "Ash-Shams", name_arabic: "الشمس", translated_name: { name: "The Sun" }, revelation_place: "makkah", verses_count: 15, arabicPreview: "وَٱلشَّمْسِ وَضُحَىٰهَا وَٱلْقَمَرِ إِذَا تَلَىٰهَا", translationPreview: "By the sun and its brightness And [by] the moon when it follows it" },
  { id: 92, name_simple: "Al-Layl", name_arabic: "الليل", translated_name: { name: "The Night" }, revelation_place: "makkah", verses_count: 21, arabicPreview: "وَٱلَّيْلِ إِذَا يَغْشَىٰ", translationPreview: "By the night when it covers" },
  { id: 93, name_simple: "Ad-Duhaa", name_arabic: "الضحى", translated_name: { name: "The Morning Hours" }, revelation_place: "makkah", verses_count: 11, arabicPreview: "وَٱلضُّحَىٰ وَٱلَّيْلِ إِذَا سَجَىٰ", translationPreview: "By the morning brightness And [by] the night when it covers with darkness," },
  { id: 94, name_simple: "Ash-Sharh", name_arabic: "الشرح", translated_name: { name: "The Relief" }, revelation_place: "makkah", verses_count: 8, arabicPreview: "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", translationPreview: "Did We not expand for you, [O Muhammad], your breast?" },
  { id: 95, name_simple: "At-Tin", name_arabic: "التين", translated_name: { name: "The Fig" }, revelation_place: "makkah", verses_count: 8, arabicPreview: "وَٱلتِّينِ وَٱلزَّيْتُونِ وَطُورِ سِينِينَ", translationPreview: "By the fig and the olive And [by] Mount Sinai" },
  { id: 96, name_simple: "Al-'Alaq", name_arabic: "العلق", translated_name: { name: "The Clot" }, revelation_place: "makkah", verses_count: 19, arabicPreview: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ", translationPreview: "Recite in the name of your Lord who created -" },
  { id: 97, name_simple: "Al-Qadr", name_arabic: "القدر", translated_name: { name: "The Power, Fate" }, revelation_place: "makkah", verses_count: 5, arabicPreview: "إِنَّآ أَنزَلْنَـٰهُ فِى لَيْلَةِ ٱلْقَدْرِ", translationPreview: "Indeed, We sent the Qur'an down during the Night of Decree." },
  { id: 98, name_simple: "Al-Bayyinah", name_arabic: "البينة", translated_name: { name: "The Evidence" }, revelation_place: "madinah", verses_count: 8, arabicPreview: "لَمْ يَكُنِ ٱلَّذِينَ كَفَرُوا۟ مِنْ …", translationPreview: "Those who disbelieved among the People of the Scripture and the polytheists were not…" },
  { id: 99, name_simple: "Az-Zalzalah", name_arabic: "الزلزلة", translated_name: { name: "The Earthquake" }, revelation_place: "madinah", verses_count: 8, arabicPreview: "إِذَا زُلْزِلَتِ ٱلْأَرْضُ زِلْزَالَهَا", translationPreview: "When the earth is shaken with its [final] earthquake" },
  { id: 100, name_simple: "Al-'Adiyat", name_arabic: "العاديات", translated_name: { name: "The Courser" }, revelation_place: "makkah", verses_count: 11, arabicPreview: "وَٱلْعَـٰدِيَـٰتِ ضَبْحًا فَٱلْمُورِيَـٰتِ قَدْحًا", translationPreview: "By the racers, panting, And the producers of sparks [when] striking" },
  { id: 101, name_simple: "Al-Qari'ah", name_arabic: "القارعة", translated_name: { name: "The Calamity" }, revelation_place: "makkah", verses_count: 11, arabicPreview: "ٱلْقَارِعَةُ مَا ٱلْقَارِعَةُ", translationPreview: "The Striking Calamity - What is the Striking Calamity?" },
  { id: 102, name_simple: "At-Takathur", name_arabic: "التكاثر", translated_name: { name: "The Rivalry in world increase" }, revelation_place: "makkah", verses_count: 8, arabicPreview: "أَلْهَىٰكُمُ ٱلتَّكَاثُرُ حَتَّىٰ زُرْتُمُ ٱلْمَقَابِرَ", translationPreview: "Competition in [worldly] increase diverts you Until you visit the graveyards." },
  { id: 103, name_simple: "Al-'Asr", name_arabic: "العصر", translated_name: { name: "The Declining Day, Epoch" }, revelation_place: "makkah", verses_count: 3, arabicPreview: "وَٱلْعَصْرِ إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", translationPreview: "By time, Indeed, mankind is in loss," },
  { id: 104, name_simple: "Al-Humazah", name_arabic: "الهمزة", translated_name: { name: "The Traducer" }, revelation_place: "makkah", verses_count: 9, arabicPreview: "وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ", translationPreview: "Woe to every scorner and mocker" },
  { id: 105, name_simple: "Al-Fil", name_arabic: "الفيل", translated_name: { name: "The Elephant" }, revelation_place: "makkah", verses_count: 5, arabicPreview: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ …", translationPreview: "Have you not considered, [O Muhammad], how your Lord dealt with the companions of…" },
  { id: 106, name_simple: "Quraysh", name_arabic: "قريش", translated_name: { name: "Quraysh" }, revelation_place: "makkah", verses_count: 4, arabicPreview: "لِإِيلَـٰفِ قُرَيْشٍ إِۦلَـٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ …", translationPreview: "For the accustomed security of the Quraysh - Their accustomed security [in] the caravan…" },
  { id: 107, name_simple: "Al-Ma'un", name_arabic: "الماعون", translated_name: { name: "The Small kindnesses" }, revelation_place: "makkah", verses_count: 7, arabicPreview: "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ", translationPreview: "Have you seen the one who denies the Recompense?" },
  { id: 108, name_simple: "Al-Kawthar", name_arabic: "الكوثر", translated_name: { name: "The Abundance" }, revelation_place: "makkah", verses_count: 3, arabicPreview: "إِنَّآ أَعْطَيْنَـٰكَ ٱلْكَوْثَرَ", translationPreview: "Indeed, We have granted you, [O Muhammad], al-Kawthar." },
  { id: 109, name_simple: "Al-Kafirun", name_arabic: "الكافرون", translated_name: { name: "The Disbelievers" }, revelation_place: "makkah", verses_count: 6, arabicPreview: "قُلْ يَـٰٓأَيُّهَا ٱلْكَـٰفِرُونَ", translationPreview: "Say, \"O disbelievers," },
  { id: 110, name_simple: "An-Nasr", name_arabic: "النصر", translated_name: { name: "The Divine Support" }, revelation_place: "madinah", verses_count: 3, arabicPreview: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ", translationPreview: "When the victory of Allah has come and the conquest," },
  { id: 111, name_simple: "Al-Masad", name_arabic: "المسد", translated_name: { name: "The Palm Fibre" }, revelation_place: "makkah", verses_count: 5, arabicPreview: "تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ", translationPreview: "May the hands of Abu Lahab be ruined, and ruined is he." },
  { id: 112, name_simple: "Al-Ikhlas", name_arabic: "الإخلاص", translated_name: { name: "The Sincerity" }, revelation_place: "makkah", verses_count: 4, arabicPreview: "قُلْ هُوَ ٱللَّهُ أَحَدٌ", translationPreview: "Say, \"He is Allah, [who is] One," },
  { id: 113, name_simple: "Al-Falaq", name_arabic: "الفلق", translated_name: { name: "The Daybreak" }, revelation_place: "makkah", verses_count: 5, arabicPreview: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ", translationPreview: "Say, \"I seek refuge in the Lord of daybreak" },
  { id: 114, name_simple: "An-Nas", name_arabic: "الناس", translated_name: { name: "Mankind" }, revelation_place: "makkah", verses_count: 6, arabicPreview: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", translationPreview: "Say, \"I seek refuge in the Lord of mankind," }
];

// Standard 30 Juz (Para) starting boundaries (Hafs 'an 'Asim / Madinah Mushaf)
export const JUZ_DATA = [
  { juzNumber: 1, surahNumber: 1, ayahNumber: 1, arabicPreview: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translationPreview: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
  { juzNumber: 2, surahNumber: 2, ayahNumber: 142, arabicPreview: "سَيَقُولُ ٱلسُّفَهَآءُ مِنَ ٱلنَّاسِ مَا …", translationPreview: "The foolish among the people will say, \"What has turned them away from their…" },
  { juzNumber: 3, surahNumber: 2, ayahNumber: 253, arabicPreview: "تِلْكَ ٱلرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ …", translationPreview: "Those messengers - some of them We caused to exceed others. Among them were…" },
  { juzNumber: 4, surahNumber: 3, ayahNumber: 93, arabicPreview: "كُلُّ ٱلطَّعَامِ كَانَ حِلًّا لِّبَنِىٓ …", translationPreview: "All food was lawful to the Children of Israel except what Israel had made…" },
  { juzNumber: 5, surahNumber: 4, ayahNumber: 24, arabicPreview: "وَٱلْمُحْصَنَـٰتُ مِنَ ٱلنِّسَآءِ إِلَّا مَا …", translationPreview: "And [also prohibited to you are all] married women except those your right hands…" },
  { juzNumber: 6, surahNumber: 4, ayahNumber: 148, arabicPreview: "لَّا يُحِبُّ ٱللَّهُ ٱلْجَهْرَ بِٱلسُّوٓءِ …", translationPreview: "Allah does not like the public mention of evil except by one who has…" },
  { juzNumber: 7, surahNumber: 5, ayahNumber: 82, arabicPreview: "لَتَجِدَنَّ أَشَدَّ ٱلنَّاسِ عَدَٰوَةً لِّلَّذِينَ …", translationPreview: "You will surely find the most intense of the people in animosity toward the…" },
  { juzNumber: 8, surahNumber: 6, ayahNumber: 111, arabicPreview: "وَلَوْ أَنَّنَا نَزَّلْنَآ إِلَيْهِمُ ٱلْمَلَـٰٓئِكَةَ …", translationPreview: "And even if We had sent down to them the angels [with the message]…" },
  { juzNumber: 9, surahNumber: 7, ayahNumber: 88, arabicPreview: "قَالَ ٱلْمَلَأُ ٱلَّذِينَ ٱسْتَكْبَرُوا۟ مِن …", translationPreview: "Said the eminent ones who were arrogant among his people, \"We will surely evict…" },
  { juzNumber: 10, surahNumber: 8, ayahNumber: 41, arabicPreview: "وَٱعْلَمُوٓا۟ أَنَّمَا غَنِمْتُم مِّن شَىْءٍ …", translationPreview: "And know that anything you obtain of war booty - then indeed, for Allah…" },
  { juzNumber: 11, surahNumber: 9, ayahNumber: 93, arabicPreview: "إِنَّمَا ٱلسَّبِيلُ عَلَى ٱلَّذِينَ يَسْتَـْٔذِنُونَكَ …", translationPreview: "The cause [for blame] is only upon those who ask permission of you while…" },
  { juzNumber: 12, surahNumber: 11, ayahNumber: 6, arabicPreview: "وَمَا مِن دَآبَّةٍ فِى ٱلْأَرْضِ …", translationPreview: "And there is no creature on earth but that upon Allah is its provision,…" },
  { juzNumber: 13, surahNumber: 12, ayahNumber: 53, arabicPreview: "وَمَآ أُبَرِّئُ نَفْسِىٓ إِنَّ ٱلنَّفْسَ …", translationPreview: "And I do not acquit myself. Indeed, the soul is a persistent enjoiner of…" },
  { juzNumber: 14, surahNumber: 15, ayahNumber: 1, arabicPreview: "الٓر تِلْكَ ءَايَـٰتُ ٱلْكِتَـٰبِ وَقُرْءَانٍ …", translationPreview: "Alif, Lam, Ra. These are the verses of the Book and a clear Qur'an." },
  { juzNumber: 15, surahNumber: 17, ayahNumber: 1, arabicPreview: "سُبْحَـٰنَ ٱلَّذِىٓ أَسْرَىٰ بِعَبْدِهِۦ لَيْلًا …", translationPreview: "Exalted is He who took His Servant by night from al-Masjid al-Haram to al-Masjid…" },
  { juzNumber: 16, surahNumber: 18, ayahNumber: 75, arabicPreview: "قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ …", translationPreview: "[Al-Khidh r] said, \"Did I not tell you that with me you would never…" },
  { juzNumber: 17, surahNumber: 21, ayahNumber: 1, arabicPreview: "ٱقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ وَهُمْ فِى …", translationPreview: "[The time of] their account has approached for the people, while they are in…" },
  { juzNumber: 18, surahNumber: 23, ayahNumber: 1, arabicPreview: "قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ", translationPreview: "Certainly will the believers have succeeded:" },
  { juzNumber: 19, surahNumber: 25, ayahNumber: 21, arabicPreview: "وَقَالَ ٱلَّذِينَ لَا يَرْجُونَ لِقَآءَنَا …", translationPreview: "And those who do not expect the meeting with Us say, \"Why were not…" },
  { juzNumber: 20, surahNumber: 27, ayahNumber: 56, arabicPreview: "فَمَا كَانَ جَوَابَ قَوْمِهِۦٓ إِلَّآ …", translationPreview: "But the answer of his people was not except that they said, \"Expel the…" },
  { juzNumber: 21, surahNumber: 29, ayahNumber: 46, arabicPreview: "وَلَا تُجَـٰدِلُوٓا۟ أَهْلَ ٱلْكِتَـٰبِ إِلَّا …", translationPreview: "And do not argue with the People of the Scripture except in a way…" },
  { juzNumber: 22, surahNumber: 33, ayahNumber: 31, arabicPreview: "وَمَن يَقْنُتْ مِنكُنَّ لِلَّهِ وَرَسُولِهِۦ …", translationPreview: "And whoever of you devoutly obeys Allah and His Messenger and does righteousness -…" },
  { juzNumber: 23, surahNumber: 36, ayahNumber: 28, arabicPreview: "وَمَآ أَنزَلْنَا عَلَىٰ قَوْمِهِۦ مِنۢ …", translationPreview: "And We did not send down upon his people after him any soldiers from…" },
  { juzNumber: 24, surahNumber: 39, ayahNumber: 32, arabicPreview: "فَمَنْ أَظْلَمُ مِمَّن كَذَبَ عَلَى …", translationPreview: "So who is more unjust than one who lies about Allah and denies the…" },
  { juzNumber: 25, surahNumber: 41, ayahNumber: 47, arabicPreview: "إِلَيْهِ يُرَدُّ عِلْمُ ٱلسَّاعَةِ وَمَا …", translationPreview: "To him [alone] is attributed knowledge of the Hour. And fruits emerge not from…" },
  { juzNumber: 26, surahNumber: 46, ayahNumber: 1, arabicPreview: "حمٓ تَنزِيلُ ٱلْكِتَـٰبِ مِنَ ٱللَّهِ …", translationPreview: "Ha, Meem. The revelation of the Book is from Allah, the Exalted in Might,…" },
  { juzNumber: 27, surahNumber: 51, ayahNumber: 31, arabicPreview: "قَالَ فَمَا خَطْبُكُمْ أَيُّهَا ٱلْمُرْسَلُونَ", translationPreview: "[Abraham] said, \"Then what is your business [here], O messengers?\"" },
  { juzNumber: 28, surahNumber: 58, ayahNumber: 1, arabicPreview: "قَدْ سَمِعَ ٱللَّهُ قَوْلَ ٱلَّتِى …", translationPreview: "Certainly has Allah heard the speech of the one who argues with you, [O…" },
  { juzNumber: 29, surahNumber: 67, ayahNumber: 1, arabicPreview: "تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ …", translationPreview: "Blessed is He in whose hand is dominion, and He is over all things…" },
  { juzNumber: 30, surahNumber: 78, ayahNumber: 1, arabicPreview: "عَمَّ يَتَسَآءَلُونَ عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ", translationPreview: "About what are they asking one another? About the great news -" }
];

// Helper function to get starting surah/ayah for a specific Juz (1-30)
export const getJuzStart = (juzNumber) => {
  const num = Number(juzNumber);
  if (!Number.isInteger(num) || num < 1 || num > 30) {
    return null;
  }
  return JUZ_DATA[num - 1] || null;
};

// Helper function to get all surahs info
export const getAllSurahsInfo = () => {
  return surahsInfo;
};

// Helper function to get surah info by ID
export const getSurahInfo = (surahNumber) => {
  return surahsInfo.find(surah => surah.id === parseInt(surahNumber));
};

// Import the pre-parsed Quran verses data
// Note: We'll load this dynamically to avoid large bundle size

// Cache for loaded Quran data
let quranVersesData = null;

// Helper function to load Quran data
const loadQuranData = async () => {
  if (!quranVersesData) {
    try {
      const response = await fetch('/data/quran-verses.json');
      quranVersesData = await response.json();
    } catch (error) {
      console.error('Error loading Quran data:', error);
      return null;
    }
  }
  return quranVersesData;
};

// Helper function to get verses for a specific surah (now offline)
export const getSurahVerses = async (surahNumber) => {
  const data = await loadQuranData();
  if (!data) return [];
  
  const surah = data[parseInt(surahNumber)];
  if (!surah) return [];
  
  // Return verses in the expected format
  return surah.verses.map(verse => ({
    ...verse,
    // Add any additional formatting if needed
    translations: verse.translations || []
  }));
};

// Helper function to get all Quran data
export const getAllQuranData = async () => {
  return await loadQuranData();
};

// Helper function to get total verses count
export const getTotalVersesCount = async () => {
  const data = await loadQuranData();
  if (!data) return 0;
  return Object.values(data).reduce((total, surah) => total + surah.verses.length, 0);
};