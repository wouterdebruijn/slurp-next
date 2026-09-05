import {
  Collections,
  Create,
  PlayersResponse,
  SessionsResponse,
  TypedPocketBase,
} from "@/pocketbase-types";

export class ProcessingError extends Error {}

/**
 * Whether the machine reference count restart handling is enabled.
 *
 * When enabled, an incoming count that is lower than the stored reference is
 * treated as a device restart (the hardware counter reset to 0) and the
 * reference is reset so we never produce a negative delta.
 *
 * When disabled, the device keeps a complete shot count that survives power
 * cycles, so a lower incoming count is authoritative and legitimately brings
 * the player's total back down.
 *
 * Controlled by the MACHINE_REFERENCE_COUNT env variable ("true" to enable).
 * Defaults to disabled to match the current device firmware behaviour.
 */
function useMachineReferenceCount(): boolean {
  return process.env.MACHINE_REFERENCE_COUNT === "true";
}

export async function processPayloadSegment(
  segment: Buffer,
  pb: TypedPocketBase,
  timestamp: Date
) {
  const glasId = segment.readUint16BE(0);
  const takenUnitCount = segment.readUint16BE(2);
  console.log(`Segment — ID: ${glasId}, Value: ${takenUnitCount}`);

  const player = await pb
    .collection(Collections.Players)
    .getFirstListItem<PlayersResponse<{ session: SessionsResponse }>>(
      `hardware_id = "${glasId}" && session.active = true`,
      { expand: "session" }
    )
    .catch((e) => {
      throw new ProcessingError(
        `Failed to fetch player for hardware ID ${glasId}: ${e}`
      );
    });

  const referenceTime = new Date(player.machine_message_time);

  if (referenceTime >= timestamp) {
    throw new ProcessingError(
      `Stale message for player ${
        player.id
      }, message time ${timestamp.toISOString()} is not newer than last recorded time ${referenceTime.toISOString()}.`
    );
  }

  let referenceCount = player.machine_reference_count || 0;

  if (useMachineReferenceCount() && referenceCount > takenUnitCount) {
    // Hardware lost track of count, likely due to a restart, reset reference count
    console.log(
      `Adjusting taken count for player ${player.id} from ${referenceCount} to 0 due to restart.`
    );
    referenceCount = 0;
  }

  const changedByValue = takenUnitCount - referenceCount;

  if (changedByValue === 0) {
    throw new ProcessingError(
      `No change in unit count for player ${player.id}, skipping entry creation.`
    );
  }

  await pb.collection(Collections.Entries).create({
    units: -changedByValue,
    player: player.id,
    giveable: false,
    hide: false,
  } as Create<Collections.Entries>);

  // Update player's machine_reference_count
  await pb.collection(Collections.Players).update(player.id, {
    machine_reference_count: takenUnitCount,
    machine_message_time: timestamp.toISOString(),
  } as Create<Collections.Players>);

  console.log(
    `Processed entry for player ${player.id}: changed by ${changedByValue} units.`
  );
}
