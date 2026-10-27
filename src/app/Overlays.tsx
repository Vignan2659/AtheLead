import { AccountSheet } from './AccountSheet';
import { NotificationsSheet } from './NotificationsSheet';

/** Sheets the header's bell and avatar open. Every screen with a header renders these. */
export function Overlays() {
  return (
    <>
      <NotificationsSheet />
      <AccountSheet />
    </>
  );
}
