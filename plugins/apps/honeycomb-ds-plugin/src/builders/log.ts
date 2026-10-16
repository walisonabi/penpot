export type ProgressFn = (step: string) => void;

let progress: ProgressFn = (step) => {
  console.log(`[honeycomb-ds] ${step}`);
};

export function setProgress(fn: ProgressFn) {
  progress = fn;
}

export function log(step: string) {
  progress(step);
  console.log(`[honeycomb-ds] ${step}`);
}
