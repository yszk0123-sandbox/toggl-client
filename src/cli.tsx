import React from 'react';
import { render, Text, useFocus, Box } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import MultiSelect from 'ink-multi-select';
import { TogglAPIClient } from './api/ToggleAPIClient';
import { config } from './config';
import { TogglTimeEntry } from './model/TogglTimeEntry';
import { addDate } from './api/DateUtils';
import { rr } from './usecase/rr';

const client = new TogglAPIClient({
  apiKey: config.api.apiKey,
  endpoint: config.api.endpoint,
});

const ToggleAPIClientContext = React.createContext<TogglAPIClient>(client);

type Item = { label: string; value: string | number };

enum Page {
  Dashboard = 'Dashboard',
  TimeEntry = 'TimeEntry',
}

function parsePage(pageString: string | number): Page {
  switch (pageString) {
    case Page.TimeEntry:
      return Page.TimeEntry;
    default:
      return Page.Dashboard;
  }
}

function getPage(page: Page): JSX.Element {
  switch (page) {
    case Page.TimeEntry:
      return <TimeEntryPage />;
    default:
      return <DashboardPage />;
  }
}

function Main() {
  const [page, setPage] = React.useState(Page.Dashboard);

  return (
    <>
      <PageSelect onChangePage={setPage} />
      {getPage(page)}
    </>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { isFocused } = useFocus();

  return (
    <>
      <Label isFocused={isFocused} text="Search" />
      <TextInput focus={isFocused} value={value} onChange={onChange} />
    </>
  );
}

const pageSelectItems: Item[] = [
  { label: 'Dashboard', value: Page.Dashboard },
  { label: 'TimeEntry', value: Page.TimeEntry },
];

function DashboardPage() {
  return <Text>Nothing</Text>;
}

function TimeEntryPage() {
  const [value, handleChange] = React.useState('');

  return (
    <>
      <TimeEntryBox searchText={value} />
      <SearchBox value={value} onChange={handleChange} />
    </>
  );
}

const timeEntryToItem = (timeEntry: TogglTimeEntry, projects): Item => {
  const tags = timeEntry.tags ? `${timeEntry.tags.join(', ')}: ` : '';
  return {
    label: `${tags}${timeEntry.description ?? ''}`,
    value: timeEntry.id,
  };
};

function TimeEntryBox({ searchText }: { searchText: string }) {
  const { isFocused } = useFocus();
  const { isFocused: isActionFocused } = useFocus();
  const { timeEntries, fetchTimeEntries } = useTimeEntries();
  const [selectedTimeEntries, setSelectedTimeEntries] = React.useState<
    TogglTimeEntry[]
  >([]);
  const items: Item[] = React.useMemo(() => {
    return timeEntries
      .map(timeEntryToItem)
      .filter((entry) => !searchText || entry.label.includes(searchText));
  }, [timeEntries, searchText]);
  const selectedItems: Item[] = React.useMemo(() => {
    return selectedTimeEntries.map(timeEntryToItem);
  }, [selectedTimeEntries]);

  const handleSelect = React.useCallback(
    (item: Item) => {
      const entry = timeEntries.find((entry) => entry.id === item.value);
      if (entry) {
        setSelectedTimeEntries((items) => [...items, entry]);
      }
    },
    [timeEntries]
  );
  const handleUnselect = React.useCallback((item: Item) => {
    setSelectedTimeEntries((entries) =>
      entries.filter((entry) => entry.id !== item.value)
    );
  }, []);
  const handleEnter = React.useCallback(
    async (item: Item) => {
      const action = parseTimeEntryAction(item.value);
      console.log(
        item.label,
        action,
        selectedTimeEntries.map((entry) => entry.id).join(',')
      );

      // const duplicatedTimeEntries = selectedTimeEntries
      //   .filter((entry) => entry.tags?.includes('public'))
      //   .filter(rr('start'))
      //   .filter(rr('duration'))
      //   .map((entry) => ({
      //     description: entry.description ?? '',
      //     duration: entry.duration,
      //     pid: entry.pid,
      //     start: addDate(new Date(entry.start), endDelta - startDelta),
      //     tags: entry.tags ?? [],
      //     wid: entry.wid,
      //   }));

      // console.log('Duplicating');
      // console.log(duplicatedTimeEntries);
      // await Promise.all(
      //   duplicatedTimeEntries.map(async (entry) =>
      //     this.client.createTimeEntry(entry)
      //   )
      // );
    },
    [selectedTimeEntries]
  );

  React.useEffect(() => {
    fetchTimeEntries();
  }, []);

  return (
    <Box flexDirection="row">
      <Label isFocused={isFocused} text="Select" />
      <MultiSelect
        focus={isFocused}
        items={items}
        selected={selectedItems}
        onSelect={handleSelect}
        onUnselect={handleUnselect}
      />
      <Box flexDirection="column">
        <Label isFocused={isActionFocused} text="Action" />
        <SelectInput
          isFocused={isActionFocused}
          items={timeEntryActionItems}
          onSelect={handleEnter}
        />
      </Box>
    </Box>
  );
}

enum TimeEntryAction {
  DUPLICATE = 'DUPLICATE',
}
const timeEntryActionItems: Item[] = [
  { label: 'Duplicate', value: TimeEntryAction.DUPLICATE },
];
function parseTimeEntryAction(action: string | number): TimeEntryAction {
  switch (action) {
    case TimeEntryAction.DUPLICATE:
      return TimeEntryAction.DUPLICATE;
    default:
      throw new Error(`Invalid action ${action}`);
  }
}

function Label({ text, isFocused }: { text: string; isFocused: boolean }) {
  return <Text color={isFocused ? 'red' : undefined}>{text}</Text>;
}

function PageSelect({ onChangePage }: { onChangePage: (page: Page) => void }) {
  const { isFocused } = useFocus({ autoFocus: true });
  const handleSelect = React.useCallback(
    (item: Item) => {
      onChangePage(parsePage(item.value));
    },
    [onChangePage]
  );

  return (
    <>
      <Label isFocused={isFocused} text="Page" />
      <SelectInput
        isFocused={isFocused}
        items={pageSelectItems}
        onHighlight={handleSelect}
      />
    </>
  );
}

render(<App />);

function App() {
  return (
    <ToggleAPIClientContext.Provider value={client}>
      <Main />
    </ToggleAPIClientContext.Provider>
  );
}

function useTimeEntries() {
  const [timeEntries, setTimeEntries] = React.useState<TogglTimeEntry[]>([]);
  const client = React.useContext(ToggleAPIClientContext);

  const fetchTimeEntries = React.useCallback(async () => {
    const timeEntries = await client.fetchDailyTimeEntries(
      addDate(new Date(), -1)
    );
    setTimeEntries(timeEntries);
  }, [client]);

  return { timeEntries, fetchTimeEntries };
}
