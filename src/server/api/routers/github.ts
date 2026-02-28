import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  getUserRepositories,
  getRepositoryContents,
  getFileContent,
  buildFileTree,
  parseRepoUrl,
  type GitHubRepo,
  type GitHubFileTree,
} from "@/server/github/github-service";

async function getGitHubAccessToken(userId: string): Promise<string | null> {
  const account = await db.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  return account?.accessToken ?? null;
}

export const githubRouter = createTRPCRouter({
  getRepositories: protectedProcedure.query(
    async ({ ctx }): Promise<GitHubRepo[]> => {
      const accessToken = await getGitHubAccessToken(ctx.session.user.id);

      if (!accessToken) {
        throw new Error(
          "GitHub account not connected. Please sign in with GitHub.",
        );
      }

      return getUserRepositories(accessToken);
    },
  ),

  getRepoContents: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string(),
        path: z.string().optional().default(""),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<GitHubFileTree[]> => {
      const accessToken = await getGitHubAccessToken(ctx.session.user.id);

      if (!accessToken) {
        throw new Error("GitHub account not connected.");
      }

      const parsed = parseRepoUrl(input.repoUrl);
      if (!parsed) {
        throw new Error("Invalid repository URL");
      }

      const contents = await getRepositoryContents(
        accessToken,
        parsed.owner,
        parsed.repo,
        input.path,
      );

      return buildFileTree(contents);
    }),

  getFileContent: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string(),
        path: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<string | null> => {
      const accessToken = await getGitHubAccessToken(ctx.session.user.id);

      if (!accessToken) {
        throw new Error("GitHub account not connected.");
      }

      const parsed = parseRepoUrl(input.repoUrl);
      if (!parsed) {
        throw new Error("Invalid repository URL");
      }

      return getFileContent(accessToken, parsed.owner, parsed.repo, input.path);
    }),

  isConnected: protectedProcedure.query(async ({ ctx }): Promise<boolean> => {
    const accessToken = await getGitHubAccessToken(ctx.session.user.id);
    return !!accessToken;
  }),
});
