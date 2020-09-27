/**
 * @example
 * $ deno run --allow-env --allow-net deno/toggl.ts | pbcopy
 */
import { TogglAPIClient } from '../api/TogglAPIClient';
import { addDate } from '../api/DateUtils';
import { rr } from './rr';

export class TogglDuplicateEntriesUsecase {
  constructor(private client: TogglAPIClient) {}

  async run(startDelta: number, endDelta: number): Promise<void> {
    const startDate = addDate(new Date(), startDelta);
    const endDate = addDate(startDate, endDelta - startDelta);
    console.log('DUPLICATE', startDate, 'to', endDate);

    const timeEntries = await this.client.fetchDailyTimeEntries(startDate);
    const duplicatedTimeEntries = timeEntries
      .filter((entry) => entry.tags?.includes('public'))
      .filter(rr('start'))
      .filter(rr('duration'))
      .map((entry) => ({
        description: entry.description ?? '',
        duration: entry.duration,
        pid: entry.pid,
        start: addDate(new Date(entry.start), endDelta - startDelta),
        tags: entry.tags ?? [],
        wid: entry.wid,
      }));

    console.log('Duplicating');
    console.log(duplicatedTimeEntries);
    await Promise.all(
      duplicatedTimeEntries.map(async (entry) =>
        this.client.createTimeEntry(entry)
      )
    );
    console.log('Duplicated');
  }
}


