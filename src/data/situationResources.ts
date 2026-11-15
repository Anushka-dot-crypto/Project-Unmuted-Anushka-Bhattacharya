import { IncidentType } from '../types';

export interface SituationResource {
  id: string;
  title: string;
  category: 'official_portal' | 'takedown_tool' | 'emergency_helpline' | 'platform_form' | 'legal_support' | 'mental_health';
  categoryLabel: string;
  badge?: string;
  description: string;
  actionGuidance: string;
  url?: string;
  helplineNumber?: string;
  applicableIncidentTypes: IncidentType[];
  platforms?: string[];
  isHighPriority?: boolean;
}

export const ALL_SITUATION_RESOURCES: SituationResource[] = [
  // ==========================================
  // OFFICIAL GOVERNMENT & POLICE PORTALS
  // ==========================================
  {
    id: 'gov_cybercrime_portal',
    title: 'National Cyber Crime Reporting Portal',
    category: 'official_portal',
    categoryLabel: 'Official Portal',
    badge: 'Govt of India Official',
    description: 'Official Ministry of Home Affairs portal for registering formal cybercrime complaints (Women/Child & Financial crime).',
    actionGuidance: 'Click "Report Women/Child Related Crime" or "Report Other Cyber Crime". Upload your UNMUTED evidence police report and screenshots to receive an official FIR / Acknowledgement Number.',
    url: 'https://cybercrime.gov.in',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'account_hacked', 'threats', 'child_safety', 'other'],
    isHighPriority: true,
  },
  {
    id: 'helpline_1930',
    title: '1930 National Cyber Fraud & Extortion Helpline',
    category: 'emergency_helpline',
    categoryLabel: 'Emergency Helpline',
    badge: 'Immediate Golden Hour',
    description: '24/7 Citizen Financial Cyber Fraud Reporting System to freeze fraudulent financial transfers and report urgent blackmail/extortion.',
    actionGuidance: 'Dial immediately if money or UPI payment was demanded or sent. Operating within the first 2-4 hours ("Golden Hour") maximizes the probability of freezing illicit transactions.',
    helplineNumber: '1930',
    applicableIncidentTypes: ['blackmail', 'account_hacked', 'threats', 'other'],
    isHighPriority: true,
  },
  {
    id: 'helpline_112',
    title: '112 National Police & Emergency Response Service',
    category: 'emergency_helpline',
    categoryLabel: 'Emergency Helpline',
    badge: 'Immediate Physical Threat',
    description: 'All-in-one emergency dispatch number for police, fire, and medical assistance across India.',
    actionGuidance: 'Call immediately if the perpetrator threatens physical violence, home visits, acid attacks, or immediate bodily harm.',
    helplineNumber: '112',
    applicableIncidentTypes: ['threats', 'cyberstalking', 'blackmail', 'child_safety'],
    isHighPriority: true,
  },
  {
    id: 'pocso_ebox',
    title: 'POCSO e-Box (NCPCR)',
    category: 'official_portal',
    categoryLabel: 'Child Protection Portal',
    badge: 'Under-18 Priority',
    description: 'National Commission for Protection of Child Rights electronic box for easy and direct reporting of child sexual abuse and online exploitation.',
    actionGuidance: 'Fill the guided online form with incident details. NCPCR coordinates directly with state police cells and child welfare committees.',
    url: 'https://ncpcr.gov.in/pocso-e-box',
    applicableIncidentTypes: ['child_safety', 'deepfake', 'blackmail'],
    isHighPriority: true,
  },
  {
    id: 'helpline_1098',
    title: '1098 Childline India 24/7 Helpline',
    category: 'emergency_helpline',
    categoryLabel: 'Child Protection',
    badge: 'Toll-Free Minor Hotline',
    description: "India's first 24-hour, free, emergency Device outreach service for children in need of care and protection.",
    actionGuidance: 'Call for immediate guidance, crisis counseling, and rescue coordination for minors targeted by online predators or coercion.',
    helplineNumber: '1098',
    applicableIncidentTypes: ['child_safety', 'blackmail', 'deepfake'],
    isHighPriority: true,
  },
  {
    id: 'ncw_helpline',
    title: 'National Commission for Women (NCW) 24/7 Helpline',
    category: 'emergency_helpline',
    categoryLabel: 'Women Protection',
    badge: '24/7 Support for Women',
    description: 'Dedicated round-the-clock helpline for women facing online harassment, blackmail, stalking, or morphing.',
    actionGuidance: 'Dial to receive immediate legal counsel, psychological support, and institutional police escalation assistance.',
    helplineNumber: '7827170170',
    url: 'http://ncwapps.nic.in',
    applicableIncidentTypes: ['cyberstalking', 'blackmail', 'deepfake', 'threats'],
  },

  // ==========================================
  // SPECIALIZED TAKEDOWN & HASH SUPPRESSION TOOLS
  // ==========================================
  {
    id: 'stop_ncii',
    title: 'StopNCII.org (Non-Consensual Image Takedown)',
    category: 'takedown_tool',
    categoryLabel: 'Automated Takedown',
    badge: 'Adults 18+ Privacy Shield',
    description: 'Free global platform that generates secure digital hashes directly on your Device so intimate photos never leave your device while blocking them across tech platforms.',
    actionGuidance: 'Open on your Device, select the threatening/intimate media. The browser generates a cryptographic hash fingerprint. Tech partners (Meta, OnlyFans, TikTok, etc.) use this to stop distribution.',
    url: 'https://stopncii.org',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking'],
    isHighPriority: true,
  },
  {
    id: 'take_it_down',
    title: 'Take It Down (NCMEC)',
    category: 'takedown_tool',
    categoryLabel: 'Automated Takedown',
    badge: 'Under-18 / Minor Protection',
    description: 'Operated by the National Center for Missing & Exploited Children to remove or block explicit images of individuals taken when they were under 18.',
    actionGuidance: 'Create an anonymous case on TakeItDown.ncmec.org to hash images on-device and prevent them from being uploaded or circulating on major platforms.',
    url: 'https://takeitdown.ncmec.org',
    applicableIncidentTypes: ['child_safety', 'deepfake', 'blackmail'],
    isHighPriority: true,
  },
  {
    id: 'google_removal_explicit',
    title: 'Google Search Non-Consensual Imagery Removal',
    category: 'takedown_tool',
    categoryLabel: 'Search Takedown',
    badge: 'Official Google Takedown',
    description: 'Official Google request form to permanently remove explicit, non-consensual personal imagery or deepfakes from Google Search results.',
    actionGuidance: 'Submit the direct search URLs where fake or private media is indexed. Google rapidly delists these links from global search results.',
    url: 'https://support.google.com/websearch/troubleshooter/3111061',
    applicableIncidentTypes: ['deepfake', 'blackmail', 'cyberstalking'],
  },
  {
    id: 'google_doxxing_removal',
    title: 'Google Personal Information Removal (Doxxing)',
    category: 'takedown_tool',
    categoryLabel: 'Search Takedown',
    badge: 'Anti-Doxxing',
    description: 'Request removal of personally identifiable info (home address, personal Device number, confidential identity documents, bank details) from Google Search.',
    actionGuidance: 'Use Google’s expedited doxxing removal flow. Provide links showing where your confidential details are published online.',
    url: 'https://support.google.com/websearch/answer/9673730',
    applicableIncidentTypes: ['account_hacked', 'cyberstalking', 'threats'],
  },
  {
    id: 'npci_dispute_portal',
    title: 'NPCI UPI Dispute & Fraud Redressal Portal',
    category: 'official_portal',
    categoryLabel: 'Financial Redressal',
    badge: 'UPI Payment Recall',
    description: 'National Payments Corporation of India (NPCI) official dispute system to lodge complaints against fraudulent UPI transactions.',
    actionGuidance: 'Submit the UPI Transaction ID, screenshot of the transaction from your UPI app, and your bank account details to dispute unauthorized extortion transfers.',
    url: 'https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism',
    applicableIncidentTypes: ['blackmail', 'account_hacked'],
  },
  {
    id: 'have_i_been_pwned',
    title: 'Have I Been Pwned? (Breach Database)',
    category: 'takedown_tool',
    categoryLabel: 'Credential Security',
    badge: 'Breach Check',
    description: 'Check whether your email addresses, usernames, or passwords have been leaked in public dark-web data breaches.',
    actionGuidance: 'Search your compromised email or username to identify which breached service exposed your credentials, and change passwords on linked services immediately.',
    url: 'https://haveibeenpwned.com',
    applicableIncidentTypes: ['account_hacked'],
  },

  // ==========================================
  // PLATFORM-SPECIFIC RECOVERY & ABUSE REPORTING
  // ==========================================
  {
    id: 'instagram_hacked_recovery',
    title: 'Instagram Official Account Recovery Hub',
    category: 'platform_form',
    categoryLabel: 'Account Recovery',
    badge: 'Instagram Official',
    description: 'Dedicated automated recovery flow if your Instagram account is hacked, email changed, or disabled.',
    actionGuidance: 'Open instagram.com/hacked on your primary Device. Choose "My account was hacked" and request a selfie video verification or backup code.',
    url: 'https://instagram.com/hacked',
    applicableIncidentTypes: ['account_hacked'],
    platforms: ['instagram', 'insta', 'ig', 'meta'],
  },
  {
    id: 'instagram_impersonation',
    title: 'Instagram Impersonation Account Takedown',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'Instagram Form',
    description: 'Official form to report accounts pretending to be you or using your photos to defame or scam others.',
    actionGuidance: 'Provide the impersonating account username, link to the profile, and a photo of your government ID to confirm identity.',
    url: 'https://help.instagram.com/contact/636276399721841',
    applicableIncidentTypes: ['cyberstalking', 'deepfake', 'threats'],
    platforms: ['instagram', 'insta', 'ig', 'meta'],
  },
  {
    id: 'instagram_harassment',
    title: 'Instagram Harassment & Sextortion Report',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'Instagram Form',
    description: 'Direct reporting avenue for blackmail, intimate images, or aggressive bullying on Instagram.',
    actionGuidance: 'Open the direct message thread or post, tap options (three dots), and select "Report" -> "It’s inappropriate" -> "Nudity or sexual activity" or "Harassment".',
    url: 'https://help.instagram.com/547601325292351',
    applicableIncidentTypes: ['blackmail', 'cyberstalking', 'threats'],
    platforms: ['instagram', 'insta', 'ig', 'meta'],
  },
  {
    id: 'whatsapp_report',
    title: 'WhatsApp Safety & Direct Abuse Desk',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'WhatsApp Support',
    description: 'Escalate extortion threats, harassment, or spam calls received via WhatsApp.',
    actionGuidance: 'Tap Contact info -> Report Contact -> Check "Block contact and delete chat" ONLY AFTER saving screenshots into your UNMUTED vault. Email support@whatsapp.com with evidence logs.',
    url: 'https://faq.whatsapp.com/414631957536067',
    applicableIncidentTypes: ['blackmail', 'cyberstalking', 'threats', 'child_safety'],
    platforms: ['whatsapp', 'wa', 'meta'],
  },
  {
    id: 'facebook_hacked',
    title: 'Facebook Compromised Account Remediation',
    category: 'platform_form',
    categoryLabel: 'Account Recovery',
    badge: 'Facebook Official',
    description: 'Guided assistance if someone took over your Facebook profile, changed your password, or posted unauthorized content.',
    actionGuidance: 'Navigate to facebook.com/hacked to secure your account, review unauthorized logins, and restore access.',
    url: 'https://facebook.com/hacked',
    applicableIncidentTypes: ['account_hacked', 'blackmail'],
    platforms: ['facebook', 'fb', 'meta'],
  },
  {
    id: 'google_account_recovery',
    title: 'Google Account Security & Recovery Hub',
    category: 'platform_form',
    categoryLabel: 'Account Recovery',
    badge: 'Google Official',
    description: 'Official recovery wizard for hijacked Gmail, Google Drive, or Android Google Accounts.',
    actionGuidance: 'Follow the recovery prompt from a trusted Device/network previously used to sign in. Answer security questions to reclaim access.',
    url: 'https://accounts.google.com/signin/recovery',
    applicableIncidentTypes: ['account_hacked'],
    platforms: ['google', 'gmail', 'youtube', 'android'],
  },
  {
    id: 'telegram_anti_scam',
    title: 'Telegram Anti-Scam & Abuse Desk',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'Telegram Support',
    description: 'Official channels to flag scammers, impersonators, and revenge material circulating in Telegram groups/channels.',
    actionGuidance: 'Send the channel/group link or user handle to @notoscam on Telegram or email abuse@telegram.org with uncropped screenshots.',
    url: 'https://t.me/notoscam',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'account_hacked'],
    platforms: ['telegram', 'tg'],
  },
  {
    id: 'twitter_x_safety',
    title: 'X (Twitter) Private Media & Harassment Form',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'X Official Form',
    description: 'Direct legal request form to remove non-consensual nudity, doxxing, or violent threats from X.',
    actionGuidance: 'Submit the offending tweet/post URLs, suspect handles, and specify non-consensual distribution for priority review.',
    url: 'https://help.twitter.com/forms/safety-and-sensitive-content',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'threats'],
    platforms: ['x', 'twitter'],
  },
  {
    id: 'snapchat_safety',
    title: 'Snapchat Safety & Extortion Reporting Center',
    category: 'platform_form',
    categoryLabel: 'Platform Report',
    badge: 'Snapchat Support',
    description: 'Official safety portal to report sextortion, blackmail, or cyberbullying on Snapchat.',
    actionGuidance: 'Submit an online report via the Snapchat Safety Center or press and hold the Snap/Profile to report immediately.',
    url: 'https://support.snapchat.com/i-need-help',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'child_safety'],
    platforms: ['snapchat', 'snap'],
  },

  // ==========================================
  // MENTAL HEALTH & PSYCHOLOGICAL SUPPORT
  // ==========================================
  {
    id: 'tele_manas',
    title: 'Tele-MANAS National Mental Health Helpline',
    category: 'mental_health',
    categoryLabel: 'Crisis & Mental Support',
    badge: '24/7 Free & Confidential',
    description: 'Government of India national comprehensive mental health tele-care service providing free, confidential counseling across 20+ languages.',
    actionGuidance: 'Toll-free 14416 or 1800-891-4416. Dial anytime if you feel panic, anxiety, shame, or despair from online blackmail. You are not alone and professional counselors are ready to support you.',
    helplineNumber: '14416',
    url: 'https://telemanas.mohfw.gov.in',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'threats', 'child_safety', 'account_hacked', 'other'],
    isHighPriority: true,
  },
  {
    id: 'kiran_helpline',
    title: 'KIRAN 24/7 Mental Health Rehabilitation Helpline',
    category: 'mental_health',
    categoryLabel: 'Crisis & Mental Support',
    badge: 'Ministry of Social Justice',
    description: '24/7 toll-free helpline providing psychological support, stress management, and mental health first aid.',
    actionGuidance: 'Dial 1800-599-0019 to speak with licensed clinical psychologists in total anonymity.',
    helplineNumber: '18005990019',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'threats', 'cyberstalking', 'child_safety'],
  },

  // ==========================================
  // LEGAL AID & ADVOCACY
  // ==========================================
  {
    id: 'nalsa_legal_aid',
    title: 'NALSA Free Legal Services Helpline',
    category: 'legal_support',
    categoryLabel: 'Free Legal Aid',
    badge: 'Govt Legal Counsel',
    description: 'National Legal Services Authority helpline providing free legal advisory and court representation to eligible victims of crime.',
    actionGuidance: 'Dial 15100 to consult with legal aid advocates regarding filing police FIRs, securing court injunctions, and Section 66E / 67 IT Act remedies.',
    helplineNumber: '15100',
    url: 'https://nalsa.gov.in',
    applicableIncidentTypes: ['blackmail', 'deepfake', 'cyberstalking', 'threats', 'child_safety'],
  },
];

/**
 * Filter and prioritize resources based on incident type, answers, and platform.
 */
export function getSituationResources(
  incidentType: IncidentType,
  urgencyAnswers?: Record<string, 'YES' | 'NO' | 'NOT_SURE'>,
  detectedPlatform?: string
): SituationResource[] {
  const normPlatform = (detectedPlatform || '').toLowerCase().trim();

  return ALL_SITUATION_RESOURCES.filter((res) => {
    // Check incident type applicability
    const matchesIncident = res.applicableIncidentTypes.includes(incidentType);
    if (!matchesIncident) return false;

    // If resource is platform-specific, ensure it matches if platform is known, or show major platforms if relevant
    if (res.platforms && res.platforms.length > 0) {
      if (normPlatform) {
        return res.platforms.some((p) => normPlatform.includes(p) || p.includes(normPlatform));
      }
      // If no platform specified, keep major platform resources for relevant incidents
      return true;
    }

    return true;
  }).sort((a, b) => {
    // Prioritize high priority items
    const aPriority = a.isHighPriority ? 1 : 0;
    const bPriority = b.isHighPriority ? 1 : 0;
    if (bPriority !== aPriority) return bPriority - aPriority;

    // If platform matches specifically, boost it
    if (normPlatform) {
      const aPlatMatch = a.platforms?.some((p) => normPlatform.includes(p)) ? 1 : 0;
      const bPlatMatch = b.platforms?.some((p) => normPlatform.includes(p)) ? 1 : 0;
      if (bPlatMatch !== aPlatMatch) return bPlatMatch - aPlatMatch;
    }

    // Urgency specific prioritization
    if (urgencyAnswers) {
      if (urgencyAnswers['q_paid_already'] === 'YES' || urgencyAnswers['q_demanded_payment'] === 'YES') {
        if (a.id === 'helpline_1930') return -1;
        if (b.id === 'helpline_1930') return 1;
      }
      if (urgencyAnswers['q_under18'] === 'YES' || urgencyAnswers['q_minor_contact'] === 'YES') {
        if (a.id === 'take_it_down' || a.id === 'helpline_1098' || a.id === 'pocso_ebox') return -1;
        if (b.id === 'take_it_down' || b.id === 'helpline_1098' || b.id === 'pocso_ebox') return 1;
      }
      if (urgencyAnswers['q_threat_violence'] === 'YES' || urgencyAnswers['q_physical'] === 'YES') {
        if (a.id === 'helpline_112') return -1;
        if (b.id === 'helpline_112') return 1;
      }
    }

    return 0;
  });
}
