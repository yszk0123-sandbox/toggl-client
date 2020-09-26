import { APIConfig, fetchJSON, postJSON } from './APIUtils';
import { startOfDate, endOfDate } from './DateUtils';
import {
  TogglTimeEntry,
  TogglTimeEntryPost,
  TogglTimeEntryPostRaw,
  serializeTogglTimeEntryPost,
} from '../model/TogglTimeEntry';

export class TogglAPIClient {
  constructor(private config: APIConfig) {}

  async fetchDailyTimeEntries(date: Date): Promise<TogglTimeEntry[]> {
    // curl -v -u 1971800d4d82861d8f2c1651fea4d212:api_token \
    // -X GET "https://api.track.toggl.com/api/v8/time_entries?start_date=2013-03-10T15%3A42%3A46%2B02%3A00&end_date=2013-03-12T15%3A42%3A46%2B02%3A00"
    const startDate = startOfDate(date).toISOString();
    const endDate = endOfDate(date).toISOString();

    return await fetchJSON<TogglTimeEntry[]>(
      '/time_entries',
      { startDate, endDate },
      this.config
    );
  }

  async fetchTimeEntry(timeEntryId: number): Promise<TogglTimeEntry> {
    return await fetchJSON<TogglTimeEntry>(
      `/time_entries/${timeEntryId}`,
      {},
      this.config
    );
  }

  async createTimeEntry(entry: TogglTimeEntryPost): Promise<TogglTimeEntry> {
    return await postJSON<TogglTimeEntryPostRaw, TogglTimeEntry>(
      '/time_entries',
      {},
      serializeTogglTimeEntryPost(entry),
      this.config
    );
  }
}
