"use client";

import { Link as LinkIcon } from "lucide-react";
import { CodeBlock as CodeBlockComponent } from "./code-block";
import { stripIndent } from "common-tags";
import { AlertTriangle } from "lucide-react";
import { ComponentProps, PropsWithChildren } from "react";
import { cx } from "class-variance-authority";
import { GenerateSecret } from "./generate-secret";
import { cn } from "@/lib/utils";
import { useSelectedVariant } from "@/app/code-block-variant-store";

const CodeBlock = (props: ComponentProps<typeof CodeBlockComponent>) => (
  <CodeBlockComponent className={cx(props.className, "mb-6")} {...props} />
);

const SectionLink = ({
  href,
  children,
}: PropsWithChildren<{
  href: string;
  children: React.ReactNode;
}>) => (
  <a
    href={href}
    className="inline-flex items-center rounded-md -ml-2 px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors group"
  >
    {children}
    <LinkIcon className="ml-2 size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
  </a>
);

const Section = ({
  id,
  title,
  className,
  children,
}: PropsWithChildren<{
  id: string;
  title: string;
  className?: string;
}>) => (
  <div id={id} className={cx(className, "pt-8 mb-12")}>
    <h2 className="text-3xl font-bold mb-4">
      <SectionLink href={`#${id}`}>{title}</SectionLink>
    </h2>
    <div className="mt-6">{children}</div>
  </div>
);

const Subsection = ({
  id,
  title,
  className,
  children,
}: PropsWithChildren<{
  id: string;
  title: string;
  className?: string;
}>) => (
  <div id={id} className={cx(className, "pt-4 mb-12")}>
    <h3 className="text-xl font-semibold mb-4">
      <SectionLink href={`#${id}`}>{title}</SectionLink>
    </h3>
    {children}
  </div>
);

const P = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <p className={cx(className, "font-light mb-6 leading-relaxed")}>{children}</p>
);

const Ul = ({ children }: PropsWithChildren) => (
  <ul className="list-disc font-light mb-6 leading-relaxed ml-4">{children}</ul>
);

const Li = ({ children }: PropsWithChildren) => (
  <li className="mb-2">{children}</li>
);

const ContentHeading = ({
  className,
  id,
  title,
}: {
  className?: string;
  id: string;
  title: string;
}) => (
  <h4 id={id} className={cx(className, "font-semibold pt-2 mb-4")}>
    <SectionLink href={`#${id}`}>{title}</SectionLink>
  </h4>
);

const Code = ({ children }: { children: React.ReactNode }) => {
  return (
    <code className="px-1 py-0.75 rounded bg-muted font-light font-mono text-sm">
      {children}
    </code>
  );
};

const Callout = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cx(
      className,
      "mb-8 flex gap-3 rounded-md border bg-muted/50 p-4"
    )}
  >
    <div className="select-none text-primary">💡</div>
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
);

export default function Home() {
  const selectedFramework = useSelectedVariant("framework");
  const selectedPackageManager = useSelectedVariant("package-manager");
  console.log("selectedFramework", selectedFramework);
  console.log("selectedPackageManager", selectedPackageManager);
  return (
    <div
      ref={(el) => {
        console.log("test ref", el);
      }}
      className="max-w-3xl mx-auto px-4 sm:px-6 md:mt-12"
    >
      <div className="py-8 sm:py-20 space-y-6 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Convex
          </h1>
          <span className="text-3xl sm:text-4xl font-light text-muted-foreground">
            +
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Better Auth
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Comprehensive, secure authentication with Better Auth for Convex.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2">
          <a
            href="#getting-started"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </a>
          <a
            href="https://github.com/get-convex/better-auth"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      <section id="alpha-status" className="mb-12">
        <div className="p-6 rounded-lg border bg-muted/50 space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-yellow-500">Alpha Status</h2>
          </div>

          <p className="text-muted-foreground">
            The Convex Better Auth component is in early alpha development.
          </p>

          <p className="text-muted-foreground">
            If your use case isn&apos;t supported, a plugin doesn&apos;t work,
            you hit a bug, etc, please open a{" "}
            <a
              href="https://github.com/get-convex/better-auth/issues"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub issue
            </a>{" "}
            or reach out on{" "}
            <a
              href="https://discord.gg/convex"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            .
          </p>
        </div>
      </section>

      <section id="latest-release" className="mb-12">
        <div className="p-6 rounded-lg border bg-muted/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 text-green-500 flex-shrink-0 text-2xl">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-green-500">
              v0.7.0 Released!
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Highlights</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>All plugins supported!</li>
              <li>
                A proper internal database adapter that works dynamically for
                generic plugin support
              </li>
              <li>
                CORS handling improved and no longer on by default - no more
                cors errors for full stack apps 🙌
              </li>
              <li>
                Internal schema now generated with Better Auth for improved
                stability
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              This comes with some breaking changes - check out the{" "}
              <a href="#migrate-0-6-to-0-7" className="text-primary underline">
                migration guide
              </a>{" "}
              to upgrade.
            </p>

            <p className="text-muted-foreground">
              <a
                href="https://discord.com/channels/1019350475847499849/1365754331873415440/1392921192154923169"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the full announcement on Discord
              </a>{" "}
              for detailed notes and future plans.
            </p>
          </div>
        </div>
      </section>

      <Section id="what-is-this" title="What is this?">
        <P>
          This library is a{" "}
          <a href="https://www.convex.dev/components" className="underline">
            Convex Component
          </a>{" "}
          that provides an integration layer for using{" "}
          <a href="https://www.better-auth.com" className="underline">
            Better Auth
          </a>{" "}
          with{" "}
          <a href="https://www.convex.dev" className="underline">
            Convex
          </a>
          .
        </P>
        <P>
          After following the installation and setup steps below, you can use
          Better Auth in the normal way. Some exceptions will apply for certain
          configuration options, apis, and plugins.
        </P>
        <P>
          Check out the{" "}
          <a
            href="https://www.better-auth.com/docs/introduction"
            className="underline"
          >
            Better Auth docs
          </a>{" "}
          for usage information, plugins, and more.
        </P>
      </Section>

      <Section id="examples" title="Examples">
        <P>Check out complete working examples on GitHub.</P>
        <div className="grid sm:grid-cols-2 gap-4 mb-6sm:gap-6">
          <a
            href="https://github.com/get-convex/better-auth/tree/main/examples/react"
            className={cn(
              "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10"
            )}
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="currentColor"
            >
              <title>React</title>
              <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"></path>
            </svg>
            <p className="font-medium mt-2">React</p>
          </a>
          <a
            href="https://github.com/get-convex/better-auth/tree/main/examples/next"
            className={cn(
              "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10"
            )}
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="currentColor"
            >
              <title>Next.js</title>
              <path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5396-.0517.4787 0 .5584.0187.6827.1547.0353.0377 1.3373 1.9987 2.895 4.3608a10760.433 10760.433 0 004.7344 7.1706l1.9002 2.8782.096-.0633c.8518-.5536 1.7525-1.3418 2.4657-2.1627 1.5179-1.7429 2.4963-3.868 2.8247-6.134.0961-.6591.1078-.854.1078-1.7475 0-.8937-.012-1.0884-.1078-1.7476-.6522-4.506-3.8592-8.2919-8.2087-9.6945-.7672-.2487-1.5836-.42-2.4985-.5232-.169-.0176-1.0835-.0366-1.6123-.037zm4.0685 7.217c.3473 0 .4082.0053.4857.047.1127.0562.204.1642.237.2767.0186.061.0234 1.3653.0186 4.3044l-.0067 4.2175-.7436-1.14-.7461-1.14v-3.066c0-1.982.0093-3.0963.0234-3.1502.0375-.1313.1196-.2346.2323-.2955.0961-.0494.1313-.054.4997-.054z" />
            </svg>
            <p className="font-medium mt-2">Next.js</p>
          </a>
          <a
            href="https://github.com/get-convex/better-auth/tree/main/examples/tanstack"
            className={cn(
              "flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10"
            )}
          >
            <svg
              viewBox="0 0 633 633"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
            >
              <title>TanStack Start</title>
              <circle cx="316.5" cy="316.5" r="316.5" fill="#fff" />
              <mask
                id="a"
                style={{ maskType: "luminance" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="633"
                height="633"
              >
                <circle cx="316.5" cy="316.5" r="316.5" fill="#fff" />
              </mask>
              <g mask="url(#a)" stroke="#000">
                <path
                  d="M304 610.5c0 101.183-94.405 185.968-214.5 185.968S-125 711.683-125 610.5c0-101.183 94.405-185.968 214.5-185.968S304 509.317 304 610.5ZM758 610.5c0 101.183-94.405 185.968-214.5 185.968S329 711.683 329 610.5c0-101.183 94.405-185.968 214.5-185.968S758 509.317 758 610.5Z"
                  strokeWidth="25"
                />
                <path
                  d="M304 648.5c0 101.183-94.405 185.968-214.5 185.968S-125 749.683-125 648.5c0-101.183 94.405-185.968 214.5-185.968S304 547.317 304 648.5ZM758 648.5c0 101.183-94.405 185.968-214.5 185.968S329 749.683 329 648.5c0-101.183 94.405-185.968 214.5-185.968S758 547.317 758 648.5Z"
                  strokeWidth="25"
                />
                <path
                  d="M304 684.5c0 101.183-94.405 185.968-214.5 185.968S-125 785.683-125 684.5c0-101.183 94.405-185.968 214.5-185.968S304 583.317 304 684.5ZM758 684.5c0 101.183-94.405 185.968-214.5 185.968S329 785.683 329 684.5c0-101.183 94.405-185.968 214.5-185.968S758 583.317 758 684.5Z"
                  strokeWidth="25"
                />
                <path
                  d="M570 715.5c0 170.018-115.444 304-253.5 304-138.056 0-253.5-133.982-253.5-304s115.444-304 253.5-304c138.056 0 253.5 133.982 253.5 304Z"
                  fill="#fff"
                  strokeWidth="25"
                />
                <circle
                  cx="565.5"
                  cy="89.5"
                  r="102"
                  fill="#fff"
                  strokeWidth="23"
                />
                <path
                  d="M428 90h-30M431.5 56.5 405 51M432 123l-29 8M443 154l-24 13M465 181l-20 19M492.373 204l-13.834 22.847M525.5 220.5 518 245M565.5 229.5l.5 24.5"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="bevel"
                />
              </g>
              <circle
                cx="316.5"
                cy="316.5"
                r="304"
                stroke="#000"
                strokeWidth="25"
              />
              <mask
                id="b"
                style={{ maskType: "luminance" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="633"
                height="633"
              >
                <circle
                  cx="316.5"
                  cy="316.5"
                  r="304"
                  fill="#fff"
                  stroke="#fff"
                  strokeWidth="25"
                />
              </mask>
              <g mask="url(#b)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M193.322 202.998c8.069 37.277 13.997 73.63 17.782 109.059 3.785 35.428 2.803 75.151-2.947 119.169l61.232-16.664c-15.624-59.046-25.16-97.899-28.606-116.559-3.447-18.66-10.832-51.846-22.155-99.557l-25.306 4.552"
                  fill="#000"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M195.969 183.898s-12.6-22.116-36.455-29.892c-23.854-7.777-55.501 11.082-55.501 11.082s23.853 21.386 40.686 24.926c16.834 3.54 51.27-6.116 51.27-6.116Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="13"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M195.937 184.501s-47.501-8.529-83.21 15.715c-35.708 24.245-31.59 99.348-31.59 99.348s45.506-41.755 65.244-61.885c19.738-20.129 49.556-53.178 49.556-53.178ZM195.969 183.898s-1.267-32.853 20.633-48.205c21.9-15.351 45.455-15.339 45.455-15.339s-9.096 32.041-25.161 43.356c-16.065 11.314-40.927 20.188-40.927 20.188Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="13"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M195.937 184.501s47.842-45.056 96.703-29.04c48.862 16.015 54.608 59.082 54.608 59.082s-52.758-8.288-75.809-12.088c-23.052-3.799-75.502-17.954-75.502-17.954Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="13"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M195.937 184.501s53.742-11.356 89.19 21.965c35.447 33.321 42.291 80.335 42.291 80.335s-59.636-14.566-85.496-42.37c-25.859-27.804-45.985-59.93-45.985-59.93ZM195.937 184.501s-50.376 20.716-60.134 65.628c-9.759 44.912 8.699 99.613 8.699 99.613s41.077-60.413 47.387-88c6.31-27.586 4.048-77.241 4.048-77.241Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="13"
                />
                <path
                  d="M197.456 182.301s-22.221 32.415-30.819 59.39c-8.599 26.976-11.149 45.11-11.149 45.11"
                  stroke="#000"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M195.847 185.673s-36.616 2.587-58.055 21.827c-21.44 19.24-31.304 37.82-31.304 37.82M205.543 176.367s44.562-10.094 67.018-5.047c22.457 5.047 35.843 15.858 35.843 15.858M197.514 181.438s30.388 14.812 53.908 31.917c23.52 17.104 35.078 32.04 35.078 32.04"
                  stroke="#000"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  clipRule="evenodd"
                  d="m345.091 362.996 97.665 17.221s8.677 3.191 7.11 12.082c-1.568 8.891-10.979 9.856-10.979 9.856l-105.971-18.686-57.476-59.21s-4.79-7.263.762-12.81c5.552-5.547 13.675-2.121 13.675-2.121l55.214 53.668Z"
                  stroke="#000"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="bevel"
                />
                <path
                  d="m437.018 403.22-5.036 28.56M291.97 341.479l-10.94 62.042M333.939 384.126l-4.335 27.079M429.253 384.461l.862-6.495M396.253 379.461l.862-6.495M363.247 373.522l.878-6.109M325.238 351.286l4.166-3.901M304.238 331.286l4.166-3.901"
                  stroke="#000"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="bevel"
                />
              </g>
            </svg>
            <p className="font-medium mt-2">TanStack Start</p>
          </a>
        </div>
      </Section>

      <Section id="getting-started" title="Getting Started">
        <Subsection id="prerequisites" title="Prerequisites">
          <P>
            You&apos;ll first need a project on Convex where{" "}
            <Code>npx convex dev</Code> has been run on your local machine. If
            you don&apos;t have one, run <Code>npm create convex@latest</Code>{" "}
            to get started, and{" "}
            <a
              href="https://docs.convex.dev/getting-started/installation"
              className="underline"
            >
              check out the docs
            </a>{" "}
            to learn more.
          </P>
          <Callout>
            It&apos;s helpful to have the Convex dev server (
            <Code>npx convex dev</Code>) running in the background while setting
            up, otherwise you&apos;ll see type errors that won&apos;t resolve
            until you run it.
          </Callout>
        </Subsection>

        <Subsection id="installation" title="Installation">
          <ContentHeading
            id="install-component"
            title="Install the component"
          />
          <P>
            To get started, install the component, a pinned version of Better
            Auth, and the latest version of Convex.
          </P>

          <Callout>
            This component requires Convex <Code>1.25.0</Code> or later.
          </Callout>

          <CodeBlock
            variantGroup="package-manager"
            variants={[
              {
                id: "npm",
                label: "npm",
                code: stripIndent`
                    npm install @convex-dev/better-auth
                    npm install better-auth@1.2.12 --save-exact
                    npm install convex@latest
                  `,
                language: "shell",
              },
              {
                id: "pnpm",
                label: "pnpm",
                code: stripIndent`
                    pnpm add @convex-dev/better-auth
                    pnpm add better-auth@1.2.12 --save-exact
                    pnpm add convex@latest
                  `,
                language: "shell",
              },
              {
                id: "yarn",
                code: stripIndent`
                    yarn add @convex-dev/better-auth
                    yarn add better-auth@1.2.12 --exact
                    yarn add convex@latest
                  `,
                language: "shell",
              },
              {
                id: "bun",
                code: stripIndent`
                    bun add @convex-dev/better-auth
                    bun add better-auth@1.2.12 --exact
                    bun add convex@latest
                  `,
                language: "shell",
              },
            ]}
          />

          <P>Add the component to your application.</P>

          <CodeBlock
            language="typescript"
            filename="convex/convex.config.ts"
            highlightedLines={[2, 5]}
            code={stripIndent`
                import { defineApp } from 'convex/server'
                import betterAuth from '@convex-dev/better-auth/convex.config'

                const app = defineApp()
                app.use(betterAuth)

                export default app
              `}
          />

          <P>
            Add a <Code>convex/auth.config.ts</Code> file to configure Better
            Auth as an authentication provider:
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.config.ts"
            code={stripIndent`
                export default {
                  providers: [
                    {
                      // Your Convex site URL is provided in a system
                      // environment variable
                      domain: process.env.CONVEX_SITE_URL,

                      // Application ID has to be "convex"
                      applicationID: "convex",
                    },
                  ],
                }
              `}
          />

          <ContentHeading
            id="set-environment-variables"
            title="Set environment variables"
          />

          <P>
            Generate a secret for encryption and generating hashes. Use the
            command below if you have openssl installed, or use the button to
            generate a random value instead. Or generate your own however you
            like.
          </P>

          <GenerateSecret />

          <P>
            Add the Convex site URL environment variable to the{" "}
            <Code>.env.local</Code> file created by <Code>npx convex dev</Code>.
            It will be picked up by your framework dev server.
          </P>

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "shell",
                filename: ".env.local",
                highlightedLines: [6, 7],
                code: stripIndent`
                  # Deployment used by \`npx convex dev\`
                  CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

                  VITE_CONVEX_URL=https://adjective-animal-123.convex.cloud
                  
                  # Same as VITE_CONVEX_URL but ends in .site
                  VITE_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "shell",
                filename: ".env.local",
                highlightedLines: [6, 7],
                code: stripIndent`
                  # Deployment used by \`npx convex dev\`
                  CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

                  NEXT_PUBLIC_CONVEX_URL=https://adjective-animal-123.convex.cloud
                  
                  # Same as NEXT_PUBLIC_CONVEX_URL but ends in .site
                  NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "shell",
                filename: ".env.local",
                highlightedLines: [6, 7],
                code: stripIndent`
                  # Deployment used by \`npx convex dev\`
                  CONVEX_DEPLOYMENT=dev:adjective-animal-123 # team: team-name, project: project-name

                  VITE_CONVEX_URL=https://adjective-animal-123.convex.cloud
                  
                  # Same as VITE_CONVEX_URL but ends in .site
                  VITE_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
                `,
              },
            ]}
          />

          <ContentHeading
            id="better-auth-instance"
            title="Initialize Better Auth"
          />

          <Callout>
            The Better Auth component uses the Convex database adapter, which
            handles all things schema and migration related automatically.
          </Callout>

          <P>
            First, add a users table to your schema. Name it whatever you like.
            Better Auth has its own user table that tracks basic user data, so
            your application user table only needs fields specific to your app
            (or none at all).
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/schema.ts"
            highlightedLines={[4, 5, 6]}
            code={stripIndent`
                import { defineSchema, defineTable } from "convex/server";

                export default defineSchema({
                  users: defineTable({
                    // Fields are optional
                  }),
                });
              `}
          />

          <P>Create your Better Auth instance.</P>
          <P>
            <strong>Note:</strong> Some Typescript errors will show until you
            save the file.
          </P>
          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "src/lib/auth.ts",
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../../convex/auth";
                  import { type GenericCtx } from "../../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:5173";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      trustedOrigins: [siteUrl],
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),

                        // The cross domain plugin is required for client side frameworks
                        crossDomain({
                          siteUrl,
                        }),
                      ],
                    });
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "lib/auth.ts",
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../convex/auth";
                  import { type GenericCtx } from "../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:3000";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your next.js server
                      baseURL: siteUrl,
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "src/lib/auth.ts",
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../../convex/auth";
                  import { type GenericCtx } from "../../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:3000";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your TanStack Start server
                      baseURL: siteUrl,
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });
                `,
              },
            ]}
          />

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "convex/auth.ts",
                code: stripIndent`
                  import {
                    BetterAuth,
                    type AuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // Typesafe way to pass Convex functions defined in this file
                  const authFunctions: AuthFunctions = internal.auth;

                  // Initialize the component
                  export const betterAuthComponent = new BetterAuth(
                    components.betterAuth,
                    {
                      authFunctions,
                    }
                  );

                  // These are required named exports
                  export const {
                    createUser,
                    updateUser,
                    deleteUser,
                    createSession,
                  } =
                    betterAuthComponent.createAuthFunctions<DataModel>({
                      // Must create a user and return the user id
                      onCreateUser: async (ctx, user) => {
                        return ctx.db.insert("users", {});
                      },

                      // Delete the user when they are deleted from Better Auth
                      onDeleteUser: async (ctx, userId) => {
                        await ctx.db.delete(userId as Id<"users">);
                      },
                    });

                  // Example function for getting the current user
                  // Feel free to edit, omit, etc.
                  export const getCurrentUser = query({
                    args: {},
                    handler: async (ctx) => {
                      // Get user data from Better Auth - email, name, image, etc.
                      const userMetadata = await betterAuthComponent.getAuthUser(ctx);
                      if (!userMetadata) {
                        return null;
                      }
                      // Get user data from your application's database
                      // (skip this if you have no fields in your users table schema)
                      const user = await ctx.db.get(userMetadata.userId as Id<"users">);
                      return {
                        ...user,
                        ...userMetadata,
                      };
                    },
                  });
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "convex/auth.ts",
                code: stripIndent`
                  import {
                    BetterAuth,
                    type AuthFunctions,
                    type PublicAuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // Typesafe way to pass Convex functions defined in this file
                  const authFunctions: AuthFunctions = internal.auth;
                  const publicAuthFunctions: PublicAuthFunctions = api.auth;

                  // Initialize the component
                  export const betterAuthComponent = new BetterAuth(
                    components.betterAuth,
                    {
                      authFunctions,
                      publicAuthFunctions,
                    }
                  );

                  // These are required named exports
                  export const {
                    createUser,
                    updateUser,
                    deleteUser,
                    createSession,
                    isAuthenticated,
                  } =
                    betterAuthComponent.createAuthFunctions<DataModel>({
                      // Must create a user and return the user id
                      onCreateUser: async (ctx, user) => {
                        return ctx.db.insert("users", {});
                      },

                      // Delete the user when they are deleted from Better Auth
                      onDeleteUser: async (ctx, userId) => {
                        await ctx.db.delete(userId as Id<"users">);
                      },
                    });

                  // Example function for getting the current user
                  // Feel free to edit, omit, etc.
                  export const getCurrentUser = query({
                    args: {},
                    handler: async (ctx) => {
                      // Get user data from Better Auth - email, name, image, etc.
                      const userMetadata = await betterAuthComponent.getAuthUser(ctx);
                      if (!userMetadata) {
                        return null;
                      }
                      // Get user data from your application's database
                      // (skip this if you have no fields in your users table schema)
                      const user = await ctx.db.get(userMetadata.userId as Id<"users">);
                      return {
                        ...user,
                        ...userMetadata,
                      };
                    },
                  });
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "convex/auth.ts",
                code: stripIndent`
                  import {
                    BetterAuth,
                    type AuthFunctions,
                    type PublicAuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // Typesafe way to pass Convex functions defined in this file
                  const authFunctions: AuthFunctions = internal.auth;
                  const publicAuthFunctions: PublicAuthFunctions = api.auth;

                  // Initialize the component
                  export const betterAuthComponent = new BetterAuth(
                    components.betterAuth,
                    {
                      authFunctions,
                      publicAuthFunctions,
                    }
                  );

                  // These are required named exports
                  export const {
                    createUser,
                    updateUser,
                    deleteUser,
                    createSession,
                    isAuthenticated,
                  } =
                    betterAuthComponent.createAuthFunctions<DataModel>({
                      // Must create a user and return the user id
                      onCreateUser: async (ctx, user) => {
                        return ctx.db.insert("users", {});
                      },

                      // Delete the user when they are deleted from Better Auth
                      onDeleteUser: async (ctx, userId) => {
                        await ctx.db.delete(userId as Id<"users">);
                      },
                    });

                  // Example function for getting the current user
                  // Feel free to edit, omit, etc.
                  export const getCurrentUser = query({
                    args: {},
                    handler: async (ctx) => {
                      // Get user data from Better Auth - email, name, image, etc.
                      const userMetadata = await betterAuthComponent.getAuthUser(ctx);
                      if (!userMetadata) {
                        return null;
                      }
                      // Get user data from your application's database
                      // (skip this if you have no fields in your users table schema)
                      const user = await ctx.db.get(userMetadata.userId as Id<"users">);
                      return {
                        ...user,
                        ...userMetadata,
                      };
                    },
                  });
                `,
              },
            ]}
          />

          <ContentHeading
            id="create-better-auth-client"
            title="Create a Better Auth client instance"
          />

          <P>
            Create a Better Auth client instance for interacting with the Better
            Auth server from your client.
          </P>

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "src/lib/auth-client.ts",
                code: stripIndent`
                  import { createAuthClient } from "better-auth/react";
                  import {
                    convexClient,
                    crossDomainClient,
                  } from "@convex-dev/better-auth/client/plugins";

                  export const authClient = createAuthClient({
                    baseURL: import.meta.env.VITE_CONVEX_SITE_URL,
                    plugins: [
                      convexClient(),
                      crossDomainClient(),
                    ],
                  });
              `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "lib/auth-client.ts",
                code: stripIndent`
                  import { createAuthClient } from "better-auth/react";
                  import { convexClient } from "@convex-dev/better-auth/client/plugins";

                  export const authClient = createAuthClient({
                    plugins: [
                      convexClient(),
                    ],
                  });
              `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "src/lib/auth-client.ts",
                code: stripIndent`
                  import { createAuthClient } from "better-auth/react";
                  import { convexClient } from "@convex-dev/better-auth/client/plugins";

                  export const authClient = createAuthClient({
                    plugins: [
                      convexClient(),
                    ],
                  });
              `,
              },
            ]}
          />

          {selectedFramework === "tanstack" && (
            <>
              <P>
                You&apos;ll also want to export some framework helpers here.
              </P>

              <CodeBlock
                variantGroup="framework"
                variants={[
                  {
                    id: "react",
                    label: "React",
                    language: "typescript",
                    filename: "src/lib/utils.ts",
                    code: stripIndent`
                      import { createAuth } from './auth'
                      import { reactStartHelpers } from '@convex-dev/better-auth/react-start'

                      export const { fetchSession, reactStartHandler, getCookieName } =
                        reactStartHelpers(createAuth, {
                          convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
                        })

                    `,
                  },
                ]}
              />
            </>
          )}

          <ContentHeading id="mount-handlers" title="Mount handlers" />

          <P>Register Better Auth route handlers on your Convex deployment.</P>

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { httpRouter } from 'convex/server'
                  import { betterAuthComponent } from './auth'
                  import { createAuth } from '../src/lib/auth'

                  const http = httpRouter()

                  // { cors: true } is required for client side frameworks
                  betterAuthComponent.registerRoutes(http, createAuth, { cors: true })

                  export default http
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { httpRouter } from 'convex/server'
                  import { betterAuthComponent } from './auth'
                  import { createAuth } from '../lib/auth'

                  const http = httpRouter()

                  betterAuthComponent.registerRoutes(http, createAuth)

                  export default http
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { httpRouter } from 'convex/server'
                  import { betterAuthComponent } from './auth'
                  import { createAuth } from '../src/lib/auth'

                  const http = httpRouter()

                  betterAuthComponent.registerRoutes(http, createAuth)

                  export default http
                `,
              },
            ]}
          />

          {selectedFramework !== "react" && (
            <>
              <P>
                Set up route handlers to proxy auth requests from your framework
                server to your Convex deployment.
              </P>

              <CodeBlock
                variantGroup="framework"
                variants={[
                  {
                    id: "react",
                    label: "React",
                    language: "shell",
                    code: stripIndent`
                      // The cross domain plugin is used to redirect auth requests
                      // for client apps. This is also an option for any framework if
                      // server side auth is not needed.
                    `,
                  },
                  {
                    id: "nextjs",
                    label: "Next.js",
                    language: "typescript",
                    filename: "app/api/auth/[...all]/route.ts",
                    code: stripIndent`
                      import { nextJsHandler } from "@convex-dev/better-auth/nextjs";

                      export const { GET, POST } = nextJsHandler();
                    `,
                  },
                  {
                    id: "tanstack",
                    label: "TanStack Start",
                    language: "typescript",
                    filename: "src/routes/api/auth/$.ts",
                    code: stripIndent`
                      import { reactStartHandler } from '@/lib/auth-client'

                      export const ServerRoute = createServerFileRoute().methods({
                        GET: ({ request }) => {
                          return reactStartHandler(request)
                        },
                        POST: ({ request }) => {
                          return reactStartHandler(request)
                        },
                      })
                    `,
                  },
                ]}
              />
            </>
          )}

          <ContentHeading
            id="setup-convex-client"
            title="Set up Convex client provider"
          />

          {selectedFramework === "tanstack" && (
            <>
              <P>
                Wrap your application root with{" "}
                <Code>ConvexBetterAuthProvider</Code> and make auth available in
                loaders.
              </P>
              <CodeBlock
                variantGroup="framework"
                variants={[
                  {
                    id: "react",
                    label: "React",
                    language: "typescript",
                    filename: "",
                    code: "",
                  },
                  {
                    id: "nextjs",
                    label: "Next.js",
                    language: "typescript",
                    filename: "",
                    code: "",
                  },
                  {
                    id: "tanstack",
                    label: "TanStack Start",
                    language: "typescript",
                    filename: "src/routes/__root.tsx",
                    highlightedLines: [
                      4,
                      9,
                      [14, 22],
                      [24, 34],
                      [38, 39],
                      [56, 69],
                      [74, 78],
                      83,
                    ],
                    code: stripIndent`
                      import {
                        Outlet,
                        createRootRouteWithContext,
                        useRouteContext,
                      } from '@tanstack/react-router'
                      import {
                        Meta,
                        Scripts,
                        createServerFn,
                      } from '@tanstack/react-start'
                      import { QueryClient } from '@tanstack/react-query'
                      import * as React from 'react'
                      import appCss from '@/styles/app.css?url'
                      import { ConvexQueryClient } from '@convex-dev/react-query'
                      import { ConvexReactClient } from 'convex/react'
                      import { getCookie, getWebRequest } from '@tanstack/react-start/server'
                      import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
                      import { createAuth } from '../lib/auth'
                      import {
                        authClient,
                        fetchSession,
                        getCookieName,
                      } from '@/lib/utils'

                      // Server side session request
                      const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
                        const sessionCookieName = await getCookieName()
                        const token = getCookie(sessionCookieName)
                        const request = getWebRequest()
                        const { session } = await fetchSession(createAuth, request)
                        return {
                          userId: session?.user.id,
                          token,
                        }
                      })

                      export const Route = createRootRouteWithContext<{
                        queryClient: QueryClient
                        convexClient: ConvexReactClient
                        convexQueryClient: ConvexQueryClient
                      }>()({
                        head: () => ({
                          meta: [
                            {
                              charSet: 'utf-8',
                            },
                            {
                              name: 'viewport',
                              content: 'width=device-width, initial-scale=1',
                            },
                          ],
                          links: [
                            { rel: 'stylesheet', href: appCss },
                            { rel: 'icon', href: '/favicon.ico' },
                          ],
                        }),
                        beforeLoad: async (ctx) => {
                          // all queries, mutations and action made with TanStack Query will be
                          // authenticated by an identity token.
                          const auth = await fetchAuth()
                          const { userId, token } = auth

                          // During SSR only (the only time serverHttpClient exists),
                          // set the auth token for Convex to make HTTP queries with.
                          if (token) {
                            ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
                          }

                          return { userId, token }
                        },
                        component: RootComponent,
                      })

                      function RootComponent() {
                        const context = useRouteContext({ from: Route.id })
                        return (
                          <ConvexBetterAuthProvider
                            client={context.convexClient}
                            authClient={authClient}
                          >
                            <RootDocument>
                              <Outlet />
                            </RootDocument>
                          </ConvexBetterAuthProvider>
                        )
                      }

                      function RootDocument({ children }: { children: React.ReactNode }) {
                        return (
                          <html lang="en" className="dark">
                            <head>
                              <Meta />
                            </head>
                            <body className="bg-neutral-950 text-neutral-50">
                              {children}
                              <Scripts />
                            </body>
                          </html>
                        )
                      }
                  `,
                  },
                ]}
              />
            </>
          )}

          {["react", "nextjs"].includes(selectedFramework) && (
            <P>
              Wrap your app with the <Code>ConvexBetterAuthProvider</Code>{" "}
              component.
            </P>
          )}

          {selectedFramework === "tanstack" && (
            <P>Provide context from Convex to your routes.</P>
          )}

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "src/main.tsx",
                highlightedLines: [6, 7, 13, 15],
                code: stripIndent`
                  import React from "react";
                  import ReactDOM from "react-dom/client";
                  import App from "./App";
                  import "./index.css";
                  import { ConvexReactClient } from "convex/react";
                  import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
                  import { authClient } from "@/lib/auth-client";

                  const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

                  ReactDOM.createRoot(document.getElementById("root")!).render(
                    <React.StrictMode>
                      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                        <App />
                      </ConvexBetterAuthProvider>
                    </React.StrictMode>
                  );

              `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "app/ConvexClientProvider.tsx",
                highlightedLines: [5, 6, 12, 14],
                code: stripIndent`
                  "use client";

                  import { ReactNode } from "react";
                  import { ConvexReactClient } from "convex/react";
                  import { authClient } from "@/lib/auth-client";
                  import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

                  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                  export function ConvexClientProvider({ children }: { children: ReactNode }) {
                    return (
                      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
                        {children}
                      </ConvexBetterAuthProvider>
                    );
                  }
              `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "src/router.tsx",
                highlightedLines: [[13, 16], 33],
                code: stripIndent`
                  import { createRouter as createTanStackRouter } from '@tanstack/react-router'
                  import { routeTree } from './routeTree.gen'
                  import { routerWithQueryClient } from '@tanstack/react-router-with-query'
                  import { ConvexProvider, ConvexReactClient } from 'convex/react'
                  import { ConvexQueryClient } from '@convex-dev/react-query'
                  import { QueryClient } from '@tanstack/react-query'

                  export function createRouter() {
                    const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!
                    if (!CONVEX_URL) {
                      throw new Error('missing VITE_CONVEX_URL envar')
                    }
                    const convex = new ConvexReactClient(CONVEX_URL, {
                      unsavedChangesWarning: false,
                    })
                    const convexQueryClient = new ConvexQueryClient(convex)

                    const queryClient: QueryClient = new QueryClient({
                      defaultOptions: {
                        queries: {
                          queryKeyHashFn: convexQueryClient.hashFn(),
                          queryFn: convexQueryClient.queryFn(),
                        },
                      },
                    })
                    convexQueryClient.connect(queryClient)

                    const router = routerWithQueryClient(
                      createTanStackRouter({
                        routeTree,
                        defaultPreload: 'intent',
                        scrollRestoration: true,
                        context: { queryClient, convexClient: convex, convexQueryClient },
                        Wrap: ({ children }) => (
                          <ConvexProvider client={convexQueryClient.convexClient}>
                            {children}
                          </ConvexProvider>
                        ),
                      }),
                      queryClient,
                    )

                    return router
                  }

                  declare module '@tanstack/react-router' {
                    interface Register {
                      router: ReturnType<typeof createRouter>
                    }
                  }

                `,
              },
            ]}
          />
        </Subsection>
      </Section>

      <Section id="basic-usage" title="Basic Usage">
        <P>
          Follow the{" "}
          <a
            href="https://www.better-auth.com/docs/basic-usage"
            className="underline"
          >
            Better Auth documentation
          </a>{" "}
          for basic usage. The Convex component provides a compatibility layer
          so things generally work as expected.
        </P>

        <P>
          Some things that do work differently with this component are
          documented here.
        </P>

        <Subsection id="basic-usage-signing-in" title="Signing in">
          <P>
            Below is an extremely basic example of a working auth flow with
            email (unverified) and password.
          </P>
          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "src/App.tsx",
                code: stripIndent`
                  import { useState } from "react";
                  import {
                    Authenticated,
                    Unauthenticated,
                    AuthLoading,
                    useQuery,
                  } from "convex/react";
                  import { authClient } from "@/lib/auth-client";
                  import { api } from "../convex/_generated/api";

                  export default function App() {
                    return (
                      <>
                        <AuthLoading>
                          <div>Loading...</div>
                        </AuthLoading>
                        <Unauthenticated>
                          <SignIn />
                        </Unauthenticated>
                        <Authenticated>
                          <Dashboard />
                        </Authenticated>
                      </>
                    );
                  }

                  function Dashboard() {
                    const user = useQuery(api.auth.getCurrentUser);
                    return (
                      <div>
                        <div>Hello {user?.name}!</div>
                        <button onClick={() => authClient.signOut()}>Sign out</button>
                      </div>
                    );
                  }

                  function SignIn() {
                    const [showSignIn, setShowSignIn] = useState(true);

                    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      if (showSignIn) {
                        await authClient.signIn.email(
                          {
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      } else {
                        await authClient.signUp.email(
                          {
                            name: formData.get("name") as string,
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      }
                    };

                    return (
                      <>
                        <form onSubmit={handleSubmit}>
                          {!showSignIn && <input name="name" placeholder="Name" />}
                          <input type="email" name="email" placeholder="Email" />
                          <input type="password" name="password" placeholder="Password" />
                          <button type="submit">{showSignIn ? "Sign in" : "Sign up"}</button>
                        </form>
                        <p>
                          {showSignIn ? "Don't have an account? " : "Already have an account? "}
                          <button onClick={() => setShowSignIn(!showSignIn)}>
                            {showSignIn ? "Sign up" : "Sign in"}
                          </button>
                        </p>
                      </>
                    );
                  }
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "app/page.tsx",
                code: stripIndent`
                  "use client";

                  import { useState } from "react";
                  import {
                    Authenticated,
                    Unauthenticated,
                    AuthLoading,
                    useQuery,
                  } from "convex/react";
                  import { authClient } from "@/lib/auth-client";
                  import { api } from "../convex/_generated/api";

                  export default function App() {
                    return (
                      <>
                        <AuthLoading>
                          <div>Loading...</div>
                        </AuthLoading>
                        <Unauthenticated>
                          <SignIn />
                        </Unauthenticated>
                        <Authenticated>
                          <Dashboard />
                        </Authenticated>
                      </>
                    );
                  }

                  function Dashboard() {
                    const user = useQuery(api.auth.getCurrentUser);
                    return (
                      <div>
                        <div>Hello {user?.name}!</div>
                        <button onClick={() => authClient.signOut()}>Sign out</button>
                      </div>
                    );
                  }

                  function SignIn() {
                    const [showSignIn, setShowSignIn] = useState(true);

                    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      if (showSignIn) {
                        await authClient.signIn.email(
                          {
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      } else {
                        await authClient.signUp.email(
                          {
                            name: formData.get("name") as string,
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      }
                    };

                    return (
                      <>
                        <form onSubmit={handleSubmit}>
                          {!showSignIn && <input name="name" placeholder="Name" />}
                          <input type="email" name="email" placeholder="Email" />
                          <input type="password" name="password" placeholder="Password" />
                          <button type="submit">{showSignIn ? "Sign in" : "Sign up"}</button>
                        </form>
                        <p>
                          {showSignIn ? "Don't have an account? " : "Already have an account? "}
                          <button onClick={() => setShowSignIn(!showSignIn)}>
                            {showSignIn ? "Sign up" : "Sign in"}
                          </button>
                        </p>
                      </>
                    );
                  }
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Router",
                language: "typescript",
                filename: "src/routes/index.tsx",
                code: stripIndent`
                  import { useState } from "react";
                  import {
                    Authenticated,
                    Unauthenticated,
                    AuthLoading,
                    useQuery,
                  } from "convex/react";
                  import { authClient } from "@/lib/auth-client";
                  import { api } from "convex/_generated/api";

                  export default function App() {
                    return (
                      <>
                        <AuthLoading>
                          <div>Loading...</div>
                        </AuthLoading>
                        <Unauthenticated>
                          <SignIn />
                        </Unauthenticated>
                        <Authenticated>
                          <Dashboard />
                        </Authenticated>
                      </>
                    );
                  }

                  function Dashboard() {
                    const user = useQuery(api.auth.getCurrentUser);
                    return (
                      <div>
                        <div>Hello {user?.name}!</div>
                        <button onClick={() => authClient.signOut()}>Sign out</button>
                      </div>
                    );
                  }

                  function SignIn() {
                    const [showSignIn, setShowSignIn] = useState(true);

                    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      if (showSignIn) {
                        await authClient.signIn.email(
                          {
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      } else {
                        await authClient.signUp.email(
                          {
                            name: formData.get("name") as string,
                            email: formData.get("email") as string,
                            password: formData.get("password") as string,
                          },
                          {
                            onError: (ctx) => {
                              window.alert(ctx.error.message);
                            },
                          }
                        );
                      }
                    };

                    return (
                      <>
                        <form onSubmit={handleSubmit}>
                          {!showSignIn && <input name="name" placeholder="Name" />}
                          <input type="email" name="email" placeholder="Email" />
                          <input type="password" name="password" placeholder="Password" />
                          <button type="submit">{showSignIn ? "Sign in" : "Sign up"}</button>
                        </form>
                        <p>
                          {showSignIn ? "Don't have an account? " : "Already have an account? "}
                          <button onClick={() => setShowSignIn(!showSignIn)}>
                            {showSignIn ? "Sign up" : "Sign in"}
                          </button>
                        </p>
                      </>
                    );
                  }
                `,
              },
            ]}
          />
        </Subsection>

        <Subsection id="basic-usage-authorization" title="Authorization">
          <ContentHeading id="basic-usage-authorization-react" title="React" />
          <P>
            To check authentication state in your React components, use the{" "}
            authentication state components from <Code>convex/react</Code>.
          </P>
          <CodeBlock
            language="tsx"
            filename="App.tsx"
            code={stripIndent`
                import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

                export default function App() {
                  return (
                    <>
                      <AuthLoading>
                        <div>Loading...</div>
                      </AuthLoading>
                      <Authenticated>
                        <Dashboard />
                      </Authenticated>
                      <Unauthenticated>
                        <SignIn />
                      </Unauthenticated>
                    </>
                  )
                }
              `}
          />
          <ContentHeading
            id="basic-usage-authorization-convex-functions"
            title="Convex Functions"
          />
          <P>
            For authorization and user checks inside Convex functions (queries,
            mutations, actions), use Convex&apos;s <Code>ctx.auth</Code> or the
            <Code>getAuthUserId()</Code>/<Code>getAuthUser()</Code> methods on
            the Better Auth Convex component:
          </P>
          <CodeBlock
            language="ts"
            filename="convex/someFile.ts"
            code={stripIndent`
                import { betterAuthComponent } from "./auth";
                import { Id } from "./_generated/dataModel";

                export const myFunction = query({
                  args: {},
                  handler: async (ctx) => {
                    // You can get the user id directly from Convex via ctx.auth
                    const identity = await ctx.auth.getUserIdentity();
                    if (!identity) {
                      return null;
                    }
                    // For now the id type requires an assertion
                    const userIdFromCtx = identity.subject as Id<"users">;

                    // The component provides a convenience method to get the user id
                    const userId = await betterAuthComponent.getAuthUserId(ctx);
                    if (!userId) {
                      return null
                    }

                    const user = await ctx.db.get(userId as Id<"users">);


                    // Get user email and other metadata from the Better Auth component
                    const userMetadata = await betterAuthComponent.getAuthUser(ctx);

                    // You can combine them if you want
                    return { ...userMetadata, ...user };
                  }
                });
              `}
          />
        </Subsection>

        <Subsection id="basic-usage-server-side" title="Server side">
          <ContentHeading id="using-auth-api" title="Using auth.api" />
          <P>
            For full stack frameworks like Next.js and TanStack Start, Better
            Auth provides server side functionality via <Code>auth.api</Code>{" "}
            methods. With Convex, you would instead run these methods in your
            Convex functions.
          </P>
          <Callout>
            <Code>auth.api</Code> read-only methods can be run in a query. Use a
            mutation for anything that updates Better Auth tables.
          </Callout>
          <CodeBlock
            language="typescript"
            filename="convex/someFile.ts"
            removedLines={[1, 6, 7, 8, 9, 10]}
            addedLines={[2, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]}
            code={stripIndent`
              import { auth } from "./auth";
              import { createAuth } from "../src/lib/auth";

              // Example: viewing backup codes with the Two Factor plugin

              export const getBackupCodes = () => {
                return auth.api.viewBackupCodes({
                  body: { userId: "user-id" }
                })
              }

              export const getBackupCodes = query({
                args: {
                  userId: v.id("users"),
                },
                handler: async (ctx, args) => {
                  const auth = createAuth(ctx);
                  return await auth.api.viewBackupCodes({
                    body: {
                      userId: args.userId,
                    },
                  });
                },
              });
            `}
          />

          <ContentHeading id="basic-usage-server-sessions" title="Sessions" />
          <P>
            Accessing the session server side requires request headers. The
            Convex component provides a method for generating headers for the
            current session.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/someFile.ts"
            code={stripIndent`
                import { betterAuthComponent } from "./auth";
                import { createAuth } from "../src/lib/auth";

                export const getSession = query({
                  args: {},
                  handler: async (ctx) => {
                    const auth = createAuth(ctx);
                    const headers = await betterAuthComponent.getHeaders(ctx);
                    const session = await auth.api.getSession({
                      headers,
                    });
                    if (!session) {
                      return null;
                    }
                    // Do something with the session
                    return session;
                  }
                });
              `}
          />

          <ContentHeading
            id="basic-usage-server-side-auth"
            title="Server-side auth"
          />
          <P>
            Server-side authentication with the Better Auth component works
            similar to other Convex authentication providers. See the Convex
            docs for your framework for more details.
          </P>
          <Ul>
            <Li>
              <a
                href="https://docs.convex.dev/client/react/nextjs/server-rendering#server-side-authentication"
                className="underline"
              >
                Next.js
              </a>
            </Li>
            <Li>
              <a
                href="https://docs.convex.dev/client/react/tanstack-start/#authentication"
                className="underline"
              >
                TanStack Start
              </a>
            </Li>
          </Ul>

          <P>
            Server side authentication with Convex requires a token. To get an
            identity token with Better Auth, use the framework appropriate{" "}
            <Code>getToken</Code> approach.
          </P>

          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "next",
                label: "Next.js",
                language: "typescript",
                filename: "app/actions.ts",
                code: stripIndent`
                "use server";

                import { api } from "@/convex/_generated/api";
                import { getToken } from "@convex-dev/better-auth/nextjs";
                import { fetchMutation } from "convex/nextjs";
                import { createAuth } from "../lib/auth";

                // Authenticated mutation via server function
                export async function createPost(title: string, content: string) {
                  const token = await getToken(createAuth);
                  await fetchMutation(api.posts.create, { title, content }, { token });
                }
              `,
              },
              {
                id: "tanstack",
                label: "TanStack Router",
                language: "typescript",
                filename: "src/routes/index.tsx",
                code: stripIndent`
                  import { createServerFn } from "@tanstack/react-start";
                  import { ConvexHttpClient } from "convex/browser";
                  import { getCookieName } from "../lib/utils";
                  import { api } from "../../convex/_generated/api";

                  const setupClient = (token?: string) => {
                    const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)
                    if (token) {
                      client.setAuth(token)
                    }
                    return client
                  }

                  const getToken = async () => {
                    const sessionCookieName = await getCookieName(createAuth)
                    return getCookie(sessionCookieName)
                  }

                  export const createPost = createServerFn({ method: 'POST' })
                    .handler(async ({ data: { title, content } }) => {
                      const token = await getToken()
                      await setupClient(token).mutation(api.posts.create, {
                        title,
                        content,
                      })
                    })
                `,
              },
            ]}
          />
        </Subsection>

        <ContentHeading id="basic-usage-that-is-it" title="That's it!" />
        <P>
          That&apos;s it! You should now have a working authentication system.
        </P>
        <P>
          Check out the{" "}
          <a href="https://www.better-auth.com/docs" className="underline">
            Better Auth docs
          </a>{" "}
          for more information on how to use Better Auth.
        </P>
      </Section>

      <Section id="integrations" title="Integrations">
        <Subsection id="integrations-hono" title="Hono">
          <P>
            <a href="https://hono.dev/" className="underline">
              Hono
            </a>{" "}
            can be used in place of the component <Code>registerRoutes()</Code>{" "}
            method. Check out the{" "}
            <a
              href="https://stack.convex.dev/hono-with-convex#using-hono-with-convex"
              className="underline"
            >
              Convex w/ Hono Stack article
            </a>{" "}
            and the{" "}
            <a
              href="https://www.better-auth.com/docs/integrations/hono"
              className="underline"
            >
              Better Auth Hono docs
            </a>{" "}
            for more details.
          </P>
          <Callout>
            You&apos;ll need to install the <Code>convex-helpers</Code> package
            if you haven&apos;t already.
          </Callout>
          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { Hono } from "hono";
                  import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
                  import { cors } from "hono/cors";
                  import { ActionCtx } from "./_generated/server";
                  import { createAuth } from "../lib/auth";

                  const app: HonoWithConvex<ActionCtx> = new Hono();

                  app.use(
                    "/api/auth/*",
                    cors({
                      origin: "http://localhost:5173",
                      allowHeaders: ["Content-Type", "Authorization", "Better-Auth-Cookie"],
                      allowMethods: ["GET", "POST", "OPTIONS"],
                      exposeHeaders: ["Content-Length", "Set-Better-Auth-Cookie"],
                      maxAge: 600,
                      credentials: true,
                    })
                  );

                  // Redirect root well-known to api well-known
                  app.get("/.well-known/openid-configuration", async (c) => {
                    return c.redirect('/api/auth/convex/.well-known/openid-configuration')
                  });

                  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
                    const auth = createAuth(c.env);
                    return auth.handler(c.req.raw);
                  });

                  const http = new HttpRouterWithHono(app);

                  export default http;
                `,
              },
              {
                id: "next",
                label: "Next.js",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { Hono } from "hono";
                  import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
                  import { ActionCtx } from "./_generated/server";
                  import { createAuth } from "../lib/auth";

                  const app: HonoWithConvex<ActionCtx> = new Hono();

                  // Redirect root well-known to api well-known
                  app.get("/.well-known/openid-configuration", async (c) => {
                    return c.redirect('/api/auth/convex/.well-known/openid-configuration')
                  });

                  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
                    const auth = createAuth(c.env);
                    return auth.handler(c.req.raw);
                  });

                  const http = new HttpRouterWithHono(app);

                  export default http;
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "convex/http.ts",
                code: stripIndent`
                  import { Hono } from "hono";
                  import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
                  import { ActionCtx } from "./_generated/server";
                  import { createAuth } from "../src/lib/auth";

                  const app: HonoWithConvex<ActionCtx> = new Hono();

                  // Redirect root well-known to api well-known
                  app.get("/.well-known/openid-configuration", async (c) => {
                    return c.redirect('/api/auth/convex/.well-known/openid-configuration')
                  });

                  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
                    const auth = createAuth(c.env);
                    return auth.handler(c.req.raw);
                  });

                  const http = new HttpRouterWithHono(app);

                  export default http;
                `,
              },
            ]}
          />
        </Subsection>
      </Section>

      <Section id="guides" title="Guides">
        <Subsection id="guides-users-table" title="Users table">
          <P>
            The Better Auth component has it&apos;s own tables in it&apos;s own
            space in your Convex project, like all Convex components. This means
            the Better Auth user table is separate from your application tables.
          </P>
          <P>
            Because of this, the Better Auth component requires that you create
            your own users table for your application. This table can have
            whatever fields you like, while the component user table keeps basic
            info such as email, verification status, two factor, etc.
          </P>
          <ContentHeading id="guides-user-creation" title="User creation" />
          <P>
            When Better Auth creates a user, it will first run an
            <Code>onCreateUser</Code> hook where you will create your user and
            return the id. Better Auth then creates it&apos;s own user record
            and sets a relation to the provided id.
          </P>
          <P>
            The id you return will be the canonical user id. It will be
            referenced in the session and in the jwt claims provided to Convex.
          </P>
          <P>
            <Code>onCreateUser</Code> is required for keeping your users table
            transactionally synced with the Better Auth user table. There are
            also optional <Code>onUpdateUser</Code> and{" "}
            <Code>onDeleteUser</Code> hooks. These hooks can also do whatever
            else you want for each event.
          </P>

          <Callout>
            <Code>onUpdateUser</Code> and <Code>onDeleteUser</Code> run when
            Better Auth updates a user, but any updates to your own app&apos;s
            users table will not trigger it. If you are syncing fields from
            Better Auth (eg., <Code>email</Code>) to your own users table, it is
            recommended to make changes to those fields through Better Auth so
            things stay synced.
          </Callout>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { asyncMap } from "convex-helpers";
                import { betterAuthComponent } from "./auth";
                import { Id } from "./_generated/dataModel";

                export const { createUser, deleteUser, updateUser, createSession } =
                  betterAuthComponent.createAuthFunctions({

                    // Must create a user and return the user id
                    onCreateUser: async (ctx, user) => {
                      const userId = await ctx.db.insert("users", {
                        someField: "foo",
                      });

                      // The user id must be returned
                      return userId;
                    },

                    onUpdateUser: async (ctx, user) => {
                      await ctx.db.patch(user.userId as Id<"users">, {
                        someField: "foo",
                      });
                    },

                    // Delete the user when they are deleted from Better Auth
                    // You can also omit this and use Better Auth's
                    // auth.api.deleteUser() function to trigger user deletion
                    // from within your own user deletion logic.
                    onDeleteUser: async (ctx, userId) => {
                      await ctx.db.delete(userId as Id<"users">);

                      // Optionally delete any related data
                    },
                  });
                `}
          />
          <ContentHeading
            id="guides-indexing-on-metadata"
            title="Indexing on metadata"
          />
          <P>
            You may have a need for accessing user metadata in your own user
            table, such as indexing by email or some other metadata. You can
            copy user metadata to your own user table on creation, and use the{" "}
            optional <Code>onUpdateUser</Code> hook to update your user table
            when a user&apos;s metadata changes. Note that changes you make to
            the synced field will not be reflected in the Better Auth user
            table.
          </P>
          <P>
            The user hooks are run in the same transaction as Better Auth&apos;s
            user create/update/delete operations, so if your hook throws an
            error or fails to write, the entire operation is guaranteed to fail,
            ensuring the user tables stay synced.
          </P>

          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                // ...

                export const { createUser, deleteUser, updateUser } =
                  betterAuthComponent.createAuthFunctions({
                    onCreateUser: async (ctx, user) => {
                      // Copy the user's email to the application users table.
                      return await ctx.db.insert("users", {
                        email: user.email,
                      });
                    },

                    onUpdateUser: async (ctx, user) => {
                      // Keep the user's email synced
                      await ctx.db.patch(user.userId as Id<"users">, {
                        email: user.email,
                      });
                    },

                    // ...
                  });
                `}
          />
        </Subsection>
        <Subsection
          id="migrating-existing-users"
          title="Migrating Existing Users"
        >
          <P>
            <strong className="font-bold">Note:</strong> This guide is for
            applications migrating users that are already in their Convex
            database, and does not cover email/password authentication due to
            differences in password hashing.
          </P>
          <P>
            If you&apos;re migrating from an existing authentication system, you
            can use a gradual migration approach that moves users over as they
            log in. This method is less disruptive than a bulk migration and
            allows you to handle edge cases more gracefully.
          </P>

          <P>
            Implement the migration logic in your <Code>onCreateUser</Code> hook
            in <Code>convex/auth.ts</Code>. This will run when Better Auth
            attempts to create a new user, allowing you to gradually migrate
            users as they access your app.
          </P>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                export const { createUser, deleteUser, updateUser, createSession } =
                  betterAuthComponent.createAuthFunctions({
                    onCreateUser: async (ctx, user) => {
                      const existingUser = await ctx.db
                        .query('users')
                        .withIndex('email', (q) => q.eq('email', user.email))
                        .unique()

                      if (existingUser && !user.emailVerified) {
                        // This would be due to a social login provider where the email is not
                        // verified.
                        throw new ConvexError('Email not verified')
                      }

                      if (existingUser) {
                        // Drop old auth system fields (if any)
                        await ctx.db.patch(existingUser._id as Id<'users'>, {
                          oldAuthField: undefined,
                          otherOldAuthField: undefined,
                          foo: 'bar',
                        })
                        return existingUser._id as Id<'users'>
                      }

                      // No existing user found, create a new one and return the id
                      return await ctx.db.insert('users', {
                        foo: 'bar',
                      })
                    },
                    // ...
                  })
              `}
          />
        </Subsection>
        <Subsection id="migrate-0-6-to-0-7" title="Migrate 0.6 &rarr; 0.7">
          <ContentHeading
            id="migrate-0-6-to-0-7-update-better-auth"
            title="Update Better Auth"
          />
          <P>
            Update the component to latest, the <Code>better-auth</Code> package
            to <Code>1.2.12</Code>, and Convex to <Code>latest</Code> (or at
            least <Code>1.25.0</Code>).
          </P>

          <CodeBlock
            variantGroup="package-manager"
            variants={[
              {
                id: "npm",
                label: "npm",
                code: stripIndent`
                    npm install @convex-dev/better-auth@latest
                    npm install better-auth@1.2.12 --save-exact
                    npm install convex@latest
                  `,
                language: "shell",
              },
              {
                id: "pnpm",
                label: "pnpm",
                code: stripIndent`
                    pnpm add @convex-dev/better-auth@latest
                    pnpm add better-auth@1.2.12 --save-exact
                    pnpm add convex@latest
                  `,
                language: "shell",
              },
              {
                id: "yarn",
                code: stripIndent`
                    yarn add @convex-dev/better-auth@latest
                    yarn add better-auth@1.2.12 --exact
                    yarn add convex@latest
                  `,
                language: "shell",
              },
              {
                id: "bun",
                code: stripIndent`
                    bun add @convex-dev/better-auth@latest
                    bun add better-auth@1.2.12 --exact
                    bun add convex@latest
                  `,
                language: "shell",
              },
            ]}
          />

          <ContentHeading
            id="migrate-0-6-to-0-7-register-routes"
            title="registerRoutes()"
          />
          <Ul>
            <Li>
              The <Code>betterAuthComponent.registerRoutes()</Code> method no
              longer includes CORS route handling by default. This is the
              correct behavior for full stack apps using the Next.js or TanStack
              instructions, as well as Expo native apps.
            </Li>
            <Li>
              For React or any app that is only using client side auth (if your
              app uses the crossDomain plugin, this applies), you will need to
              pass the <Code>cors: true</Code> option.
            </Li>
            <Li>
              The <Code>path</Code> and <Code>allowedOrigins</Code> options have
              been removed, and now defer entirely to Better Auth&apos;s{" "}
              <Code>basePath</Code> and <Code>trustedOrigins</Code> options,
              respectively.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/http.ts"
            removedLines={[7, 8, 9]}
            addedLines={[11, 12]}
            code={stripIndent`
              import { httpRouter } from 'convex/server'
              import { betterAuthComponent } from './auth'
              import { createAuth } from '../src/lib/auth'

              const http = httpRouter()

              betterAuthComponent.registerRoutes(http, createAuth, {
                // Remove these if you were using them
                path: "/api/auth",
                allowedOrigins: ["http://localhost:3000"],

                // Only add this for client-only apps
                cors: true,
              })

              export default http
            `}
          />
          <ContentHeading
            id="migrate-0-6-to-0-7-relocate-create-auth"
            title="Relocate createAuth()"
          />
          <P>
            Relocate <Code>createAuth()</Code> from <Code>convex/auth.ts</Code>
            to <Code>&lt;lib&gt;/auth.ts</Code> - this will avoid warnings from
            Convex 1.25+ about importing Convex functions into the browser.
          </P>
          <Callout>
            Be sure to update all imports of <Code>createAuth</Code> to the new
            location.
          </Callout>
          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "src/lib/auth.ts",
                addedLines: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                ],
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../../convex/auth";
                  import { type GenericCtx } from "../../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:5173";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),

                        // The cross domain plugin is required for client side frameworks
                        crossDomain({
                          siteUrl,
                        }),
                      ],
                    });
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "lib/auth.ts",
                addedLines: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                ],
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../convex/auth";
                  import { type GenericCtx } from "../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:3000";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your next.js server
                      baseURL: siteUrl,
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "src/lib/auth.ts",
                addedLines: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                ],
                code: stripIndent`
                  import { convexAdapter } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { betterAuthComponent } from "../../convex/auth";
                  import { type GenericCtx } from "../../convex/_generated/server";

                  // You'll want to replace this with an environment variable
                  const siteUrl = "http://localhost:3000";

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your TanStack Start server
                      baseURL: siteUrl,
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });
                `,
              },
            ]}
          />
          <CodeBlock
            variantGroup="framework"
            variants={[
              {
                id: "react",
                label: "React",
                language: "typescript",
                filename: "convex/auth.ts",
                removedLines: [
                  3, 6, 7, 9, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
                  39, 40, 41, 42, 43, 44, 45, 46,
                ],
                addedLines: [10],
                code: stripIndent`
                  import {
                    BetterAuth,
                    convexAdapter,
                    type AuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query, type GenericCtx } from "./_generated/server";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // ... existing code ...

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),

                        // The cross domain plugin is required for client side frameworks
                        crossDomain({
                          siteUrl,
                        }),
                      ],
                    });

                  // ... existing code ...
                `,
              },
              {
                id: "nextjs",
                label: "Next.js",
                language: "typescript",
                filename: "convex/auth.ts",
                removedLines: [
                  3, 7, 8, 10, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
                  28, 29, 30, 31, 32,
                ],
                addedLines: [11],
                code: stripIndent`
                  import {
                    BetterAuth,
                    convexAdapter,
                    type AuthFunctions,
                    type PublicAuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query, type GenericCtx } from "./_generated/server";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // ... existing code ...

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your next.js server
                      baseURL: "http://localhost:3000",
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });

                  // ... existing code ...
                `,
              },
              {
                id: "tanstack",
                label: "TanStack Start",
                language: "typescript",
                filename: "convex/auth.ts",
                removedLines: [
                  3, 6, 7, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                  27, 28, 29, 30, 31,
                ],
                addedLines: [10],
                code: stripIndent`
                  import {
                    BetterAuth,
                    convexAdapter,
                    type AuthFunctions,
                  } from "@convex-dev/better-auth";
                  import { convex } from "@convex-dev/better-auth/plugins";
                  import { betterAuth } from "better-auth";
                  import { api, components, internal } from "./_generated/api";
                  import { query, type GenericCtx } from "./_generated/server";
                  import { query } from "./_generated/server";
                  import type { Id, DataModel } from "./_generated/dataModel";

                  // ... existing code ...

                  export const createAuth = (ctx: GenericCtx) =>
                    // Configure your Better Auth instance here
                    betterAuth({
                      // All auth requests will be proxied through your TanStack Start server
                      baseURL: "http://localhost:3000",
                      database: convexAdapter(ctx, betterAuthComponent),

                      // Simple non-verified email/password to get started
                      emailAndPassword: {
                        enabled: true,
                        requireEmailVerification: false,
                      },
                      plugins: [
                        // The Convex plugin is required
                        convex(),
                      ],
                    });

                  // ... existing code ...
                `,
              },
            ]}
          />

          <ContentHeading
            id="migrate-0-6-to-0-7-tanstack-fetch-session"
            title="TanStack auth helpers"
          />
          <P>
            Because environment variables are not accessible to dependencies
            with Vite, the react-start exports should now be initialized
            together in a single file. You can do this anywhere, but{" "}
            <Code>src/lib/utils.ts</Code> is a good place.
          </P>
          <CodeBlock
            language="typescript"
            filename="src/lib/utils.ts"
            addedLines={[1, 2, 3, 4, 5, 6, 7]}
            code={stripIndent`
              import { reactStartHelpers } from '@convex-dev/better-auth/react-start'
              import { createAuth } from '../src/lib/auth'

              export const { fetchSession, reactStartHandler, getCookieName } =
                reactStartHelpers(createAuth, {
                  convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
                })
            `}
          />
          <P>
            Update imports and <Code>getCookieName()</Code> args in the root
            layout.
          </P>
          <CodeBlock
            language="typescript"
            filename="src/routes/__root.tsx"
            removedLines={[2, 3, 10]}
            addedLines={[4, 11]}
            code={stripIndent`
              import { authClient } from '@/lib/auth-client'
              import { createAuth } from '@/lib/auth'
              import { fetchSession, getCookieName } from '@convex-dev/better-auth/react-start'
              import { fetchSession, getCookieName } from '@/lib/utils'

              // ...

              // Server side session request
              const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
                const sessionCookieName = await getCookieName(createAuth)
                const sessionCookieName = await getCookieName()
                const token = getCookie(sessionCookieName)
                const request = getWebRequest()
                const { session } = await fetchSession(request)
                return {
                  userId: session?.user.id,
                  token,
                }
              })
            `}
          />
          <P>Update imports in the auth handler route.</P>
          <CodeBlock
            language="typescript"
            filename="src/routes/api/auth/$.ts"
            removedLines={[2]}
            addedLines={[3]}
            code={stripIndent`
              import { createServerFileRoute } from '@tanstack/react-start/server'
              import { reactStartHandler } from '@convex-dev/better-auth/react-start'
              import { reactStartHandler } from '@/lib/utils'
            `}
          />
        </Subsection>
        <Subsection id="migrate-0-5-to-0-6" title="Migrate 0.5 &rarr; 0.6">
          <Ul>
            <Li>
              All imports from <Code>@erquhart/convex-better-auth</Code> have
              been updated to <Code>@convex-dev/better-auth</Code>. Search and
              replace this across your repo.
            </Li>
            <Li>
              Your framework may work full stack without cross domain - go
              checkout the{" "}
              <a href="#installation" className="underline">
                installation
              </a>{" "}
              section for more details.
            </Li>
            <Li>
              <Code>AuthFunctions</Code> are now passed to the{" "}
              <Code>BetterAuth</Code> component constructor via the{" "}
              <Code>config</Code> object.
            </Li>
            <Li>
              The <Code>crossDomain</Code> plugin now requires a{" "}
              <Code>siteUrl</Code> option.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            removedLines={[1, 2, 8, 15, 19]}
            addedLines={[3, 4, 9, 10, 11, 20, 21, 22]}
            code={stripIndent`
                import { BetterAuth, type AuthFunctions, convexAdapter } from "@erquhart/convex-better-auth";
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { BetterAuth, type AuthFunctions, convexAdapter } from "@convex-dev/better-auth";
                import { convex, crossDomain } from "@convex-dev/better-auth/plugins";

                export const betterAuthComponent = new BetterAuth(
                  components.betterAuth,
                  authFunctions,
                  {
                    authFunctions: authFunctions,
                  }
                )
                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    trustedOrigins: ["http://localhost:3000"],
                    database: convexAdapter(ctx, betterAuthComponent),
                    plugins: [
                      convex(),
                      crossDomain(),
                      crossDomain({
                        siteUrl: "http://localhost:3000",
                      }),
                    ],
                  });
              `}
          />
        </Subsection>
        <Subsection id="migrate-0-4-to-0-5" title="Migrate 0.4 &rarr; 0.5">
          <Ul>
            <Li>
              Plugins and client plugins exported by the Convex Better Auth
              component are now exported under <Code>/plugins</Code> and
              <Code>/client/plugins</Code> respectively.
            </Li>
            <Li>
              A new <Code>crossDomain</Code> plugin is available. It&apos;s
              functionality was previously baked into the <Code>convex</Code>{" "}
              plugin.
            </Li>
            <Li>
              Projects that were running v0.4.x will need to add the{" "}
              <Code>crossDomain</Code> plugin to their Better Auth client and
              server instances.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { betterAuth } from "better-auth";
                import { GenericCtx } from "./_generated/server";

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    // ...
                    plugins: [crossDomain(), convex()],
                  });
              `}
          />
          <CodeBlock
            language="typescript"
            filename="lib/auth-client.ts"
            code={stripIndent`
                import { createAuthClient } from "better-auth/react";
                import {
                  convexClient,
                  crossDomainClient,
                } from "@erquhart/convex-better-auth/client/plugins";

                export const authClient = createAuthClient({
                  // ...
                  plugins: [crossDomainClient(), convexClient()],
                });
              `}
          />
          <Ul>
            <Li>
              The <Code>betterAuthComponent.authApi</Code> method is now{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code>.
            </Li>
            <Li>
              All four named exports returned from{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code> are now
              required, even if you&apos;re only providing an{" "}
              <Code>onCreateUser</Code> hook.
            </Li>
            <Li>
              If you pass your <Code>DataModel</Code> to{" "}
              <Code>betterAuthComponent.createAuthFunctions</Code>, everything
              is now typed except for Ids, which still need to be asserted. Any
              other type assertions from before can be removed.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/users.ts"
            code={stripIndent`
                import { betterAuthComponent } from "./auth";
                import type { DataModel } from "./_generated/dataModel";

                export const { createUser, deleteUser, updateUser, createSession } =
                  betterAuthComponent.createAuthFunctions<DataModel>({
                    onCreateUser: async (ctx, user) => {
                      return await ctx.db.insert('users', {})
                    },
                  })
              `}
          />

          <Ul>
            <Li>
              The <Code>authFunctions</Code> object (formerly{" "}
              <Code>authApi</Code>) is now passed to the <Code>BetterAuth</Code>{" "}
              constructor, and is no longer passed to <Code>convexAdapter</Code>
              .
            </Li>
            <Li>
              <Code>authFunctions</Code> is now typed using the{" "}
              <Code>AuthFunctions</Code> type.
            </Li>
            <Li>
              <Code>convexAdapter</Code> now takes the{" "}
              <Code>betterAuthComponent</Code> instance instead of the{" "}
              <Code>components.betterAuth</Code> object.
            </Li>
          </Ul>
          <CodeBlock
            language="typescript"
            filename="convex/auth.ts"
            code={stripIndent`
                import { BetterAuth, type AuthFunctions } from "@erquhart/convex-better-auth";
                import { convex, crossDomain } from "@erquhart/convex-better-auth/plugins";
                import { components, internal } from "./_generated/api";

                const authFunctions: AuthFunctions = internal.users;

                export const betterAuthComponent = new BetterAuth(
                  components.betterAuth,
                  authFunctions,
                );

                export const createAuth = (ctx: GenericCtx) =>
                  betterAuth({
                    database: convexAdapter(ctx, betterAuthComponent),
                    trustedOrigins: ["http://localhost:3000"],
                    plugins: [convex(), crossDomain()],
                  });
              `}
          />
        </Subsection>
      </Section>
    </div>
  );
}
