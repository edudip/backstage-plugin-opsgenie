export interface Alert {
  id: string; // UUID
  tinyId: string;
  message: string; // "Our servers are in danger"
  status: string; // TODO: enum
  acknowledged: boolean;
  isSeen: boolean;
  snoozed: boolean;
  tags: string[]; // ["Critical", "owner:some-team", "service:business-critical"]
  priority: string; // TODO: enum
  createdAt: string;
  updatedAt: string;
}

export interface ResponderRef {
  id: string; // UUID
  type: string; // "team", "user"
}

export interface Incident {
  id: string; // UUID
  tinyId: string;
  message: string; // "Our servers are in danger"
  status: string; // TODO: enum
  tags: string[]; // ["Critical", "owner:some-team", "service:business-critical"]
  priority: string; // TODO: enum
  createdAt: string;
  updatedAt: string;
  impactStartDate: string;
  impactEndDate: string;
  impactedServices: string[];
  responders: ResponderRef[];
  extraProperties: Record<string, string>;
}

export interface TeamRef {
  id: string; // UUID
  name: string;
}

export interface OnCallParticipantRef {
  id: string; // UUID
  name: string;
  type: string; // user, team, escalation, schedule
}

export interface Schedule {
  id: string; // UUID
  name: string; // ScheduleName
  enabled: boolean;
  ownerTeam: TeamRef;
}

export interface Team {
  id: string; // UUID
  name: string; // TeamName
}

export interface Service {
  id: string; // UUID
  name: string; // ScheduleName
  description: string;
  tags: string[];
  teamId: string;
  isExternal: boolean;
  // needs to be set locally
  _incidents: Incident[];
}

export interface IncidentTimelineEntry {
  id: string; // UUID
  group: string;
  type: string;
  eventTime: string;
  title: {
    content: string;
    type: string;
  };
  description: {
    name: string;
    type: string;
  };
  actor: {
    name: string;
    type: string;
  };
  hidden: boolean;
}
