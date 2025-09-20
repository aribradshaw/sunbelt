export interface UserConfig {
  username: string;
  password: string;
  portal: string;
  location: string;
  campaignDescription: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  fundraising?: {
    winred?: string;
    anedot?: string;
    stripe?: string;
    custom?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  adminInfo?: {
    email?: string;
    phone?: string;
  };
  additionalInfo?: {
    [key: string]: string;
  };
}

export interface UserConfigs {
  [portal: string]: UserConfig;
}
