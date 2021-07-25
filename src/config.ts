export const config = {
  debug: false,
};

export function configure(configuration: Partial<typeof config>) {
  Object.assign(config, configuration);
}
