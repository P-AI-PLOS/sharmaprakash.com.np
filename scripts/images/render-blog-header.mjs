#!/usr/bin/env node

import { Resvg } from "@resvg/resvg-js";
import matter from "gray-matter";
import React from "react";
import satori from "satori";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const postPath = process.argv[2];

if (!postPath) {
  fail("Usage: pnpm blog-image:render src/content/posts/<post>.md");
}

const absolutePostPath = join(repoRoot, postPath);

if (!existsSync(absolutePostPath)) {
  fail(`Post not found: ${postPath}`);
}

const { data } = matter(readFileSync(absolutePostPath, "utf8"));
const slug = basename(postPath, ".md");
const title = cleanTitle(String(data.title ?? slug), slug);
const excerpt = cleanExcerpt(String(data.excerpt ?? ""));
const directory = getDirectoryLabel(data);
const date = data.date ? formatDate(data.date) : "";
const visualLines = getVisualLines(slug);

const outputs = [
  {
    width: 1600,
    height: 686,
    path: join(repoRoot, "public", "images", "blog", "generated", "covers", `${slug}.png`),
  },
  {
    width: 1200,
    height: 675,
    path: join(repoRoot, "public", "images", "blog", "generated", "thumbs", `${slug}.png`),
  },
];

const fonts = [
  {
    name: "Arial",
    data: loadFirstExistingFont([
      join(repoRoot, "public", "fonts", "Inter-Regular.ttf"),
      "/System/Library/Fonts/Supplemental/Arial.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]),
    weight: 400,
    style: "normal",
  },
  {
    name: "Arial",
    data: loadFirstExistingFont([
      join(repoRoot, "public", "fonts", "Inter-Bold.ttf"),
      "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
      "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]),
    weight: 700,
    style: "normal",
  },
];

for (const output of outputs) {
  mkdirSync(join(output.path, ".."), { recursive: true });
  const svg = await satori(renderTemplate({ ...output, title, excerpt, directory, date, visualLines }), {
    width: output.width,
    height: output.height,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: output.width,
    },
  }).render().asPng();

  writeFileSync(output.path, png);
  console.log(`Wrote ${output.path}`);
}

function renderTemplate({ width, height, title, excerpt, directory, date, visualLines }) {
  const scale = width / 1600;
  const isTall = height / width > 0.5;
  const isLongTitle = title.length > 52;
  const headlineWidth = Math.round(width * (isTall ? (isLongTitle ? 0.66 : 0.78) : (isLongTitle ? 0.52 : 0.62)));
  const headlineSize = Math.round((isTall ? 68 : 74) * scale);
  const bodySize = Math.round((isTall ? 27 : 25) * scale);
  const labelSize = Math.round(20 * scale);
  const codeSize = Math.round(23 * scale);

  return React.createElement(
    "div",
    {
      style: {
        position: "relative",
        display: "flex",
        width,
        height,
        overflow: "hidden",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, #fff7ed 0%, #f8fafc 36%, #e0f2fe 100%)",
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        width: Math.round(520 * scale),
        height: Math.round(520 * scale),
        right: Math.round(-120 * scale),
        top: Math.round(-170 * scale),
        borderRadius: Math.round(260 * scale),
        background: "#f59e0b",
        opacity: 0.16,
      },
    }),
    React.createElement("div", {
      style: {
        position: "absolute",
        width: Math.round(470 * scale),
        height: Math.round(470 * scale),
        left: Math.round(-140 * scale),
        bottom: Math.round(-190 * scale),
        borderRadius: Math.round(235 * scale),
        background: "#0f766e",
        opacity: 0.14,
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          left: Math.round(84 * scale),
          top: Math.round(isTall ? 78 * scale : 86 * scale),
          width: headlineWidth,
          display: "flex",
          flexDirection: "column",
          gap: Math.round(28 * scale),
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: Math.round(14 * scale),
            color: "#b45309",
            fontSize: labelSize,
            fontWeight: 700,
            letterSpacing: Math.round(2 * scale),
            textTransform: "uppercase",
          },
        },
        React.createElement("span", null, directory),
        React.createElement("span", { style: { color: "#94a3b8" } }, "/"),
        React.createElement("span", null, date)
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            fontSize: headlineSize,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: 0,
          },
        },
        title
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            maxWidth: Math.round(headlineWidth * 0.7),
            color: "#475569",
            fontSize: bodySize,
            lineHeight: 1.45,
          },
        },
        excerpt
      )
    ),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          right: Math.round(84 * scale),
          bottom: Math.round(isTall ? 74 * scale : 68 * scale),
          width: Math.round((isTall ? 540 : 610) * scale),
          height: Math.round((isTall ? 310 : 330) * scale),
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `${Math.max(1, Math.round(2 * scale))}px solid #cbd5e1`,
          borderRadius: Math.round(26 * scale),
          background: "#0f172a",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            height: Math.round(58 * scale),
            paddingLeft: Math.round(28 * scale),
            gap: Math.round(10 * scale),
            background: "#1e293b",
          },
        },
        ["#ef4444", "#f59e0b", "#22c55e"].map((color) =>
          React.createElement("span", {
            key: color,
            style: {
              width: Math.round(14 * scale),
              height: Math.round(14 * scale),
              borderRadius: Math.round(7 * scale),
              background: color,
            },
          })
        )
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: Math.round(30 * scale),
            gap: Math.round(12 * scale),
            color: "#e2e8f0",
            fontSize: codeSize,
            lineHeight: 1.34,
            fontFamily: "Arial",
          },
        },
        ...visualLines.map((line) => codeLine(line.text, line.color))
      )
    )
  );
}

function codeLine(text, color) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        whiteSpace: "nowrap",
      },
    },
    React.createElement("span", { style: { color: "#64748b" } }, "$"),
    React.createElement("span", { style: { color } }, text)
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function cleanTitle(value, slug) {
  if (slug.includes("unresolved-gem-specification")) {
    return "Solution to Unresolved Gem Specification Warning";
  }

  return value
    .replace(/-`/g, ": ")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanExcerpt(value) {
  return value
    .replace(/\brails\b/g, "Rails")
    .replace(/\bec2\b/g, "EC2")
    .replace(/\bdeploymentt\b/g, "deployment")
    .replace(/\s+/g, " ")
    .trim();
}

function getDirectoryLabel(data) {
  const candidates = [
    data.directory,
    Array.isArray(data.categories) ? data.categories[0] : data.categories,
    Array.isArray(data.category) ? data.category[0] : data.category,
    Array.isArray(data.tags) ? data.tags[0] : data.tags,
    "notes",
  ];
  const value = candidates.find((candidate) => String(candidate ?? "").trim().length > 0);

  return String(value).replace(/,$/, "").trim().toLowerCase();
}

function getVisualLines(slug) {
  if (slug.includes("rails-6-precompile-error-yarn")) {
    return [
      { text: "bundle exec rake assets:precompile", color: "#f8fafc" },
      { text: "yarn: error: no such option: --no-progress", color: "#f97316" },
      { text: "sudo apt remove cmdtest", color: "#38bdf8" },
      { text: "sudo apt install yarn", color: "#fbbf24" },
      { text: "deploy:production:restart", color: "#86efac" },
    ];
  }

  if (slug.includes("interesting-git-commands")) {
    return [
      { text: "git commit --amend", color: "#f8fafc" },
      { text: "git diff --ignore-all-space", color: "#38bdf8" },
      { text: "git stash save -u 'try later'", color: "#fbbf24" },
      { text: "git clone --depth=1 <repo>", color: "#86efac" },
      { text: "git rebase main", color: "#f97316" },
    ];
  }

  if (slug.includes("git-commands")) {
    return [
      { text: "git init", color: "#f8fafc" },
      { text: "git status", color: "#38bdf8" },
      { text: "git add -A", color: "#fbbf24" },
      { text: "git commit -m 'message'", color: "#86efac" },
      { text: "git push origin main", color: "#f97316" },
    ];
  }

  if (slug.includes("background-job-debugger")) {
    return [
      { text: "require 'pry-remote'", color: "#f8fafc" },
      { text: "binding.remote_pry", color: "#f97316" },
      { text: "[pry-remote] waiting on :9876", color: "#38bdf8" },
      { text: "$ pry-remote", color: "#fbbf24" },
      { text: "MyWorker.new.perform(args)", color: "#86efac" },
    ];
  }

  if (slug.includes("ports-80-and-443")) {
    return [
      { text: "http://example.com  ->  :80", color: "#f8fafc" },
      { text: "https://example.com -> :443", color: "#38bdf8" },
      { text: "DNS returns an IP, not a port", color: "#fbbf24" },
      { text: "Host header routes the request", color: "#86efac" },
      { text: "nginx listens once, serves many", color: "#f97316" },
    ];
  }

  if (slug.includes("ftp-cli")) {
    return [
      { text: "brew install inetutils", color: "#f8fafc" },
      { text: "ftp ftp.example.com", color: "#38bdf8" },
      { text: "telnet localhost 25", color: "#fbbf24" },
      { text: "High Sierra removed legacy clients", color: "#f97316" },
      { text: "restore tools intentionally", color: "#86efac" },
    ];
  }

  if (slug.includes("copying-value-from-variable")) {
    return [
      { text: "value='hello clipboard'", color: "#f8fafc" },
      { text: "echo $value | pbcopy", color: "#38bdf8" },
      { text: "pbpaste", color: "#fbbf24" },
      { text: "copy data from scripts", color: "#86efac" },
      { text: "avoid manual selection", color: "#f97316" },
    ];
  }

  if (slug.includes("same-enum-values")) {
    return [
      { text: "enum status: STATES", color: "#f8fafc" },
      { text: "enum payment_status: STATES", color: "#38bdf8" },
      { text: "reuse one mapping", color: "#fbbf24" },
      { text: "keep integer values aligned", color: "#86efac" },
      { text: "Rails model stays explicit", color: "#f97316" },
    ];
  }

  if (slug.includes("ignore-comments-in-rubocop")) {
    return [
      { text: "rubocop --auto-gen-config", color: "#f8fafc" },
      { text: "Exclude comments with regex", color: "#38bdf8" },
      { text: "# TODO: keep useful context", color: "#fbbf24" },
      { text: "Style/CommentAnnotation", color: "#86efac" },
      { text: "make lint signal clearer", color: "#f97316" },
    ];
  }

  if (slug.includes("devise-skip-confirmation")) {
    return [
      { text: "user.skip_confirmation!", color: "#f8fafc" },
      { text: "user.confirmed_at = Time.current", color: "#38bdf8" },
      { text: "user.save!", color: "#fbbf24" },
      { text: "seed confirmed accounts", color: "#86efac" },
      { text: "avoid sending email", color: "#f97316" },
    ];
  }

  if (slug.includes("flickering-screen")) {
    return [
      { text: "chrome://gpu", color: "#f8fafc" },
      { text: "disable hardware acceleration", color: "#38bdf8" },
      { text: "check display drivers", color: "#fbbf24" },
      { text: "Ubuntu fresh install", color: "#86efac" },
      { text: "stop screen flicker", color: "#f97316" },
    ];
  }

  if (slug.includes("setup-golang")) {
    return [
      { text: "wget go-linux-amd64.tar.gz", color: "#f8fafc" },
      { text: "sudo tar -C /usr/local -xzf go.tar.gz", color: "#38bdf8" },
      { text: "export GOPATH=$HOME/go", color: "#fbbf24" },
      { text: "go version", color: "#86efac" },
      { text: "hello, Ubuntu 16.04", color: "#f97316" },
    ];
  }

  if (slug.includes("setup-guake-terminal")) {
    return [
      { text: "sudo apt install guake", color: "#f8fafc" },
      { text: "F12 drops terminal down", color: "#38bdf8" },
      { text: "configure startup apps", color: "#fbbf24" },
      { text: "quake-style workflow", color: "#86efac" },
      { text: "terminal one key away", color: "#f97316" },
    ];
  }

  if (slug.includes("powerline-fonts")) {
    return [
      { text: "git clone powerline/fonts", color: "#f8fafc" },
      { text: "./install.sh", color: "#38bdf8" },
      { text: "select patched terminal font", color: "#fbbf24" },
      { text: "fix missing glyphs", color: "#86efac" },
      { text: "prompt icons render cleanly", color: "#f97316" },
    ];
  }

  if (slug.includes("share-project-locally")) {
    return [
      { text: "bundle exec rackup", color: "#f8fafc" },
      { text: "ngrok http 3000", color: "#38bdf8" },
      { text: "share temporary URL", color: "#fbbf24" },
      { text: "demo work in progress", color: "#86efac" },
      { text: "no deploy required", color: "#f97316" },
    ];
  }

  if (slug.includes("running-docker-as-ssh-daemon")) {
    return [
      { text: "docker run -d -p 2222:22 image", color: "#f8fafc" },
      { text: "service ssh start", color: "#38bdf8" },
      { text: "ssh root@localhost -p 2222", color: "#fbbf24" },
      { text: "container as test machine", color: "#86efac" },
      { text: "keep ports explicit", color: "#f97316" },
    ];
  }

  if (slug.includes("enable-wifi-disabled")) {
    return [
      { text: "rfkill list", color: "#f8fafc" },
      { text: "sudo rfkill unblock wifi", color: "#38bdf8" },
      { text: "service network-manager restart", color: "#fbbf24" },
      { text: "GUI toggle comes back", color: "#86efac" },
      { text: "check hardware switch", color: "#f97316" },
    ];
  }

  if (slug.includes("pending-migrations")) {
    return [
      { text: "bin/rake db:migrate RAILS_ENV=test", color: "#f8fafc" },
      { text: "ActiveRecord::PendingMigrationError", color: "#f97316" },
      { text: "prepare test database", color: "#38bdf8" },
      { text: "schema.rb catches up", color: "#fbbf24" },
      { text: "tests run again", color: "#86efac" },
    ];
  }

  if (slug.includes("rspec-with-ruby")) {
    return [
      { text: "gem install rspec", color: "#f8fafc" },
      { text: "rspec --init", color: "#38bdf8" },
      { text: "describe Calculator do", color: "#fbbf24" },
      { text: "expect(result).to eq(42)", color: "#86efac" },
      { text: "red, green, refactor", color: "#f97316" },
    ];
  }

  if (slug.includes("android-market")) {
    return [
      { text: "population x smartphone share", color: "#f8fafc" },
      { text: "Kathmandu Valley estimate", color: "#38bdf8" },
      { text: "segment reachable users", color: "#fbbf24" },
      { text: "Android install base", color: "#86efac" },
      { text: "market sizing from assumptions", color: "#f97316" },
    ];
  }

  if (slug.includes("installing-nokogiri")) {
    return [
      { text: "bundle config build.nokogiri", color: "#f8fafc" },
      { text: "sudo apt install libxml2-dev", color: "#38bdf8" },
      { text: "sudo apt install libxslt1-dev", color: "#fbbf24" },
      { text: "bundle install", color: "#86efac" },
      { text: "native extension builds cleanly", color: "#f97316" },
    ];
  }

  if (slug.includes("solidus-part-1")) {
    return [
      { text: "rails new store", color: "#f8fafc" },
      { text: "bundle add solidus", color: "#38bdf8" },
      { text: "bin/rails g solidus:install", color: "#fbbf24" },
      { text: "products, carts, checkout", color: "#86efac" },
      { text: "start the storefront", color: "#f97316" },
    ];
  }

  if (slug.includes("prefer-eql")) {
    return [
      { text: "1 == 1.0        # true", color: "#f8fafc" },
      { text: "1.eql?(1.0)    # false", color: "#f97316" },
      { text: "compare value and type", color: "#38bdf8" },
      { text: "Hash keys care about eql?", color: "#fbbf24" },
      { text: "Ruby equality is layered", color: "#86efac" },
    ];
  }

  if (slug.includes("current-branch-name")) {
    return [
      { text: "git branch --show-current", color: "#f8fafc" },
      { text: "parse branch in shell prompt", color: "#38bdf8" },
      { text: "feature/auth-flow", color: "#fbbf24" },
      { text: "show context before commands", color: "#86efac" },
      { text: "avoid wrong-branch commits", color: "#f97316" },
    ];
  }

  if (slug.includes("list-node-packages")) {
    return [
      { text: "npm list --depth=0", color: "#f8fafc" },
      { text: "npm list -g --depth=0", color: "#38bdf8" },
      { text: "inspect installed packages", color: "#fbbf24" },
      { text: "find version drift", color: "#86efac" },
      { text: "clean dependency inventory", color: "#f97316" },
    ];
  }

  if (slug.includes("current-host-url")) {
    return [
      { text: "request.base_url", color: "#f8fafc" },
      { text: "root_url", color: "#38bdf8" },
      { text: "include host and port", color: "#fbbf24" },
      { text: "Rails URL helpers", color: "#86efac" },
      { text: "build absolute links", color: "#f97316" },
    ];
  }

  if (slug.includes("hosting-jekyll")) {
    return [
      { text: "jekyll new blog", color: "#f8fafc" },
      { text: "git push origin gh-pages", color: "#38bdf8" },
      { text: "_config.yml", color: "#fbbf24" },
      { text: "GitHub Pages builds static HTML", color: "#86efac" },
      { text: "publish project docs", color: "#f97316" },
    ];
  }

  if (slug.includes("curly-brackets")) {
    return [
      { text: "mkdir -p app/{models,views}", color: "#f8fafc" },
      { text: "touch file{1..3}.txt", color: "#38bdf8" },
      { text: "brace expansion", color: "#fbbf24" },
      { text: "fewer repeated commands", color: "#86efac" },
      { text: "shell syntax worth knowing", color: "#f97316" },
    ];
  }

  if (slug.includes("node-version") && slug.includes("lts")) {
    return [
      { text: "node -v", color: "#f8fafc" },
      { text: "nvm ls-remote --lts", color: "#38bdf8" },
      { text: "check release codename", color: "#fbbf24" },
      { text: "prefer active LTS", color: "#86efac" },
      { text: "avoid unsupported runtime", color: "#f97316" },
    ];
  }

  if (slug.includes("ruby-version-and-gemset")) {
    return [
      { text: "ruby -v", color: "#f8fafc" },
      { text: "rvm current", color: "#38bdf8" },
      { text: ".ruby-version", color: "#fbbf24" },
      { text: ".ruby-gemset", color: "#86efac" },
      { text: "see project context fast", color: "#f97316" },
    ];
  }

  if (slug.includes("keyboard-shortcuts")) {
    return [
      { text: "Ctrl + A  jump to start", color: "#f8fafc" },
      { text: "Ctrl + E  jump to end", color: "#38bdf8" },
      { text: "Ctrl + U  clear line", color: "#fbbf24" },
      { text: "Ctrl + R  reverse search", color: "#86efac" },
      { text: "move faster in terminal", color: "#f97316" },
    ];
  }

  if (slug.includes("history-with-terminal")) {
    return [
      { text: "history | tail", color: "#f8fafc" },
      { text: "Ctrl + R", color: "#38bdf8" },
      { text: "!!", color: "#fbbf24" },
      { text: "!git", color: "#86efac" },
      { text: "reuse commands safely", color: "#f97316" },
    ];
  }

  if (slug.includes("jquery-plugin")) {
    return [
      { text: "(function($) { ... })(jQuery)", color: "#f8fafc" },
      { text: "$.fn.myPlugin = function()", color: "#38bdf8" },
      { text: "return this.each(...)", color: "#fbbf24" },
      { text: "chainable behavior", color: "#86efac" },
      { text: "package reusable UI logic", color: "#f97316" },
    ];
  }

  if (slug.includes("custom-domain")) {
    return [
      { text: "CNAME -> example.com", color: "#f8fafc" },
      { text: "A records point to GitHub", color: "#38bdf8" },
      { text: "static site on Pages", color: "#fbbf24" },
      { text: "commit CNAME file", color: "#86efac" },
      { text: "custom domain goes live", color: "#f97316" },
    ];
  }

  if (slug.includes("setup-nodejs")) {
    return [
      { text: "curl -fsSL nodesource setup", color: "#f8fafc" },
      { text: "sudo apt install nodejs", color: "#38bdf8" },
      { text: "npm config set prefix", color: "#fbbf24" },
      { text: "avoid npm as root", color: "#86efac" },
      { text: "node -v && npm -v", color: "#f97316" },
    ];
  }

  if (slug.includes("better-use-of-rvm")) {
    return [
      { text: "rvm use ruby@gemset", color: "#f8fafc" },
      { text: "path is not properly set up", color: "#f97316" },
      { text: "source ~/.rvm/scripts/rvm", color: "#38bdf8" },
      { text: "fix shell initialization", color: "#fbbf24" },
      { text: "Ruby env becomes predictable", color: "#86efac" },
    ];
  }

  if (slug.includes("one-minute-manager")) {
    return [
      { text: "one-minute goals", color: "#f8fafc" },
      { text: "one-minute praise", color: "#38bdf8" },
      { text: "one-minute redirects", color: "#fbbf24" },
      { text: "serve people effectively", color: "#86efac" },
      { text: "management notes", color: "#f97316" },
    ];
  }

  if (slug.includes("setup-new-rails-project")) {
    return [
      { text: "rails new app -T", color: "#f8fafc" },
      { text: "bundle add rspec-rails", color: "#38bdf8" },
      { text: "rails g rspec:install", color: "#fbbf24" },
      { text: "configure test stack early", color: "#86efac" },
      { text: "start with a clean baseline", color: "#f97316" },
    ];
  }

  if (slug.includes("comparison-operators")) {
    return [
      { text: "==  equality", color: "#f8fafc" },
      { text: "=== strict equality", color: "#38bdf8" },
      { text: "!=  not equal", color: "#fbbf24" },
      { text: "!== strict not equal", color: "#86efac" },
      { text: "prefer explicit comparisons", color: "#f97316" },
    ];
  }

  if (slug.includes("js-debugger")) {
    return [
      { text: "debugger;", color: "#f8fafc" },
      { text: "pause at runtime", color: "#38bdf8" },
      { text: "inspect variables", color: "#fbbf24" },
      { text: "step over / step into", color: "#86efac" },
      { text: "browser devtools as microscope", color: "#f97316" },
    ];
  }

  if (slug.includes("variable-declarations")) {
    return [
      { text: "const first", color: "#f8fafc" },
      { text: "let when reassigned", color: "#38bdf8" },
      { text: "avoid var", color: "#f97316" },
      { text: "declare near usage", color: "#fbbf24" },
      { text: "make scope obvious", color: "#86efac" },
    ];
  }

  if (slug.includes("continuous-integration")) {
    return [
      { text: "commit -> build -> test", color: "#f8fafc" },
      { text: "continuous integration", color: "#38bdf8" },
      { text: "continuous delivery", color: "#fbbf24" },
      { text: "continuous deployment", color: "#86efac" },
      { text: "automation changes risk", color: "#f97316" },
    ];
  }

  if (slug.includes("estimating-as-a-programmer")) {
    return [
      { text: "break work into slices", color: "#f8fafc" },
      { text: "unknowns drive risk", color: "#38bdf8" },
      { text: "estimate ranges, not wishes", color: "#fbbf24" },
      { text: "track actuals", color: "#86efac" },
      { text: "improve with feedback", color: "#f97316" },
    ];
  }

  if (slug.includes("ping-pong-pair-programming")) {
    return [
      { text: "A writes failing test", color: "#f8fafc" },
      { text: "B makes it pass", color: "#38bdf8" },
      { text: "swap roles", color: "#fbbf24" },
      { text: "red green refactor together", color: "#86efac" },
      { text: "pairing as cadence", color: "#f97316" },
    ];
  }

  if (slug.includes("debugging-strategies")) {
    return [
      { text: "reproduce first", color: "#f8fafc" },
      { text: "make the failure smaller", color: "#38bdf8" },
      { text: "inspect state", color: "#fbbf24" },
      { text: "change one thing", color: "#86efac" },
      { text: "verify the fix", color: "#f97316" },
    ];
  }

  if (slug.includes("combined-vs-independent")) {
    return [
      { text: "var a, b, c", color: "#f8fafc" },
      { text: "let count = 0", color: "#38bdf8" },
      { text: "const name = 'Prakash'", color: "#fbbf24" },
      { text: "one declaration per idea", color: "#86efac" },
      { text: "readability beats cleverness", color: "#f97316" },
    ];
  }

  if (slug.includes("reduce-global-variables")) {
    return [
      { text: "avoid window.state", color: "#f8fafc" },
      { text: "wrap code in modules", color: "#38bdf8" },
      { text: "pass dependencies in", color: "#fbbf24" },
      { text: "keep scope local", color: "#86efac" },
      { text: "globals leak complexity", color: "#f97316" },
    ];
  }

  if (slug.includes("four-types-of-duplication")) {
    return [
      { text: "imposed duplication", color: "#f8fafc" },
      { text: "inadvertent duplication", color: "#38bdf8" },
      { text: "impatient duplication", color: "#fbbf24" },
      { text: "interdeveloper duplication", color: "#86efac" },
      { text: "DRY needs judgment", color: "#f97316" },
    ];
  }

  if (slug.includes("cross-origin") && slug.includes("fonts")) {
    return [
      { text: "add_header Access-Control-Allow-Origin *", color: "#f8fafc" },
      { text: "font blocked by CORS", color: "#f97316" },
      { text: "serve assets through nginx", color: "#38bdf8" },
      { text: "woff / ttf need headers", color: "#fbbf24" },
      { text: "fonts render across domains", color: "#86efac" },
    ];
  }

  if (slug.includes("chitika-ads-responsive")) {
    return [
      { text: "read container width", color: "#f8fafc" },
      { text: "choose ad size safely", color: "#38bdf8" },
      { text: "avoid layout overflow", color: "#fbbf24" },
      { text: "responsive ad slot", color: "#86efac" },
      { text: "small script, better fit", color: "#f97316" },
    ];
  }

  if (slug.includes("installing-puma")) {
    return [
      { text: "gem install puma", color: "#f8fafc" },
      { text: "native extension compile", color: "#38bdf8" },
      { text: "macOS Sierra headers", color: "#fbbf24" },
      { text: "bundle install passes", color: "#86efac" },
      { text: "Rails server boots", color: "#f97316" },
    ];
  }

  if (slug.includes("guake-like-dropdown-terminal")) {
    return [
      { text: "iTerm2 hotkey window", color: "#f8fafc" },
      { text: "drop down from top", color: "#38bdf8" },
      { text: "one key terminal access", color: "#fbbf24" },
      { text: "macOS workflow", color: "#86efac" },
      { text: "Guake-style setup", color: "#f97316" },
    ];
  }

  if (slug.includes("personal-wiki")) {
    return [
      { text: "gem install gollum", color: "#f8fafc" },
      { text: "git-backed wiki", color: "#38bdf8" },
      { text: "markdown notes", color: "#fbbf24" },
      { text: "search personal knowledge", color: "#86efac" },
      { text: "keep notes close to code", color: "#f97316" },
    ];
  }

  if (slug.includes("ie-alternative-to-includes")) {
    return [
      { text: "array.indexOf(item) !== -1", color: "#f8fafc" },
      { text: "String#indexOf fallback", color: "#38bdf8" },
      { text: "IE has no includes()", color: "#f97316" },
      { text: "write compatible checks", color: "#fbbf24" },
      { text: "old browser, simple fallback", color: "#86efac" },
    ];
  }

  if (slug.includes("scrapping-kaymu")) {
    return [
      { text: "Nokogiri::HTML(response)", color: "#f8fafc" },
      { text: "css('.product-price')", color: "#38bdf8" },
      { text: "extract product data", color: "#fbbf24" },
      { text: "clean scraped prices", color: "#86efac" },
      { text: "Ruby scraper experiment", color: "#f97316" },
    ];
  }

  if (slug.includes("install-hipchat")) {
    return [
      { text: "download HipChat package", color: "#f8fafc" },
      { text: "sudo dpkg -i hipchat.deb", color: "#38bdf8" },
      { text: "sudo apt -f install", color: "#fbbf24" },
      { text: "Ubuntu 16.04 desktop", color: "#86efac" },
      { text: "team chat installed", color: "#f97316" },
    ];
  }

  if (slug.includes("pretend-with-rails-generator")) {
    return [
      { text: "rails g model Post --pretend", color: "#f8fafc" },
      { text: "preview generated files", color: "#38bdf8" },
      { text: "detect conflicts first", color: "#fbbf24" },
      { text: "no files written", color: "#86efac" },
      { text: "safer generator runs", color: "#f97316" },
    ];
  }

  if (slug.includes("cleaning-up-linux-kernels")) {
    return [
      { text: "uname -r", color: "#f8fafc" },
      { text: "dpkg --list | grep linux-image", color: "#38bdf8" },
      { text: "remove old kernels", color: "#fbbf24" },
      { text: "free /boot space", color: "#86efac" },
      { text: "keep current kernel safe", color: "#f97316" },
    ];
  }

  if (slug.includes("install-watchman")) {
    return [
      { text: "git clone facebook/watchman", color: "#f8fafc" },
      { text: "./autogen.sh && ./configure", color: "#38bdf8" },
      { text: "make && sudo make install", color: "#fbbf24" },
      { text: "watch file changes", color: "#86efac" },
      { text: "Ubuntu dev setup", color: "#f97316" },
    ];
  }

  if (slug.includes("js-equivalent-of-send")) {
    return [
      { text: "object[methodName]()", color: "#f8fafc" },
      { text: "dynamic dispatch in JS", color: "#38bdf8" },
      { text: "Ruby send idea", color: "#fbbf24" },
      { text: "call by property name", color: "#86efac" },
      { text: "keep allowed methods explicit", color: "#f97316" },
    ];
  }

  if (slug.includes("specific-rails-version")) {
    return [
      { text: "rails _4.2.6_ new app", color: "#f8fafc" },
      { text: "gem install rails -v 4.2.6", color: "#38bdf8" },
      { text: "pin framework version", color: "#fbbf24" },
      { text: "generate exact baseline", color: "#86efac" },
      { text: "avoid accidental upgrades", color: "#f97316" },
    ];
  }

  if (slug.includes("rbenv-work-with-zsh")) {
    return [
      { text: "eval \"$(rbenv init - zsh)\"", color: "#f8fafc" },
      { text: "export PATH=\"$HOME/.rbenv/bin:$PATH\"", color: "#38bdf8" },
      { text: "zsh reads the right hook", color: "#fbbf24" },
      { text: "ruby -v matches project", color: "#86efac" },
      { text: "shell setup matters", color: "#f97316" },
    ];
  }

  if (slug.includes("upgrade-nodejs-using-npm")) {
    return [
      { text: "sudo npm cache clean -f", color: "#f8fafc" },
      { text: "sudo npm install -g n", color: "#38bdf8" },
      { text: "sudo n stable", color: "#fbbf24" },
      { text: "node -v", color: "#86efac" },
      { text: "upgrade runtime carefully", color: "#f97316" },
    ];
  }

  if (slug.includes("install-rmagick")) {
    return [
      { text: "sudo apt install imagemagick", color: "#f8fafc" },
      { text: "sudo apt install libmagickwand-dev", color: "#38bdf8" },
      { text: "gem install rmagick", color: "#fbbf24" },
      { text: "native extension builds", color: "#86efac" },
      { text: "image tools for Ruby", color: "#f97316" },
    ];
  }

  if (slug.includes("send-method-in-ruby")) {
    return [
      { text: "object.send(method_name)", color: "#f8fafc" },
      { text: "replace conditional branches", color: "#38bdf8" },
      { text: "map action to method", color: "#fbbf24" },
      { text: "Ruby dynamic dispatch", color: "#86efac" },
      { text: "keep inputs controlled", color: "#f97316" },
    ];
  }

  if (slug.includes("engineyard")) {
    return [
      { text: "restart unicorn", color: "#f8fafc" },
      { text: "utility instance changed", color: "#38bdf8" },
      { text: "background jobs lost Redis", color: "#f97316" },
      { text: "refresh app connections", color: "#fbbf24" },
      { text: "deployment topology matters", color: "#86efac" },
    ];
  }

  if (slug.includes("binary-to-octal")) {
    return [
      { text: "binary: 101101", color: "#f8fafc" },
      { text: "group bits by three", color: "#38bdf8" },
      { text: "101 101", color: "#fbbf24" },
      { text: "octal: 55", color: "#86efac" },
      { text: "base conversion step by step", color: "#f97316" },
    ];
  }

  if (slug.includes("running-shell-command")) {
    return [
      { text: "system('ls -la')", color: "#f8fafc" },
      { text: "`git status`", color: "#38bdf8" },
      { text: "capture stdout", color: "#fbbf24" },
      { text: "run shell from Ruby", color: "#86efac" },
      { text: "check exit status", color: "#f97316" },
    ];
  }

  if (slug.includes("unresolved-gem-specification")) {
    return [
      { text: "Gem::Specification.reset warning", color: "#f8fafc" },
      { text: "gem cleanup", color: "#38bdf8" },
      { text: "remove duplicate versions", color: "#fbbf24" },
      { text: "Jekyll boots cleanly", color: "#86efac" },
      { text: "dependency hygiene", color: "#f97316" },
    ];
  }

  return [
    { text: "read the problem", color: "#f8fafc" },
    { text: "trace the failure", color: "#38bdf8" },
    { text: "try the smallest fix", color: "#fbbf24" },
    { text: "verify the result", color: "#86efac" },
    { text: "write it down", color: "#f97316" },
  ];
}

function loadFirstExistingFont(paths) {
  const path = paths.find((candidate) => existsSync(candidate));

  if (!path) {
    fail(`No usable font found. Tried:\n${paths.join("\n")}`);
  }

  return readFileSync(path);
}

function fail(message) {
  console.error(`render-blog-header: ${message}`);
  process.exit(1);
}
