import React from 'react';
import { render, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

type Item = { label: string; value: string };

const items: Item[] = [
  { label: 'Entry 1', value: 'entry-1' },
  { label: 'Entry 2', value: 'entry-2' },
];

function App() {
  const [value, handleChange] = React.useState('');

  const handleSelect = React.useCallback((item: Item) => {
    console.log('Item is', item);
  }, []);

  return (
    <>
      <Text>Hello world</Text>
      <SelectInput items={items} onSelect={handleSelect} />
      <TextInput value={value} onChange={handleChange} />
    </>
  );
}

render(<App />);
