// Recorta a la persona de un video con Apple Vision → ProRes 4444 con alfa.
// Uso: swift persona.swift entrada.mp4 salida.mov [desde_seg hasta_seg]
import AVFoundation
import CoreImage
import Vision

let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let from = args.count > 3 ? Double(args[3])! : 0
let to = args.count > 4 ? Double(args[4])! : Double.greatestFiniteMagnitude
try? FileManager.default.removeItem(at: outURL)

let asset = AVURLAsset(url: inURL)
let track = asset.tracks(withMediaType: .video)[0]
let size = track.naturalSize
let fps = track.nominalFrameRate
let reader = try! AVAssetReader(asset: asset)
let dur = min(to, asset.duration.seconds) - from
reader.timeRange = CMTimeRange(start: CMTime(seconds: from, preferredTimescale: 600), duration: CMTime(seconds: dur, preferredTimescale: 600))
let rOut = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(rOut)

let writer = try! AVAssetWriter(outputURL: outURL, fileType: .mov)
let wIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.proRes4444,
  AVVideoWidthKey: Int(size.width),
  AVVideoHeightKey: Int(size.height),
])
wIn.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: wIn, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: Int(size.width),
  kCVPixelBufferHeightKey as String: Int(size.height),
])
writer.add(wIn)
reader.startReading()
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let ctx = CIContext(options: [.workingColorSpace: NSNull()])
let seq = VNSequenceRequestHandler()
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
let start = CMTime(seconds: from, preferredTimescale: 600)
var n = 0

while let sample = rOut.copyNextSampleBuffer() {
  guard let px = CMSampleBufferGetImageBuffer(sample) else { continue }
  let t = CMTimeSubtract(CMSampleBufferGetPresentationTimeStamp(sample), start)
  try! seq.perform([req], on: px)
  let src = CIImage(cvPixelBuffer: px)
  var out = CIImage(color: .clear).cropped(to: src.extent)
  if let m = req.results?.first?.pixelBuffer {
    var mask = CIImage(cvPixelBuffer: m)
    mask = mask.transformed(by: CGAffineTransform(scaleX: src.extent.width / mask.extent.width, y: src.extent.height / mask.extent.height))
    // Borde un poco más suave
    mask = mask.applyingGaussianBlur(sigma: 1.2).cropped(to: src.extent)
    out = src.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: out, kCIInputMaskImageKey: mask])
  }
  while !wIn.isReadyForMoreMediaData { usleep(2000) }
  var buf: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buf)
  ctx.render(out, to: buf!)
  adaptor.append(buf!, withPresentationTime: t)
  n += 1
  if n % 150 == 0 { print("frames \(n)") }
}
wIn.markAsFinished()
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
print("OK \(n) frames @\(fps) → \(outURL.path)")
