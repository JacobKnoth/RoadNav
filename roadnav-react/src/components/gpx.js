// utils/gpx.js
/**
 * Convert an array of [lat, lon] points to a GPX XML string.
 * @param {Array<[number, number]>} points
 * @param {String} name  A human-readable track name (optional)
 */
export function pointsToGpx(points, name = 'Route') {
  const header =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1" creator="RoadNav" xmlns="http://www.topografix.com/GPX/1/1">\n` +
    `  <trk>\n    <name>${name}</name>\n    <trkseg>\n`;

  const body = points
    .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
    .join('\n');

  const footer =
    `\n    </trkseg>\n  </trk>\n</gpx>\n`;

  return header + body + footer;
}

/**
 * Offer a text blob as a file download.
 * @param {String} text    File contents
 * @param {String} name    Download filename
 * @param {String} mime    MIME type
 */
export function downloadText(text, name, mime = 'application/gpx+xml') {
  const blob = new Blob([text], { type: mime });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
