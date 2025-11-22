// Test file to verify audio URL generation and reciter selection

const DEFAULT_RECITER = 'Alafasy_128kbps';

const RECITERS = [
  { name: 'Alafasy', folder: 'Alafasy_128kbps', quality: '128 kbps' },
  { name: 'Abdul Basit Murattal', folder: 'Abdul_Basit_Murattal_192kbps', quality: '192 kbps' },
  { name: 'Hudhaify', folder: 'Hudhaify_128kbps', quality: '128 kbps' }
];

// Simulate the getAudioUrl function
function getAudioUrl(surahNumber, ayahNumber, selectedReciter, audioMappings = {}) {
  const key = `${surahNumber}:${ayahNumber}`;
  const mapping = audioMappings[key];

  if (mapping?.customUrl) {
    return mapping.customUrl;
  }

  if (mapping?.url) {
    return mapping.url;
  }

  return `https://everyayah.com/data/${selectedReciter}/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
}

console.log('Testing Audio URL Generation:');
console.log('============================\n');

// Test 1: Default reciter (Alafasy)
const url1 = getAudioUrl(1, 1, DEFAULT_RECITER);
console.log('Test 1 - Surah 1, Ayah 1 with Alafasy:');
console.log('Expected: https://everyayah.com/data/Alafasy_128kbps/001001.mp3');
console.log('Actual:  ', url1);
console.log('✓ Pass:', url1 === 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3');
console.log('');

// Test 2: Different reciter (Abdul Basit)
const url2 = getAudioUrl(2, 255, 'Abdul_Basit_Murattal_192kbps');
console.log('Test 2 - Surah 2, Ayah 255 with Abdul Basit:');
console.log('Expected: https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3');
console.log('Actual:  ', url2);
console.log('✓ Pass:', url2 === 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3');
console.log('');

// Test 3: Surah 114, Ayah 6 (last ayah)
const url3 = getAudioUrl(114, 6, 'Hudhaify_128kbps');
console.log('Test 3 - Surah 114, Ayah 6 with Hudhaify:');
console.log('Expected: https://everyayah.com/data/Hudhaify_128kbps/114006.mp3');
console.log('Actual:  ', url3);
console.log('✓ Pass:', url3 === 'https://everyayah.com/data/Hudhaify_128kbps/114006.mp3');
console.log('');

// Test 4: With custom audio mapping
const customMappings = {
  '1:1': { customUrl: 'https://custom.com/audio/001001.mp3' }
};
const url4 = getAudioUrl(1, 1, DEFAULT_RECITER, customMappings);
console.log('Test 4 - With custom URL mapping:');
console.log('Expected: https://custom.com/audio/001001.mp3');
console.log('Actual:  ', url4);
console.log('✓ Pass:', url4 === 'https://custom.com/audio/001001.mp3');
console.log('');

// Test 5: Verify reciter data structure
console.log('Test 5 - Verify reciters data structure:');
const hasValidStructure = RECITERS.every(r =>
  r.name && typeof r.name === 'string' &&
  r.folder && typeof r.folder === 'string' &&
  r.quality && typeof r.quality === 'string'
);
console.log('✓ Pass:', hasValidStructure);
console.log('');

console.log('All tests completed!');
