export type RoomData = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
};

export type FurnitureData = {
  id: string;
  label: string;
  roomId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cleanTint: number;
  dirtyTint: number;
};

export type DoorData = {
  x: number;
  y: number;
};

export type LevelData = {
  name: string;
  width: number;
  height: number;
  playerSpawn: { x: number; y: number };
  arekSpawn: { x: number; y: number };
  door: DoorData;
  arekSpeed: number;
  rooms: RoomData[];
  furniture: FurnitureData[];
};

const furniture = (
  id: string,
  label: string,
  roomId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  cleanTint: number,
  dirtyTint: number
): FurnitureData => ({
  id,
  label,
  roomId,
  x,
  y,
  width,
  height,
  cleanTint,
  dirtyTint
});

export const LEVELS: LevelData[] = [
  {
    name: "Mieszkanie 1",
    width: 1280,
    height: 720,
    playerSpawn: { x: 170, y: 150 },
    arekSpawn: { x: 1090, y: 625 },
    door: { x: 1150, y: 645 },
    arekSpeed: 78,
    rooms: [
      { id: "hall", name: "Przedpokój", x: 30, y: 30, width: 250, height: 220, color: 0xffde8a },
      { id: "kitchen", name: "Kuchnia", x: 300, y: 30, width: 330, height: 270, color: 0xffc58c },
      { id: "bath", name: "Łazienka", x: 650, y: 30, width: 220, height: 270, color: 0xc6f0ff },
      { id: "bedroom", name: "Sypialnia", x: 890, y: 30, width: 360, height: 300, color: 0xfed6f6 },
      { id: "living", name: "Salon", x: 30, y: 275, width: 600, height: 395, color: 0xf6f0ad },
      { id: "dining", name: "Jadalnia", x: 650, y: 320, width: 260, height: 350, color: 0xffe7a4 },
      { id: "laundry", name: "Pralnia", x: 930, y: 350, width: 320, height: 320, color: 0xd5ffe1 }
    ],
    furniture: [
      furniture("shoe", "Szafka", "hall", 105, 95, 76, 48, 0x9ce7af, 0xc48b6f),
      furniture("bench", "Ława", "hall", 190, 195, 70, 40, 0x95dca2, 0xba7f67),
      furniture("fridge", "Lodówka", "kitchen", 370, 102, 56, 84, 0xa8ecff, 0x8f6f63),
      furniture("table", "Stół", "kitchen", 520, 165, 90, 72, 0xffef8a, 0xc08667),
      furniture("stove", "Garnek", "kitchen", 435, 250, 70, 52, 0xffcaa2, 0x9d6f67),
      furniture("bathtub", "Wanna", "bath", 715, 106, 92, 62, 0xa7efff, 0x9e7b73),
      furniture("sink", "Umywalka", "bath", 783, 230, 60, 46, 0xdffcff, 0x9a726d),
      furniture("bed", "Łóżko", "bedroom", 1015, 135, 132, 84, 0xffd2f7, 0xb58a83),
      furniture("closet", "Komoda", "bedroom", 1162, 248, 62, 58, 0xffe799, 0xad7f67),
      furniture("sofa", "Kanapa", "living", 195, 428, 132, 66, 0xade5ff, 0xbd8773),
      furniture("coffee", "Ławka", "living", 345, 520, 84, 54, 0xfff1a2, 0xbb8365),
      furniture("tv", "TV", "living", 500, 415, 88, 52, 0xc6d6ff, 0x8b6b61),
      furniture("dining-table", "Krzesła", "dining", 720, 465, 104, 84, 0xfff69b, 0xb88369),
      furniture("washing", "Pralka", "laundry", 1015, 438, 74, 74, 0xd1f5ff, 0x9c7c73),
      furniture("basket", "Kosz", "laundry", 1140, 560, 68, 50, 0xffd8a0, 0xb68167)
    ]
  },
  {
    name: "Mieszkanie 2",
    width: 1400,
    height: 760,
    playerSpawn: { x: 150, y: 635 },
    arekSpawn: { x: 1230, y: 110 },
    door: { x: 84, y: 676 },
    arekSpeed: 102,
    rooms: [
      { id: "hall", name: "Przedpokój", x: 30, y: 540, width: 255, height: 190, color: 0xffdd92 },
      { id: "kitchen", name: "Kuchnia", x: 30, y: 30, width: 360, height: 230, color: 0xffc796 },
      { id: "office", name: "Gabinet", x: 30, y: 280, width: 360, height: 235, color: 0xe4d2ff },
      { id: "living", name: "Salon", x: 415, y: 30, width: 525, height: 360, color: 0xf6efb0 },
      { id: "bath", name: "Łazienka", x: 965, y: 30, width: 210, height: 250, color: 0xbcefff },
      { id: "kids", name: "Pokój", x: 1195, y: 30, width: 175, height: 315, color: 0xffd1ef },
      { id: "dining", name: "Jadalnia", x: 415, y: 410, width: 355, height: 320, color: 0xffe8a8 },
      { id: "bedroom", name: "Sypialnia", x: 790, y: 300, width: 580, height: 430, color: 0xf8d5ff }
    ],
    furniture: [
      furniture("fridge", "Lodówka", "kitchen", 92, 92, 64, 92, 0xa4ebff, 0x8e6f65),
      furniture("counter", "Blat", "kitchen", 275, 126, 92, 60, 0xffed95, 0xbe886a),
      furniture("desk", "Biurko", "office", 112, 350, 106, 62, 0xd0c2ff, 0xaa8578),
      furniture("shelf", "Regał", "office", 280, 450, 78, 52, 0xffd095, 0xb07d69),
      furniture("sofa", "Kanapa", "living", 522, 118, 150, 72, 0xafdeff, 0xb98571),
      furniture("tv", "TV", "living", 805, 110, 82, 48, 0xc1d6ff, 0x8e6d64),
      furniture("coffee", "Ława", "living", 675, 258, 90, 52, 0xfff19d, 0xbf8667),
      furniture("bathtub", "Wanna", "bath", 1018, 88, 94, 60, 0x9cefff, 0x9f7a71),
      furniture("sink", "Umywalka", "bath", 1108, 210, 50, 42, 0xe4fbff, 0xa57870),
      furniture("toybox", "Zabawki", "kids", 1243, 120, 84, 60, 0xfff0a6, 0xbe8767),
      furniture("bed", "Łóżko", "kids", 1278, 252, 72, 54, 0xffd8f5, 0xb48982),
      furniture("table", "Stół", "dining", 556, 532, 120, 88, 0xfff59e, 0xbc8568),
      furniture("dresser", "Komoda", "bedroom", 889, 393, 80, 56, 0xffe194, 0xb17d69),
      furniture("bedroom-bed", "Łóżko", "bedroom", 1120, 452, 150, 88, 0xffd7f6, 0xb58780),
      furniture("chair", "Krzesło", "bedroom", 944, 610, 54, 44, 0x9de6b0, 0xbb826a)
    ]
  },
  {
    name: "Mieszkanie 3",
    width: 1480,
    height: 820,
    playerSpawn: { x: 180, y: 112 },
    arekSpawn: { x: 1310, y: 718 },
    door: { x: 1385, y: 728 },
    arekSpeed: 122,
    rooms: [
      { id: "hall", name: "Przedpokój", x: 30, y: 30, width: 270, height: 230, color: 0xffdd95 },
      { id: "kitchen", name: "Kuchnia", x: 320, y: 30, width: 360, height: 250, color: 0xffc38f },
      { id: "living", name: "Salon", x: 700, y: 30, width: 410, height: 360, color: 0xf5efaf },
      { id: "bath", name: "Łazienka", x: 1130, y: 30, width: 320, height: 240, color: 0xc6f0ff },
      { id: "study", name: "Gabinet", x: 30, y: 280, width: 300, height: 250, color: 0xe4d1ff },
      { id: "dining", name: "Jadalnia", x: 350, y: 300, width: 360, height: 260, color: 0xffe39d },
      { id: "bedroom", name: "Sypialnia", x: 730, y: 410, width: 420, height: 360, color: 0xfbd5ff },
      { id: "laundry", name: "Pralnia", x: 1170, y: 290, width: 280, height: 220, color: 0xdbffe4 },
      { id: "closet", name: "Garderoba", x: 1170, y: 530, width: 280, height: 240, color: 0xffefb4 }
    ],
    furniture: [
      furniture("bench", "Ława", "hall", 115, 182, 76, 46, 0x97e1a6, 0xbb8368),
      furniture("coat", "Wieszak", "hall", 215, 86, 52, 72, 0xffde96, 0xb67e69),
      furniture("fridge", "Lodówka", "kitchen", 405, 118, 64, 92, 0xa7ebff, 0x906f65),
      furniture("stove", "Garnek", "kitchen", 562, 202, 74, 54, 0xffcc9b, 0x9d7067),
      furniture("big-table", "Stół", "dining", 492, 420, 124, 94, 0xfff4a2, 0xbb8568),
      furniture("chairs", "Krzesła", "dining", 390, 332, 96, 62, 0x9ee6b2, 0xb57e68),
      furniture("sofa", "Kanapa", "living", 804, 152, 162, 76, 0xaedfff, 0xbc8772),
      furniture("tv", "TV", "living", 1015, 92, 84, 50, 0xc4d8ff, 0x8d6b62),
      furniture("lamp", "Lampa", "living", 888, 318, 56, 56, 0xffe498, 0xb98068),
      furniture("bathtub", "Wanna", "bath", 1212, 120, 96, 60, 0xa5efff, 0x9f7b72),
      furniture("sink", "Umywalka", "bath", 1362, 178, 50, 46, 0xe0fcff, 0x9e7870),
      furniture("desk", "Biurko", "study", 102, 404, 112, 68, 0xd0c1ff, 0xac8579),
      furniture("shelf", "Regał", "study", 255, 326, 64, 96, 0xffd39a, 0xb27f6a),
      furniture("bed", "Łóżko", "bedroom", 878, 540, 150, 90, 0xffd5f6, 0xb48780),
      furniture("dresser", "Komoda", "bedroom", 1062, 676, 78, 52, 0xffe08f, 0xb07e67),
      furniture("washing", "Pralka", "laundry", 1243, 365, 70, 70, 0xd4f5ff, 0x9c7b72),
      furniture("basket", "Kosz", "laundry", 1365, 460, 62, 48, 0xffd39d, 0xb37f67),
      furniture("wardrobe", "Szafa", "closet", 1248, 612, 94, 74, 0xffee9f, 0xb58269)
    ]
  }
];
