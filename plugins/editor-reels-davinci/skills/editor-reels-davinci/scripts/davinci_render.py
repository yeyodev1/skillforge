# Exporta el timeline actual a mp4 (H.264, 1080x1920, 30 fps, AAC 48 kHz) y espera a que termine.
# Uso: <carpeta_salida> <nombre_archivo>
import sys, time
if "resolve" not in globals():
    import DaVinciResolveScript as dvr
    resolve = dvr.scriptapp("Resolve")
p = resolve.GetProjectManager().GetCurrentProject()
out_dir, name = sys.argv[1], sys.argv[2]
p.SetCurrentRenderFormatAndCodec("mp4", "H264")
p.SetRenderSettings({"TargetDir": out_dir, "CustomName": name,
                     "FormatWidth": 1080, "FormatHeight": 1920, "FrameRate": 30, "SelectAllFrames": True, "ExportVideo": True, "ExportAudio": True,
                     "AudioCodec": "aac", "AudioBitDepth": 24, "AudioSampleRate": 48000})
p.DeleteAllRenderJobs()
job = p.AddRenderJob()
p.StartRendering(job)
while p.IsRenderingInProgress():
    time.sleep(2)
print(p.GetRenderJobStatus(job))
