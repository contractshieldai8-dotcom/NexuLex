import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

function initialState() {
  const metrics = Keyboard.isVisible?.() ? Keyboard.metrics?.() : null;
  const height = Math.max(0, Math.round(metrics?.height || 0));
  return { height, visible: height > 0, shownAt: 0 };
}

/**
 * Keyboard height in dp. Android reports the height above the navigation bar;
 * iOS includes the home-indicator area. `shownAt` changes on every show event.
 */
export default function useKeyboardInset() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event) => {
      const height = Math.max(0, Math.round(event?.endCoordinates?.height || 0));
      setState({ height, visible: height > 0, shownAt: Date.now() });
    });
    const hide = Keyboard.addListener(HIDE_EVENT, () => {
      setState((prev) => (prev.visible ? { height: 0, visible: false, shownAt: prev.shownAt } : prev));
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return state;
}
