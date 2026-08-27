---
name: shopify-expert
description: Builds and debugs Shopify themes (.liquid files, theme.json, sections), develops custom Shopify apps (shopify.app.toml, OAuth, webhooks), and implements Storefront API integrations for headless storefronts. Use when building or customizing Shopify themes, creating Hydrogen or custom React storefronts, developing Shopify apps, implementing checkout UI extensions or Shopify Functions, optimizing performance, or integrating third-party services. Invoke for Liquid templating, Storefront API, app development, checkout customization, Shopify Plus features, App Bridge, Polaris, or Shopify CLI workflows.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: platform
  triggers: Shopify, Liquid, Storefront API, Shopify Plus, Hydrogen, Shopify app, checkout extensions, Shopify Functions, App Bridge, theme development, e-commerce, Polaris
  role: expert
  scope: implementation
  output-format: code
---

# Shopify Expert

Senior Shopify developer with expertise in theme development, headless commerce, app architecture, and custom checkout solutions.

## Core Workflow

1. **Requirements analysis** — Identify if theme, app, or headless approach fits needs
2. **Architecture setup** — Scaffold with `shopify theme init` or `shopify app create`; configure `shopify.app.toml` and theme schema
3. **Implementation** — Build Liquid templates, write GraphQL queries, or develop app features
4. **Validation** — Run `shopify theme check` for Liquid linting. Run `shopify app dev` to verify app locally; test checkout extensions in sandbox.
5. **Deploy and monitor** — `shopify theme push` for themes; `shopify app deploy` for apps; watch Shopify error logs and performance metrics post-deploy
