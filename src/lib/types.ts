// Domain models shared across the app. These mirror the Supabase tables
// defined in supabase/migrations. Keep them in sync when the schema changes.

export type UserRole = "attendee" | "organiser";
export type EventFormat = "in_person" | "virtual" | "hybrid";
export type SessionType = "keynote" | "session" | "workshop" | "panel";

export interface Profile {
  id: string; // == auth.users.id
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  role: UserRole;
  linkedin_url: string | null;
  onboarded: boolean;
  // Organiser-only: the company/organisation they run events for.
  company_name: string | null;
  company_website: string | null;
  company_role: string | null;
  company_size: string | null;
  company_about: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  organiser_id: string | null; // null for platform-seeded events
  title: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  format: EventFormat;
  location: string | null;
  website_url: string | null;
  cover_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
  is_published: boolean;
  highlights: string[] | null;
  created_at: string;
}

// A single agenda item: keynote, talk, workshop or panel.
export interface Session {
  id: string;
  event_id: string;
  day: string | null;
  type: SessionType;
  title: string;
  description: string | null;
  track: string | null;
  speaker: string | null;
  speaker_title: string | null;
  room: string | null;
  starts_at: string | null;
  ends_at: string | null;
  position: number;
  has_prize: boolean;
  created_at: string;
}

export interface Sponsor {
  id: string;
  event_id: string;
  name: string;
  tier: string | null;
  website_url: string | null;
  logo_url: string | null;
  created_at: string;
}

// Answer captured during the post-login AI onboarding flow.
export interface OnboardingAnswer {
  id: string;
  profile_id: string;
  question_key: string;
  answer: string;
  created_at: string;
}
