export type HTMLElementOptionValue = string | number | boolean | Function;
export type HTMLElementOptions = Record<string, HTMLElementOptionValue>;

export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: HTMLElementOptions,
) => {
  const el = document.createElement(tagName);
  return Object.assign(el, {
    ...options,
    setProperty: function (o: HTMLElementOptions) {
      return Object.assign(el, o);
    },
  });
};

export const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;