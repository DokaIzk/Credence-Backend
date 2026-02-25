/**
 * Horizon Bond Creation Listener
 * Listens for bond creation events from Stellar/Horizon and syncs identity/bond state to DB.
 * @module horizonBondEvents
 */

import { Server } from 'stellar-sdk';
import { upsertIdentity, upsertBond } from '../services/identityService';

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon.stellar.org';
const server = new Server(HORIZON_URL);

/**
 * Subscribe to bond creation events from Horizon
 * @param {function} onEvent Callback for each bond creation event
 */
export function subscribeBondCreationEvents(onEvent) {
  // Example: Listen to operations of type 'create_bond' (custom event)
  server.operations()
    .forAsset('BOND') // Replace with actual asset code if needed
    .cursor('now')
    .stream({
      onmessage: async (op) => {
        if (op.type === 'create_bond') {
          const event = parseBondEvent(op);
          await upsertIdentity(event.identity);
          await upsertBond(event.bond);
          if (onEvent) onEvent(event);
        }
      },
      onerror: (err) => {
        // TODO: Add reconnection/backfill logic
        console.error('Horizon stream error:', err);
      }
    });
}

/**
 * Parse bond creation event payload
 * @param {object} op Operation object from Horizon
 * @returns {{identity: object, bond: object}}
 */
function parseBondEvent(op) {
  // Example parsing logic
  return {
    identity: {
      id: op.source_account,
      // ...other fields
    },
    bond: {
      id: op.id,
      amount: op.amount,
      duration: op.duration || null,
      // ...other fields
    }
  };
}
