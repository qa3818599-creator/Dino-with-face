export class FaceController {
  constructor(video, statusElement) {
    this.video = video;
    this.statusElement = statusElement;
    this.enabled = false;
    this.jump = false;
    this.duck = false;
    this.landmarker = null;
    this.lastVideoTime = -1;
  }

  async toggle() {
    if (this.enabled) {
      this.stop();
      return false;
    }
    await this.start();
    return this.enabled;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.video.srcObject = stream;
      await this.video.play();
      this.enabled = true;
      this.statusElement.textContent = "Camera on";
      this.loadModel();
    } catch (error) {
      this.statusElement.textContent = "Camera unavailable";
      throw error;
    }
  }

  async loadModel() {
    try {
      const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/+esm");
      const fileset = await vision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm");
      this.landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });
      this.statusElement.textContent = "Face control ready";
    } catch (error) {
      this.statusElement.textContent = "Camera on - keyboard control active";
    }
  }

  update() {
    if (!this.enabled || !this.landmarker || this.video.readyState < 2) return;
    if (this.video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = this.video.currentTime;
    const result = this.landmarker.detectForVideo(this.video, performance.now());
    const landmarks = result.faceLandmarks?.[0];
    if (!landmarks) {
      this.jump = false;
      this.duck = false;
      return;
    }
    const upperLip = landmarks[13].y;
    const lowerLip = landmarks[14].y;
    const eyeY = (landmarks[33].y + landmarks[263].y) / 2;
    const noseY = landmarks[1].y;
    const faceHeight = Math.abs(landmarks[10].y - landmarks[152].y);
    this.jump = Math.abs(upperLip - lowerLip) * this.video.videoHeight > 20;
    this.duck = faceHeight > 0 && (noseY - eyeY) / faceHeight > 0.34;
  }

  stop() {
    this.video.srcObject?.getTracks().forEach(track => track.stop());
    this.video.srcObject = null;
    this.enabled = false;
    this.landmarker = null;
    this.jump = false;
    this.duck = false;
    this.statusElement.textContent = "Camera off";
  }
}
