// Focal-point extraction for the gallery walk's smart cropping.
// For each master in src/assets/art: detect faces (Apple Vision); use the
// area-weighted centroid of all faces as the focal point. If no face is
// found, fall back to attention-based saliency; else center.
// Output: src/data/focal-points.json  { "<slug>": { "x": 0-100, "y": 0-100 } }
// Run: swift scripts/focal-points.swift   (re-run when works are added)

import Foundation
import Vision
import ImageIO

let artDir = "src/assets/art"
let outPath = "src/data/focal-points.json"

// Hand-tuned anchors that beat detection (applied last; survive regeneration).
// David: Vision picks Goliath's severed head — anchor on David's living face.
// The two equestrians: riders' heads sit near the canvas top, above what
// saliency finds; anchor the faces so wide crops keep them.
let OVERRIDES: [String: (x: Int, y: Int)] = [
  "david-with-the-head-of-goliath": (46, 16),
  "napoleon-crossing-the-alps": (55, 14),
  "equestrian-portrait-of-charles-v": (43, 10),
  "the-scream": (49, 70), // the screaming face sits low on the canvas
]

let fm = FileManager.default
var result: [String: [String: Int]] = [:]
var faceCount = 0, saliencyCount = 0, centerCount = 0

let files = try fm.contentsOfDirectory(atPath: artDir).filter { $0.hasSuffix(".jpg") }.sorted()
for file in files {
  let url = URL(fileURLWithPath: artDir + "/" + file)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
    let img = CGImageSourceCreateThumbnailAtIndex(src, 0, [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceThumbnailMaxPixelSize: 1200,
    ] as CFDictionary)
  else {
    FileHandle.standardError.write("skip (unreadable): \(file)\n".data(using: .utf8)!)
    continue
  }

  var fx = 50.0, fy = 50.0
  var how = "center"
  let handler = VNImageRequestHandler(cgImage: img, options: [:])

  let faceReq = VNDetectFaceRectanglesRequest()
  try? handler.perform([faceReq])
  if let faces = faceReq.results, !faces.isEmpty {
    let xs = faces.map { $0.boundingBox.midX }
    let spread = (xs.max() ?? 0) - (xs.min() ?? 0)
    if spread > 0.5, let big = faces.max(by: { $0.boundingBox.width * $0.boundingBox.height < $1.boundingBox.width * $1.boundingBox.height }) {
      // Faces span most of the canvas (group scene/panorama): no crop can hold
      // them all, so anchor on the largest face instead of a nowhere-centroid.
      fx = big.boundingBox.midX * 100
      fy = (1.0 - big.boundingBox.midY) * 100
      how = "largest-face-of(\(faces.count))"
    } else {
      var wx = 0.0, wy = 0.0, wsum = 0.0
      for f in faces {
        let b = f.boundingBox // normalized, bottom-left origin
        let w = Double(b.width * b.height)
        wx += b.midX * w
        wy += (1.0 - b.midY) * w // flip to top-left origin
        wsum += w
      }
      fx = wx / wsum * 100
      fy = wy / wsum * 100
      how = "face(\(faces.count))"
    }
    faceCount += 1
  } else {
    let salReq = VNGenerateAttentionBasedSaliencyImageRequest()
    try? handler.perform([salReq])
    if let obs = salReq.results?.first, let box = obs.salientObjects?.first?.boundingBox {
      fx = box.midX * 100
      fy = (1.0 - box.midY) * 100
      how = "saliency"
      saliencyCount += 1
    } else {
      centerCount += 1
    }
  }

  let slug = String(file.dropLast(4))
  if let o = OVERRIDES[slug] {
    fx = Double(o.x)
    fy = Double(o.y)
    how = "override"
  }
  result[slug] = ["x": Int(fx.rounded()), "y": Int(fy.rounded())]
  print("\(slug): \(Int(fx.rounded())),\(Int(fy.rounded()))  [\(how)]")
}

try fm.createDirectory(atPath: "src/data", withIntermediateDirectories: true)
let data = try JSONSerialization.data(
  withJSONObject: result, options: [.sortedKeys, .prettyPrinted])
try data.write(to: URL(fileURLWithPath: outPath))
print("\nwrote \(result.count) focal points → \(outPath)")
print("faces: \(faceCount), saliency: \(saliencyCount), center: \(centerCount)")
