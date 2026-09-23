// Tuzak takvimi hatırlatıcıları. Tablo yoksa veya RLS reddederse sessizce no-op.

import { supabase } from './supabase';
import { parseIsoDate } from '../utils/deadlines';

const TYPE_MAP = {
  renewal_notice: 'renewal_notice',
  price_increase: 'price_increase',
  trial_end: 'trial_end',
  termination_window: 'renewal_notice',
  confidentiality: 'obligation',
  return_or_refund: 'obligation',
  obligation: 'obligation',
  RENEWAL: 'renewal_notice',
  TERMINATION_WINDOW: 'renewal_notice',
  PRICE_INCREASE: 'price_increase',
  TRIAL_END: 'trial_end',
  CONFIDENTIALITY: 'obligation',
  RETURN: 'obligation',
  OBLIGATION: 'obligation',
};

function reminderType(entry) {
  return TYPE_MAP[entry?.eventType] || TYPE_MAP[entry?.kind] || 'obligation';
}

function eventDate(entry) {
  const raw = entry?.eventDateOrOffset || entry?.date;
  const parsed = parseIsoDate(raw);
  return parsed ? parsed.toISOString() : null;
}

export async function saveContractReminders({ userId, analysisId, events = [], dates = [] } = {}) {
  if (!userId) return [];

  const source = [...(events || []), ...(dates || [])];
  const rows = source
    .map((item) => {
      const date = eventDate(item);
      const title = String(item.eventTitle || item.label || '').trim();
      if (!date || !title) return null;
      return {
        user_id: userId,
        analysis_id: analysisId || null,
        title: title.slice(0, 255),
        event_date: date,
        reminder_type: reminderType(item),
        status: 'pending',
      };
    })
    .filter(Boolean);

  if (!rows.length) return [];

  try {
    const { data, error } = await supabase.from('contract_reminders').insert(rows).select('id');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.log('Hatırlatıcı kaydı atlandı:', error.message);
    return [];
  }
}
