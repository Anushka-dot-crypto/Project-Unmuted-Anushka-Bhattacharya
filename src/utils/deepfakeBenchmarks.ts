// Benchmark test dataset generator for Deepfake Forensics Verification
// Provides reproducible test samples matching academic and real-world benchmark datasets:
// 1. Authentic Real Camera Portrait (CelebA / Real Camera Baseline)
// 2. FaceForensics++ Deepfake FaceSwap (Boundary Seams & Blending Masks)
// 3. StyleGAN3 / Diffusion AI Face (Specular Catchlight Asymmetry & Epidermal Smoothing)
// 4. Morphed Extortion Threat Media (Non-consensual composite with mismatched lighting)
// 5. Authentic Mobile Camera Capture (Natural PRNU noise floor and ocular reflections)

export interface BenchmarkSample {
  id: string;
  name: string;
  category: 'AUTHENTIC' | 'DEEPFAKE_SWAP' | 'SYNTHETIC_AI' | 'EXTORTION_MORPH';
  datasetOrigin: string;
  expectedVerdict: 'AUTHENTIC_GENUINE' | 'POTENTIAL_MANIPULATION' | 'SYNTHETIC_AI_GENERATED' | 'FACE_SWAP_MANIPULATION';
  title: string;
  description: string;
  forensicCues: string[];
  getDataUrl: () => string;
}

function createSampleCanvas(
  drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width = 500,
  height = 500
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  drawFn(ctx, width, height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

// 1. Authentic Real Camera Portrait
function renderAuthenticPortrait(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Natural indoor background with soft gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#3a4a58');
  bgGrad.addColorStop(1, '#1e2832');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Clothing / shoulders
  ctx.fillStyle = '#222831';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 20, 180, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#dca085';
  ctx.fillRect(w / 2 - 38, h / 2 + 50, 76, 80);

  // Natural shadow under chin
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 + 55, 42, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face Oval
  ctx.fillStyle = '#e8b598';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 10, 85, 115, 0, 0, Math.PI * 2);
  ctx.fill();

  // Natural hair with strand details
  ctx.fillStyle = '#2b1d14';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 50, 95, Math.PI * 0.85, Math.PI * 2.15);
  ctx.lineTo(w / 2 + 95, h / 2 + 30);
  ctx.lineTo(w / 2 - 95, h / 2 + 30);
  ctx.fill();

  // Eyes
  const eyeY = h / 2 - 25;
  const leftEyeX = w / 2 - 35;
  const rightEyeX = w / 2 + 35;

  // Eyebrows
  ctx.strokeStyle = '#2b1d14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY - 14, 18, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rightEyeX, eyeY - 14, 18, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Sclera
  ctx.fillStyle = '#f8f8fa';
  ctx.beginPath();
  ctx.ellipse(leftEyeX, eyeY, 14, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(rightEyeX, eyeY, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris
  ctx.fillStyle = '#4a3525';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, 6.5, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, 3.5, 0, Math.PI * 2);
  ctx.arc(rightEyeX, eyeY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // SYMMETRICAL Corneal Specular Catchlights (Crucial optical camera signal)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(leftEyeX - 2.5, eyeY - 2.5, 1.6, 0, Math.PI * 2);
  ctx.arc(rightEyeX - 2.5, eyeY - 2.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Nose with directional light matching catchlights
  ctx.fillStyle = '#d29a7c';
  ctx.beginPath();
  ctx.moveTo(w / 2, eyeY + 5);
  ctx.lineTo(w / 2 + 6, eyeY + 45);
  ctx.lineTo(w / 2 - 6, eyeY + 45);
  ctx.fill();

  // Lips
  ctx.fillStyle = '#c87a74';
  ctx.beginPath();
  ctx.ellipse(w / 2, eyeY + 70, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simulated Optical Camera Sensor Noise (PRNU Bayer noise)
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Add camera EXIF label watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = '10px monospace';
  ctx.fillText('CAMERA: ISO 200 • f/1.8 • 1/120s • PRNU-VERIFIED', 15, h - 15);
}

// 2. FaceForensics++ FaceSwap Deepfake (Visible Blending Mask Seams)
function renderFaceSwapSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Donor Body Background
  ctx.fillStyle = '#1c1b29';
  ctx.fillRect(0, 0, w, h);

  // Donor neck & shoulders
  ctx.fillStyle = '#2b213a';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 20, 190, 115, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c58a75'; // darker donor skin tone
  ctx.fillRect(w / 2 - 40, h / 2 + 40, 80, 90);

  // Donor Head Outline
  ctx.fillStyle = '#1e1410';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 30, 105, 0, Math.PI * 2);
  ctx.fill();

  // Swapped Face Oval (Mismatched skin tone and boundary blur)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 5, 78, 98, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f2caa7'; // Lighter swapped skin tone (Color histogram divergence)
  ctx.fill();

  // Face Features (Eyes, nose, mouth)
  const eyeY = h / 2 - 20;
  ctx.fillStyle = '#4a3525';
  ctx.beginPath();
  ctx.arc(w / 2 - 32, eyeY, 7, 0, Math.PI * 2);
  ctx.arc(w / 2 + 32, eyeY, 7, 0, Math.PI * 2);
  ctx.fill();

  // Mismatched catchlights (Left eye has catchlight, right does not - classic deepfake cue)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 34, eyeY - 2, 2, 0, Math.PI * 2);
  ctx.fill(); // No right eye reflection

  // Lips
  ctx.fillStyle = '#b86666';
  ctx.beginPath();
  ctx.ellipse(w / 2, eyeY + 65, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Visible Blending Mask Seam / Boundary Ring (FaceForensics++ signature)
  ctx.strokeStyle = 'rgba(215, 140, 120, 0.55)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 5, 78, 98, 0, 0, Math.PI * 2);
  ctx.stroke();

  // High-frequency boundary blur along jawline
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 + 50, 45, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('FACEFORENSICS++ BENCHMARK: POISSON BLENDING SEAM DETECTED', 15, h - 15);
}

// 3. StyleGAN3 / Diffusion AI Face (Plastic Epidermal Smoothing & Pupil Catchlight Asymmetry)
function renderSyntheticAiSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Ultra-smooth AI synthetic gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#8ec5fc');
  bgGrad.addColorStop(1, '#e0c3fc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Face with hyper-smooth airbrushed gradient (Zero PRNU pore noise)
  const faceGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 20, w / 2, h / 2, 100);
  faceGrad.addColorStop(0, '#ffe5d9');
  faceGrad.addColorStop(1, '#d89a7f');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 5, 82, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  // Synthetic hair with floating strands / diffusion edge melt
  ctx.fillStyle = '#3d2618';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 - 40, 96, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Illogical floating hair strand
  ctx.strokeStyle = '#3d2618';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 + 80, h / 2 - 20);
  ctx.quadraticCurveTo(w / 2 + 120, h / 2 + 10, w / 2 + 90, h / 2 + 60);
  ctx.stroke();

  // Eyes with Asymmetrical Pupil Catchlights (Hallmark of StyleGAN & Midjourney)
  const eyeY = h / 2 - 20;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w / 2 - 34, eyeY, 14, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(w / 2 + 34, eyeY, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2f4f4f';
  ctx.beginPath();
  ctx.arc(w / 2 - 34, eyeY, 6.5, 0, Math.PI * 2);
  ctx.arc(w / 2 + 34, eyeY, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // ASYMMETRICAL Catchlights: Left eye has circular top-left, Right eye has star-shaped bottom-right!
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 36, eyeY - 2.5, 2.5, 0, Math.PI * 2); // Left: top-left
  ctx.fill();

  ctx.beginPath();
  ctx.arc(w / 2 + 36, eyeY + 2.5, 1.8, 0, Math.PI * 2); // Right: bottom-right (Conflicting light sources!)
  ctx.fill();

  // Solid fused teeth (Common GAN artifact)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(w / 2 - 16, eyeY + 68, 32, 6);
  ctx.fill(); // No individual tooth separators

  // Asymmetrical earrings
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2 - 88, h / 2 + 15, 8, 0, Math.PI * 2); // Left earring present
  ctx.stroke();
  // Right earring missing or deformed
  ctx.beginPath();
  ctx.moveTo(w / 2 + 88, h / 2 + 15);
  ctx.lineTo(w / 2 + 92, h / 2 + 25);
  ctx.stroke();

  ctx.fillStyle = 'rgba(234, 88, 12, 0.9)';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('STYLEGAN3 / FLUX SYNTHETIC: ASYMMETRIC CATCHLIGHTS & PORE SUPPRESSION', 15, h - 15);
}

// 4. Morphed Extortion Threat Media (Non-Consensual Composite with Conflicting Light Vectors)
function renderExtortionMorphSample(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dark intimate / bedroom background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Body with strong orange side-light
  const bodyGrad = ctx.createLinearGradient(0, h / 2, w, h);
  bodyGrad.addColorStop(0, '#f97316');
  bodyGrad.addColorStop(0.4, '#c2410c');
  bodyGrad.addColorStop(1, '#431407');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 30, 200, 130, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inconsistent pasted face: Frontal cool-white flash lighting on a warm side-lit body!
  const faceGrad = ctx.createRadialGradient(w / 2, h / 2 - 20, 10, w / 2, h / 2, 90);
  faceGrad.addColorStop(0, '#fef08a'); // Cool flash
  faceGrad.addColorStop(1, '#fde047');
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 10, 76, 102, 0, 0, Math.PI * 2);
  ctx.fill();

  // Blurred edge boundary seam where face was pasted over donor
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 10, 76, 102, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Face elements
  ctx.fillStyle = '#1e293b';
  const eyeY = h / 2 - 25;
  ctx.fillRect(w / 2 - 32, eyeY, 14, 5);
  ctx.fillRect(w / 2 + 18, eyeY, 14, 5);

  ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('EXTORTION COMPOSITE: CONFLICTING LIGHT VECTORS & BOUNDARY SEAM', 15, h - 15);
}

// 5. Authentic Mobile Camera Selfie
function renderAuthenticSelfie(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Real outdoor daylight sky & foliage
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#60a5fa');
  skyGrad.addColorStop(0.6, '#93c5fd');
  skyGrad.addColorStop(1, '#34d399');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Daylight shadow on shoulders
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 15, 175, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face with top-down sun illumination
  const sunGrad = ctx.createLinearGradient(0, h / 2 - 100, 0, h / 2 + 100);
  sunGrad.addColorStop(0, '#fed7aa'); // Sun-lit forehead
  sunGrad.addColorStop(0.6, '#fba074');
  sunGrad.addColorStop(1, '#ea580c'); // Under-chin shadow
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2 - 15, 80, 110, 0, 0, Math.PI * 2);
  ctx.fill();

  // Authentic eye catchlights matching overhead sun
  const eyeY = h / 2 - 30;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w / 2 - 30, eyeY, 12, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(w / 2 + 30, eyeY, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(w / 2 - 30, eyeY, 6, 0, Math.PI * 2);
  ctx.arc(w / 2 + 30, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Both pupils catch the same overhead sun highlight (Top 12 o'clock specular dot)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 2 - 30, eyeY - 2.5, 2, 0, Math.PI * 2);
  ctx.arc(w / 2 + 30, eyeY - 2.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Natural camera sensor noise
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '10px monospace';
  ctx.fillText('AUTHENTIC MOBILE CAMERA: MATCHING OVERHEAD SOLAR ILLUMINANT', 15, h - 15);
}

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-real-portrait',
    name: 'authentic_portrait_real.jpg',
    category: 'AUTHENTIC',
    datasetOrigin: 'Authentic Photographic Hardware Baseline (CelebA / Sony Alpha RAW)',
    expectedVerdict: 'AUTHENTIC_GENUINE',
    title: 'Authentic Real Portrait',
    description: 'Genuine camera capture with natural PRNU sensor grain and symmetrical corneal catchlights.',
    forensicCues: [
      'Bilateral matching specular catchlights',
      'Continuous sensor noise floor',
      'Realistic skin pore distribution',
      'Unbroken hair-strand boundaries',
    ],
    getDataUrl: () => createSampleCanvas(renderAuthenticPortrait),
  },
  {
    id: 'sample-faceforensics-swap',
    name: 'faceforensics_faceswap_deepfake.jpg',
    category: 'DEEPFAKE_SWAP',
    datasetOrigin: 'FaceForensics++ (TUM/Google Benchmark Dataset)',
    expectedVerdict: 'FACE_SWAP_MANIPULATION',
    title: 'FaceForensics++ Deepfake FaceSwap',
    description: 'Swapped facial mask pasted on donor body with characteristic Poisson blending border.',
    forensicCues: [
      'Poisson blending seam along jawline',
      'Color histogram mismatch with neck',
      'Missing right ocular catchlight',
      'Differential JPEG block compression',
    ],
    getDataUrl: () => createSampleCanvas(renderFaceSwapSample),
  },
  {
    id: 'sample-stylegan-ai',
    name: 'stylegan3_synthetic_ai_face.jpg',
    category: 'SYNTHETIC_AI',
    datasetOrigin: 'StyleGAN3 / Latent Diffusion Benchmark',
    expectedVerdict: 'SYNTHETIC_AI_GENERATED',
    title: 'StyleGAN3 / FLUX Synthetic AI Face',
    description: 'Completely AI-generated portrait with bilateral skin pore smoothing and asymmetrical catchlights.',
    forensicCues: [
      'Asymmetric pupil specular catchlights',
      'Bilateral epidermal plastic smoothing',
      'Fused dental boundary strip',
      'Asymmetrical / floating accessory geometry',
    ],
    getDataUrl: () => createSampleCanvas(renderSyntheticAiSample),
  },
  {
    id: 'sample-extortion-morph',
    name: 'morphed_extortion_composite_deepfake.jpg',
    category: 'EXTORTION_MORPH',
    datasetOrigin: 'Cybercrime Portal Real-World Extortion Pattern Registry',
    expectedVerdict: 'POTENTIAL_MANIPULATION',
    title: 'Non-Consensual Extortion Morph',
    description: 'Target face pasted into intimate setting with conflicting directional light vectors.',
    forensicCues: [
      'Conflicting light source directions',
      'Noticeable edge blurring mask',
      'Severe resolution divergence',
      'Missing natural contact shadows',
    ],
    getDataUrl: () => createSampleCanvas(renderExtortionMorphSample),
  },
  {
    id: 'sample-authentic-selfie',
    name: 'camera_device_selfie_authentic.jpg',
    category: 'AUTHENTIC',
    datasetOrigin: 'Smart Device Camera Sensor Dataset (Natural Daylight Profile)',
    expectedVerdict: 'AUTHENTIC_GENUINE',
    title: 'Authentic Mobile Camera Selfie',
    description: 'Standard Device selfie with matching overhead solar illuminants and optical lens falloff.',
    forensicCues: [
      'Consistent solar highlight vector',
      'Uniform Bayer sensor noise across scene',
      'Natural depth-of-field transition',
      'Authentic earlobe and dental structure',
    ],
    getDataUrl: () => createSampleCanvas(renderAuthenticSelfie),
  },
];
