export interface AnnouncementStat {
  label: string;
  value: string;
}

export interface AnnouncementAction {
  type: 'modal' | 'route' | 'external';
  target: string;
}

export interface AnnouncementDetail {
  description: string;
  stats: AnnouncementStat[];
  ctaLabel: string;
  ctaLink: string;
}

export interface Announcement {
  id: string;
  logo: string;
  headline: string;
  subtitle: string;
  stat: AnnouncementStat;
  accentColor: string;
  cta: {
    label: string;
    action: AnnouncementAction;
  };
  detail: AnnouncementDetail;
}
