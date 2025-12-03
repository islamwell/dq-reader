// List of Quranic reciters from everyayah.com
// Only highest quality versions are included

export const RECITERS = [
  { name: 'Alafasy', folder: 'Alafasy_128kbps', quality: '128 kbps' },
  { name: 'Abdul Basit Murattal', folder: 'Abdul_Basit_Murattal_192kbps', quality: '192 kbps' },
  { name: 'Abdul Basit Mujawwad', folder: 'Abdul_Basit_Mujawwad_128kbps', quality: '128 kbps' },
  { name: 'Abdurrahmaan As-Sudais', folder: 'Abdurrahmaan_As-Sudais_192kbps', quality: '192 kbps' },
  { name: 'Abdullah Basfar', folder: 'Abdullah_Basfar_192kbps', quality: '192 kbps' },
  { name: 'Abu Bakr Ash-Shaatree', folder: 'Abu_Bakr_Ash-Shaatree_128kbps', quality: '128 kbps' },
  { name: 'Ahmed Ibn Ali Al Ajamy', folder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net', quality: '128 kbps' },
  { name: 'Hani Rifai', folder: 'Hani_Rifai_192kbps', quality: '192 kbps' },
  { name: 'Hudhaify', folder: 'Hudhaify_128kbps', quality: '128 kbps' },
  { name: 'Husary', folder: 'Husary_128kbps', quality: '128 kbps' },
  { name: 'Husary Mujawwad', folder: 'Husary_128kbps_Mujawwad', quality: '128 kbps' },
  { name: 'Khalid Abdullah al-Qahtanee', folder: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', quality: '192 kbps' },
  { name: 'Maher Al Muaiqly', folder: 'MaherAlMuaiqly128kbps', quality: '128 kbps' },
  { name: 'Minshawy Mujawwad', folder: 'Minshawy_Mujawwad_192kbps', quality: '192 kbps' },
  { name: 'Minshawy Murattal', folder: 'Minshawy_Murattal_128kbps', quality: '128 kbps' },
  { name: 'Mohammad al Tablaway', folder: 'Mohammad_al_Tablaway_128kbps', quality: '128 kbps' },
  { name: 'Muhammad Ayyoub', folder: 'Muhammad_Ayyoub_128kbps', quality: '128 kbps' },
  { name: 'Muhammad Jibreel', folder: 'Muhammad_Jibreel_128kbps', quality: '128 kbps' },
  { name: 'Muhsin Al Qasim', folder: 'Muhsin_Al_Qasim_192kbps', quality: '192 kbps' },
  { name: 'Nasser Alqatami', folder: 'Nasser_Alqatami_128kbps', quality: '128 kbps' },
  { name: 'Saood ash-Shuraym', folder: 'Saood_ash-Shuraym_128kbps', quality: '128 kbps' },
  { name: 'Yasser Ad-Dussary', folder: 'Yasser_Ad-Dussary_128kbps', quality: '128 kbps' }
];

export const DEFAULT_RECITER = 'Alafasy_128kbps';

export const getReciterByFolder = (folder) => {
  return RECITERS.find(r => r.folder === folder) || RECITERS[0];
};
