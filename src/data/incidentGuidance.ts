import { IncidentType, RiskLevel, UrgencyQuestion, ChecklistItem } from '../types';

export interface IncidentInfo {
  type: IncidentType;
  title: string;
  shortDesc: string;
  iconName: string;
  urgencyQuestions: UrgencyQuestion[];
  guidanceSteps: {
    heading: string;
    points: string[];
    criticalWarning?: string;
  };
  defaultChecklist: ChecklistItem[];
}

export const INCIDENT_CONFIGS: Record<string, IncidentInfo> = {
  blackmail: {
    type: 'blackmail',
    title: 'Cyber Extortion & Blackmail',
    shortDesc: 'Nude threats, sextortion, ransom or financial extortion demands.',
    iconName: 'ShieldAlert',
    urgencyQuestions: [
      {
        id: 'q_demanded_payment',
        question: 'Has the extortionist demanded money, crypto, or sexual favors?',
        subtext: 'UPI, wire transfer, gift cards, or video call coercion.',
        riskIfYes: 'HIGH',
      },
      {
        id: 'q_paid_already',
        question: 'Has any money or material been sent already?',
        subtext: 'Any payment made to the extortionist.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_deadline',
        question: 'Is there an immediate deadline threatened (e.g. within hours)?',
        subtext: 'Threatening to leak to family, contacts, or social media.',
        riskIfYes: 'CRITICAL',
      },
    ],
    guidanceSteps: {
      heading: 'Cyber Extortion & Blackmail Response Plan',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Keep all chats, handles, and payment requests.",
        'DO NOT PAY OR COMPLY. Paying almost never stops blackmailers; it increases demands.',
        'Take full screenshots of chat logs, profile handles, UPI IDs, bank details, and threat messages.',
        'Lock down your social media privacy settings so perpetrators cannot see your friend lists.',
        'Report the account on the host platform and block after capturing evidence.',
      ],
      criticalWarning: 'Extortion is a serious criminal offense. You are the victim — do not blame yourself.',
    },
    defaultChecklist: [
      { id: 'c_demand_ss', label: 'Payment demand & threat screenshots saved', description: 'Include timestamps and sender details.', category: 'primary' },
      { id: 'c_upi', label: 'UPI / Bank / Payment handles recorded', description: 'Record handles, account numbers, or Device numbers.', category: 'primary' },
      { id: 'c_profile', label: 'Perpetrator profile link & username saved', description: 'Copy permalinks to perpetrator profile.', category: 'primary' },
    ],
  },

  deepfake: {
    type: 'deepfake',
    title: 'Deepfakes & Morphed Media',
    shortDesc: 'AI-generated or edited non-consensual photos/videos.',
    iconName: 'Image',
    urgencyQuestions: [
      {
        id: 'q_public',
        question: 'Is the morphed content published or viewable publicly?',
        subtext: 'Visible on social media, websites, or public groups.',
        riskIfYes: 'HIGH',
      },
      {
        id: 'q_blackmail',
        question: 'Is someone threatening to share or publish more morphed media?',
        subtext: 'Extortion or ransom demands involving fake media.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_under18',
        question: 'Is the person depicted in the morphed image under 18 years old?',
        subtext: 'Involves minors or school students.',
        riskIfYes: 'CRITICAL',
      },
    ],
    guidanceSteps: {
      heading: 'Deepfakes & Morphed Media Action Plan',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Preserve source images and post URLs.",
        'Take complete screenshots showing profile handles, timestamps, and webpage URLs.',
        'Preserve original unedited photos of yourself to prove the media is fake.',
        'Submit takedown requests directly to platform support and specialized hashes (e.g. StopNCII.org).',
        'File a formal report with your local cyber crime helpline (1930 in India).',
      ],
      criticalWarning: 'Do not pay any removal fee to unknown parties offering guaranteed deletion.',
    },
    defaultChecklist: [
      { id: 'c_ss', label: 'Screenshots saved with timestamps and URL bar', description: 'Full view of post and profile.', category: 'primary' },
      { id: 'c_url', label: 'Direct link to post/media copied', description: 'Copy permalink to media.', category: 'primary' },
      { id: 'c_orig', label: 'Original genuine photos preserved', description: 'Keep source image to prove manipulation.', category: 'secondary' },
    ],
  },

  cyberstalking: {
    type: 'cyberstalking',
    title: 'Stalking & Impersonation',
    shortDesc: 'Fake profiles, unwanted tracking, impersonation or persistent harassment.',
    iconName: 'Eye',
    urgencyQuestions: [
      {
        id: 'q_physical',
        question: 'Has the stalker threatened physical violence or offline location tracking?',
        subtext: 'Mentions of home, workplace, or physical presence.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_multiple_acc',
        question: 'Is the harasser creating multiple accounts after being blocked?',
        subtext: 'Persistent creation of new profiles to message you.',
        riskIfYes: 'HIGH',
      },
      {
        id: 'q_impersonation',
        question: 'Has a fake account been created using your name, photo, or details?',
        subtext: 'Impersonating you to message contacts or post content.',
        riskIfYes: 'HIGH',
      },
    ],
    guidanceSteps: {
      heading: 'Stalking & Impersonation Safety Plan',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Document every message before blocking.",
        'Keep a detailed log of dates, times, usernames, and platforms involved.',
        'Report impersonator accounts directly to platform safety teams.',
        'Inform close friends and family so they know not to interact with fake profiles.',
        'Avoid responding or engaging with the harasser directly.',
      ],
      criticalWarning: 'If you feel in immediate physical danger, contact local police emergency services right away.',
    },
    defaultChecklist: [
      { id: 'c_stalk_log', label: 'Log of dates, times, and accounts created', description: 'Chronological record of contact attempts.', category: 'primary' },
      { id: 'c_fake_prof', label: 'Fake profile URL & screenshots preserved', description: 'Copy full URL of fake account.', category: 'primary' },
    ],
  },

  account_hacked: {
    type: 'account_hacked',
    title: 'Account Hacking & Data Exposure',
    shortDesc: 'Unauthorised account access or leaking of private addresses and documents.',
    iconName: 'KeyRound',
    urgencyQuestions: [
      {
        id: 'q_locked_out',
        question: 'Are you currently locked out of your social media or email account?',
        subtext: 'Password or recovery email changed by hacker.',
        riskIfYes: 'HIGH',
      },
      {
        id: 'q_doxxed',
        question: 'Has your home address, Device number, or private ID been published publicly?',
        subtext: 'Leaked documents or private info online.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_financial_acc',
        question: 'Are linked payment methods or bank cards compromised?',
        subtext: 'Cards attached to hacked account.',
        riskIfYes: 'CRITICAL',
      },
    ],
    guidanceSteps: {
      heading: 'Hacking & Data Exposure Recovery Guidance',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Screenshot security alerts and login logs.",
        'Attempt account recovery through official platform account recovery channels.',
        'Change passwords on all connected email accounts and enable 2-Factor Authentication (2FA).',
        'If payment cards are linked, contact your bank immediately to pause card transactions.',
        'Request emergency removal of leaked personal addresses/Device numbers from search engines.',
      ],
      criticalWarning: 'Never pay alleged "ethical hackers" on social media promising to recover accounts for a fee.',
    },
    defaultChecklist: [
      { id: 'c_hack_alert', label: 'Security alert emails & login notifications saved', description: 'Preserve IP logs and alerts.', category: 'primary' },
      { id: 'c_doxx_ss', label: 'Screenshots of leaked post or private info', description: 'Evidence of published private data.', category: 'primary' },
    ],
  },

  threats: {
    type: 'threats',
    title: 'Online Threats & Hate Speech',
    shortDesc: 'Direct threats of physical harm, abusive messaging, or targeted hate.',
    iconName: 'AlertTriangle',
    urgencyQuestions: [
      {
        id: 'q_threat_violence',
        question: 'Does the message contain direct threats of physical violence or acid attack?',
        subtext: 'Specific physical violence threats.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_group_harass',
        question: 'Are multiple accounts coordinating targeted abusive comments or messages?',
        subtext: 'Mass dogpiling or mob harassment.',
        riskIfYes: 'HIGH',
      },
    ],
    guidanceSteps: {
      heading: 'Online Threats Response Plan',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Capture all threat text and profile handles.",
        'Screenshot the comments, inbox messages, and post URLs.',
        'Filter or restrict comment sections on your public accounts.',
        'Report threat messages to law enforcement cyber crime authorities.',
      ],
      criticalWarning: 'Direct threats of violence are illegal. Document and report them immediately.',
    },
    defaultChecklist: [
      { id: 'c_threat_ss', label: 'Threat message screenshots with profile names', description: 'Capture full text and sender ID.', category: 'primary' },
    ],
  },

  child_safety: {
    type: 'child_safety',
    title: 'Child Exploitation & Minor Safety',
    shortDesc: 'Protection for minors involving online exploitation or inappropriate contact.',
    iconName: 'Shield',
    urgencyQuestions: [
      {
        id: 'q_minor_contact',
        question: 'Is an adult attempting inappropriate contact or asking for media from a minor?',
        subtext: 'Online exploitation or inappropriate requests to minors.',
        riskIfYes: 'CRITICAL',
      },
      {
        id: 'q_coercion',
        question: 'Is the minor being threatened or pressured into secret communications?',
        subtext: 'Coercion or secret meeting requests.',
        riskIfYes: 'CRITICAL',
      },
    ],
    guidanceSteps: {
      heading: 'Child Exploitation & Minor Safety Protocol',
      points: [
        "DON'T DELETE ANYTHING FROM YOUR DEVICE YET. Preserve all chat histories and media received.",
        'Do not confront the perpetrator directly.',
        'Report immediately to specialized child protection helplines (1098 / Cybercrime Helpline 1930).',
        'Involve a trusted parent, school authority, or legal guardian.',
      ],
      criticalWarning: 'Child exploitation is a severe criminal offense receiving top priority from law enforcement.',
    },
    defaultChecklist: [
      { id: 'c_child_chat', label: 'Preserve complete chat logs and perpetrator profile', description: 'Full history of communications.', category: 'primary' },
    ],
  },
};

export function calculateRiskLevel(
  answers: Record<string, 'YES' | 'NO' | 'NOT_SURE'>,
  questions: UrgencyQuestion[]
): { riskLevel: RiskLevel; explanation: string } {
  let hasCritical = false;
  let hasHigh = false;
  let yesCount = 0;

  questions.forEach((q) => {
    if (answers[q.id] === 'YES') {
      yesCount++;
      if (q.riskIfYes === 'CRITICAL') hasCritical = true;
      if (q.riskIfYes === 'HIGH') hasHigh = true;
    }
  });

  if (hasCritical) {
    return {
      riskLevel: 'CRITICAL',
      explanation: 'Critical risk detected. Immediate law enforcement & platform escalation recommended.',
    };
  }
  if (hasHigh || yesCount >= 2) {
    return {
      riskLevel: 'HIGH',
      explanation: 'High priority incident. Swift evidence preservation and formal reporting advised.',
    };
  }
  if (yesCount === 1) {
    return {
      riskLevel: 'MEDIUM',
      explanation: 'Moderate risk incident. Secure evidence and follow platform takedown steps.',
    };
  }
  return {
    riskLevel: 'LOW',
    explanation: 'Standard guidance incident. Follow recommended preservation and reporting guidelines.',
  };
}
