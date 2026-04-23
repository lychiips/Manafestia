# Hibachi-Mana-2026-Birthday

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_jPlnH48sEFlcr5CY1cI6in2RYhYn)

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser for local development


# Game Developer Contributor Options
## Option 1: Develop in a separate repo (and have Chii integrate the game)
For anyone that just wants to focus on developing the game and not worry about any sort of web development issues, you can develop your game completely separately from this repo. You can use any method you want to deploy/test your game such as using itch.io. In the end, Chii will take your game and integrate it in the website. If you choose this option, please reach out to Chii about your development stack so she can ensure the compatibility with the website.

## Option 2: Develop on a branch (and integrate the game yourself)
The main branch is protected so all PR's must be approved by Chii before merging. If you develop directly in the repo please use the components in components/game-layout.tsx so that there is standardized formatting across all games. If you would like your game to be a full screen game or think it will not fit on a background, please reach out to Chii. Refer to app/example-game/page.tsx for an example use case of the componenets. Both the pong and snake games also use the template if you need more examples. 
You do not need to worry about including the game in the main page (the web developers will handle that). Just export your page in the tsx and we will handle the rest.