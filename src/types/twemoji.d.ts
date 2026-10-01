/**
 * @twemoji/api 15.x ships type definitions without a package-level default
 * export (the default is still declared under the legacy "twemoji" module
 * name), so augment the module to type the default import we use.
 */
declare module "@twemoji/api" {
  interface TwemojiOptions {
    base?: string;
    ext?: string;
    className?: string;
    size?: string | number;
    folder?: string;
    attributes?: (icon: string, variant: string) => Record<string, string>;
  }

  interface Twemoji {
    parse<T extends string | HTMLElement>(node: T, options?: TwemojiOptions): T;
    replace(text: string, replacement: string): string;
    test(text: string): boolean;
  }

  const twemoji: Twemoji;
  export default twemoji;
}
