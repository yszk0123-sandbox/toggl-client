export const config = {
  api: {
    apiKey: expectNotUndefined(process.env.TOGGL_TRACK_API_KEY),
    endpoint: 'https://api.track.toggl.com/api/v8',
  },
};

function expectNotUndefined<T>(value: T | undefined): T {
  if (value == null) {
    throw new Error('value should not be undefined');
  }
  return value;
}
