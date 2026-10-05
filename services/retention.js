// WAVE I: opt-in state for the two quiet check-in reminders. Off until the user says yes, fail-safe.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelComebackNudges, scheduleComebackNudges } from './notifications';

const NUDGES_ON_KEY = '@nexulex/nudgesOn';
const NUDGE_ASKED_KEY = '@nexulex/nudgeAsked';

export async function readNudgesEnabled() {
  try {
    return (await AsyncStorage.getItem(NUDGES_ON_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setNudgesEnabled(enabled) {
  try {
    if (enabled) await AsyncStorage.setItem(NUDGES_ON_KEY, '1');
    else await AsyncStorage.removeItem(NUDGES_ON_KEY);
  } catch {
    // ignore
  }
}

/** The one-time offer after the first successful reminder setup. */
export async function readNudgeAsked() {
  try {
    return (await AsyncStorage.getItem(NUDGE_ASKED_KEY)) === '1';
  } catch {
    return true; // when storage fails, never nag
  }
}

export async function markNudgeAsked() {
  try {
    await AsyncStorage.setItem(NUDGE_ASKED_KEY, '1');
  } catch {
    // ignore
  }
}

/** Re-arms (or clears) the check-ins. Call on launch and whenever the app returns to the foreground. */
export async function syncComebackNudges({ bodies, title } = {}) {
  try {
    if (!(await readNudgesEnabled())) {
      await cancelComebackNudges();
      return { scheduled: 0, off: true };
    }
    return await scheduleComebackNudges({ bodies, title });
  } catch {
    return { scheduled: 0, error: true };
  }
}
