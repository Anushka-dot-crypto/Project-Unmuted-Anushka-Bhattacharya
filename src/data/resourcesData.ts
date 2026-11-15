import { ResourceCategory } from '../types';

export const RESOURCES_DATA: ResourceCategory[] = [
  {
    id: 'cyber_safety',
    title: 'Cyber Safety & Hygiene',
    description: 'Essential practices to shield your digital life and prevent unauthorized access.',
    icon: 'ShieldCheck',
    articles: [
      {
        id: 'passwords_2fa',
        title: 'Mastering Passwords & 2-Factor Authentication',
        summary: 'How to lock down your accounts against credential stuffing and brute force attacks.',
        content: `Two-Factor Authentication (2FA) is your strongest line of defense against unauthorized logins. When 2FA is active, an attacker cannot log in even if they obtain your password.

Key Practices:
1. Use Authenticator Apps (Google Authenticator, Aegis) instead of SMS OTPs whenever possible.
2. Store emergency backup codes in a safe physical location.
3. Use passphrases (e.g., 'Coffee#Stormy42$Summer') rather than short dictionary words.`,
        steps: [
          'Go to Security Settings in your email / social accounts.',
          'Select Two-Step Verification or 2FA.',
          'Choose Authenticator App as primary method.',
          'Download and save offline backup recovery codes.',
        ],
      },
    ],
  },
  {
    id: 'evidence_preservation',
    title: 'Evidence Preservation Guide',
    description: 'How to capture legally admissible evidence without accidentally compromising metadata.',
    icon: 'FileCheck',
    articles: [
      {
        id: 'screenshot_standards',
        title: 'How to Take Admissible Digital Screenshots',
        summary: 'Standardized methods to ensure screenshots contain full context for law enforcement.',
        content: `A simple cropped image may be disputed in formal legal proceedings. To make screenshots credible:

Requirements for Evidence Screenshots:
1. Include full browser window or Device screen showing status bar, system clock, and battery level.
2. Capture the full account handle (@username), profile photo, and full webpage URL.
3. Capture exact timestamps on the post or message.
4. Export or download original source files (JPEG/PNG/MP4) without editing or altering file names.`,
        steps: [
          'Never crop out the URL bar or system status clock.',
          'Save file directly to a dedicated local folder.',
          'Note down exact date and time of discovery.',
          'Calculate SHA-256 hash or keep original file untouched.',
        ],
      },
    ],
  },
  {
    id: 'reporting_avenues',
    title: 'Official Reporting Channels',
    description: 'Official portals for reporting cybercrimes, financial fraud, and platform abuse.',
    icon: 'Landmark',
    articles: [
      {
        id: 'cybercrime_portal',
        title: 'National Cyber Crime Reporting Portal (1930 Helpline)',
        summary: 'Guide to filing formal complaints on India cybercrime.gov.in.',
        content: `The National Cyber Crime Reporting Portal (cybercrime.gov.in) is the official Government of India initiative to facilitate victims to report cybercrime complaints online.

 Helpline 1930: Dedicated 24/7 hotline for reporting financial fraud within the 'Golden Hour' (first 2-4 hours) to freeze stolen money in suspect bank accounts.
 Complaint Categories: Women & Child Related Crime, Financial Fraud, Other Cybercrimes.`,
        steps: [
          'Visit cybercrime.gov.in or call 1930.',
          'Click "Report Other Cyber Crime" or "Report Women/Child Related Crime".',
          'Register with mobile number and fill incident details.',
          'Upload saved evidence files and submit to receive an official Acknowledgement Number.',
        ],
        links: [
          { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' },
          { label: 'StopNCII Takedown Tool', url: 'https://stopncii.org' },
        ],
      },
    ],
  },
  {
    id: 'deepfake_awareness',
    title: 'Deepfakes & AI Misuse',
    description: 'Understanding deepfakes, synthetic media rights, and automated takedown tools.',
    icon: 'Sparkles',
    articles: [
      {
        id: 'stop_ncii_guide',
        title: 'Using StopNCII.org & TakeItDown',
        summary: 'Privacy-preserving tools that generate digital hashes to block intimate imagery automatically.',
        content: `StopNCII.org and TakeItDown (operated by NCMEC) allow individuals to create cryptographic hash signatures of intimate media directly on their device. The raw photo or video is NEVER uploaded. Participating technology companies (Meta, TikTok, OnlyFans, etc.) use these hashes to detect and remove matching content automatically across their networks.`,
        steps: [
          'Open StopNCII.org or TakeItDown.ncmec.org in a browser.',
          'Follow the on-device prompt to select the image/video file.',
          'The browser generates a unique digital fingerprint (hash) locally.',
          'Save your case PIN for tracking takedown status.',
        ],
      },
    ],
  },
];
