// WAVE I: lead-time reminders and comeback nudges (pure helpers, no React Native imports).
//
// Before: a deadline produced ONE notification, at 09:00 on the deadline day. For a termination-notice
// window or an auto-renewal that is already too late. Now every future deadline gets reminders 30 days,
// 7 days and 1 day before, plus the day itself, all at 09:00 local time.

export const LEAD_DAYS = [30, 7, 1, 0];
export const LEAD_DAYS_TIGHT = [1, 0];
export const REMINDER_HOUR = 9;
// iOS keeps at most 64 pending local notifications. Above this soft limit only the last two steps are added.
export const MAX_PENDING_SOFT = 40;
export const MAX_PER_ANALYSIS = 24;

export function leadDaysFor(pendingCount) {
  return Number(pendingCount) > MAX_PENDING_SOFT ? LEAD_DAYS_TIGHT : LEAD_DAYS;
}

/** i18n key for the notification text of a lead step, e.g. remLead7. */
export function leadKey(lead) {
  return `remLead${Number(lead) || 0}`;
}

/**
 * items: [{ when: Date (deadline day, 09:00), label, kind }] -> one entry per future lead step,
 * sorted by time. Steps already in the past are skipped, so a deadline in 3 days only gets "1 day" + "today".
 */
export function expandLeadReminders(items, { now = Date.now(), leads = LEAD_DAYS, max = MAX_PER_ANALYSIS } = {}) {
  const out = [];
  const seen = new Set();
  for (const item of items || []) {
    if (!item || !(item.when instanceof Date) || Number.isNaN(item.when.getTime())) continue;
    for (const lead of leads) {
      const when = new Date(item.when.getTime());
      when.setDate(when.getDate() - lead);
      when.setHours(REMINDER_HOUR, 0, 0, 0);
      if (when.getTime() <= now + 60 * 1000) continue;
      const key = `${when.getTime()}:${item.label}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...item, when, lead });
    }
  }
  out.sort((a, b) => a.when.getTime() - b.when.getTime());
  return out.slice(0, max);
}

export const NUDGE_DAYS = [3, 10];
export const NUDGE_HOUR = 18;

/** Two quiet check-ins after the last visit (3 and 10 days, 18:00 local), then silence until the next visit. */
export function nudgeDates(now = Date.now(), days = NUDGE_DAYS, hour = NUDGE_HOUR) {
  return days.map((day) => {
    const when = new Date(now);
    when.setDate(when.getDate() + day);
    when.setHours(hour, 0, 0, 0);
    return { days: day, when };
  });
}
