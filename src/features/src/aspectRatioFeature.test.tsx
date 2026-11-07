import AspectRatioFeature from './aspectRatioFeature';

// Command construction is independent of React rendering and the WASM runtime.
jest.mock('react', () => ({}));
jest.mock('fractional', () => ({ Fraction: jest.fn() }));
jest.mock('../../ts/ffmpeg', () => ({ ffmpegRunner: jest.fn() }));
jest.mock('../../ts/hardware', () => ({ getThreads: () => 1 }));
jest.mock('../../store/componentStore', () => ({
  __esModule: true,
  default: {
    FileStore: {
      currentFile: { name: 'video-input-0.mp4', type: 'video' },
      updateCurrentFile: jest.fn(),
    },
    ProgressStore: { updateStatic: jest.fn() },
    VideoStore: {},
    CluiStore: { updateConfiguration: jest.fn() },
  },
}));

describe('AspectRatioFeature dimensions', () => {
  it.each([
    [1920, 1080], // Default values emitted by AspectRatioUi.
    [1080, 1920],
    [640, 480],
    [480, 640],
    [1080, 1080],
  ])('preserves width %i and height %i in the scale command', (width, height) => {
    const feature = new AspectRatioFeature({
      ASPECT_RATIO: {
        value: width / height,
        WIDTH: { value: width },
        HEIGHT: { value: height },
      },
    });

    expect(feature.ffmpegCommands).toBe(`-vf scale=${width}:${height}`);
    expect(feature.ffmpegInputCommand).toBe('-i video-input-0.mp4');
    expect(feature.fileConfig.primaryType).toBe('video');
  });

  it('still rejects a ratio that does not match the configured dimensions', () => {
    expect(() => new AspectRatioFeature({
      ASPECT_RATIO: {
        value: 1,
        WIDTH: { value: 1920 },
        HEIGHT: { value: 1080 },
      },
    })).toThrow('Invalid aspect ratio!');
  });
});
