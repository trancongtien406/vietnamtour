# Project Surface Discovery

Locate the implementation target from repository evidence. Directory names are labels chosen by the project; never require `mobile/`, `website/`, `web/`, `app/`, or any other conventional name, and never ask the user to rename or map folders just to begin.

## Discovery order

1. Treat an explicit path, file, route, package name, or workspace named in the request as the strongest anchor. Resolve its owning app/package from the nearest manifest and its workspace configuration.
2. Read project instructions and architecture evidence first: `AGENTS.md`, `README`, workspace manifests, package scripts, build configuration, and existing route/source files. Respect project-defined ownership boundaries.
3. If the target is not explicit, inspect the repository root and workspace metadata, then scan plausible source directories to a bounded depth. Ignore generated/vendor trees such as `.git`, `node_modules`, `build`, `dist`, `.dart_tool`, `Pods`, and generated platform output. Do not use a folder-name allowlist as the discovery mechanism.
4. Infer each candidate's role from multiple signals. Examples:

| Evidence | Likely surface |
| --- | --- |
| `pubspec.yaml`, `lib/main.dart`, Flutter platform/build config | Flutter app; determine native vs web target from the request and configured targets |
| `package.json` with `react-native` or Expo plus native config | React Native app |
| `.xcodeproj` / `.xcworkspace` with Swift sources, or Android Gradle app module with Kotlin/Java | Native iOS / Android app |
| `package.json` with Next.js, Vite, Remix, Astro, or another browser framework plus route/entry files | Web app or site |
| workspace manifest (`pnpm-workspace.yaml`, `workspaces`, `nx.json`, `turbo.json`, `melos.yaml`) | Monorepo; inspect declared packages and their manifests rather than assuming a root app |

Names such as `app_123`, `client`, `web`, `frontend`, `product`, `apps/storefront`, or an organization-specific name are valid. A directory name alone is never enough to classify a surface.

## Select the target

- Match the requested platform, route, feature, and current code evidence to the candidate package. Prefer the narrowest owning package that contains the requested screen or flow.
- For a cross-platform task, identify the shared UI package and platform-specific implementations separately; change each only when required by the request.
- For multiple independent apps, use task context and repository instructions to select. Ask one short clarification only if two or more candidates remain materially plausible and choosing incorrectly would change the implementation. State the candidates with their paths and evidence; do not ask the user to translate platform names into folder names.
- If one candidate is clearly strongest, proceed and state the inferred path and evidence briefly. If no candidate is conclusive, inspect more evidence before asking. Do not create a new conventional folder to hide uncertainty.
- When the repository root itself is not available in the current workspace, ask for the project or relevant source path; do not ask whether it is called `mobile` or `website`.

## Preserve project structure

Use the exact discovered paths in commands, imports, tests, and handoff. Preserve existing package and workspace boundaries. Never move code, create `mobile/` or `website/`, or rewrite workspace configuration solely to match this skill's examples. Fixed `.engineer-intelligence/**` paths refer to EI's installed knowledge, not to the product's source directories.

## Report the inference

Before a substantial implementation, record the selected surface, exact source root, framework/build evidence, and any excluded sibling app. Mark uncertainty explicitly. Re-run this discovery if new repository evidence contradicts the initial classification.
