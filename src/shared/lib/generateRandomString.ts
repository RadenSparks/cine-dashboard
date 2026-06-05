const cinemaSpecs = [
  "DCP",
  "4K",
  "HDR",
  "24fps",
  "48fps",
  "Dolby Atmos",
  "DTS:X",
  "Auro 3D",
  "2K",
  "8K",
  "SDR",
  "RAW",
  "ProRes",
  "IMAX",
];

export function generateRandomString(length: number): string {
  let result = "";
  const baseText = "DCP 4K HDR 24fps Dolby Atmos DTS:X";
  
  while (result.length < length) {
    // Mix of base cinema specs and variations
    if (Math.random() > 0.3) {
      result += baseText + " ";
    } else {
      const randomSpec = cinemaSpecs[Math.floor(Math.random() * cinemaSpecs.length)];
      result += randomSpec + " ";
    }
  }
  
  return result.slice(0, length);
}