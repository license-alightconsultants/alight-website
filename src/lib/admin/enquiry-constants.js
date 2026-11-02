export const ENQUIRY_STATUSES = [
  ['NEW', 'New'],
  ['CONTACTED', 'Contacted'],
  ['IN_DISCUSSION', 'In Discussion'],
  ['PROPOSAL_SENT', 'Proposal Sent'],
  ['CONVERTED', 'Converted'],
  ['CLOSED', 'Closed'],
];

export const statusLabel = (s) => ENQUIRY_STATUSES.find(([k]) => k === s)?.[1] || s;

// "Pending" = open enquiries that are not yet converted or closed.
export const PENDING_STATUSES = ['NEW', 'CONTACTED', 'IN_DISCUSSION', 'PROPOSAL_SENT'];

export const APPLICATION_STATUSES = ['NEW', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];
