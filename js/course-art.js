// The course follows a fixed sequence so a landmark can teach the next corner.
const COURSE_DISTRICTS = {
  richmond: [
    ['106 LENNOX', 0, 3], ['VICTORIA STREET', 4, 1], ['109 CROSSING', 2, 4],
    ['COMMISSION FLATS', 3, 0], ['SERVO BEND', 5, 2], ['MARKET BAR', 1, 5]
  ],
  space: [
    ['SCRAP PITS', 6, 11], ['DOME TERRACE', 7, 6], ['TEST RANGE', 8, 10],
    ['FUEL WORKS', 9, 11], ['BASALT GATE', 10, 8], ['SALVAGE YARD', 11, 7]
  ]
};

function drawAtlasCell(c, image, columns, rows, cell, x, y, width, height) {
  if (!image) return;
  const w = image.width / columns, h = image.height / rows;
  c.drawImage(image, (cell % columns) * w, Math.floor(cell / columns) * h, w, h,
    x - width / 2, y - height, width, height);
}

const RIDER_CELLS = {turbo:0, weasel:1, lucifer:2, karl:3, borkmaster:4, angus:5, fredo:6, courier:7, crowe:7};
const CHAPTER_LANDMARKS = {
  market:[4,2,1], lennox:[3,4,0], memory:[3,2,1], break:[1,4,5],
  space:[11,6,7], portal:[6,8,9], opening:[11,9,7], moon:[8,10,10], encore:[11,8,6]
};
function drawChapterLandmarks(c, chapter, camera, ground) {
  const marks = CHAPTER_LANDMARKS[chapter.id];
  if (!marks) return;
  marks.forEach((cell, index) => {
    const x = 260 + index * chapter.length * .26 - camera * .75;
    if (x > -230 && x < W + 230) drawAtlasCell(c, G.img.landmarks, 4, 3, cell, x, ground, 380, 240);
  });
}
