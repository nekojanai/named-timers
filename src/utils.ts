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

export const getTimeDiffHumanReadable = (date1: Date, date2: Date) => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor((diff % (1000 * 60 * 60  * 24 * 30)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor(diff / 1000) % 60;

  const yearsString = years ? `${years} Year(s)` : '';
  const monthsString = months ? `${months} Month(s)` : '';
  const daysString = days ? `${days} Day(s)` : '';
  const hoursString = hours ? `${hours} Hour(s)` : '';
  const minutesString = `${minutes} Minute(s)`;
  const secondsString = `${seconds} Second(s)`;

  return `${yearsString} ${monthsString} ${daysString} ${hoursString} ${minutesString} ${secondsString}`;
};