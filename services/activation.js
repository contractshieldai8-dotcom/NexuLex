// WAVE H: tiny local flag for the sample-contract chip. Fail-safe: storage errors never block the app.
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAMPLE_DONE_KEY = '@nexulex/sampleDone';

/** True once the user finished a sample or a real analysis (the chip is then hidden for good). */
export async function readSampleDone() {
  try {
    return (await AsyncStorage.getItem(SAMPLE_DONE_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markSampleDone() {
  try {
    await AsyncStorage.setItem(SAMPLE_DONE_KEY, '1');
  } catch {
    // ignore
  }
}
